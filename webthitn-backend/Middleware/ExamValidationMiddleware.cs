using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Middlewares
{
    public class ExamValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExamValidationMiddleware> _logger;

        public ExamValidationMiddleware(RequestDelegate next, ILogger<ExamValidationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
        {
            // Chỉ kiểm tra các endpoint liên quan đến tạo hoặc cập nhật đề thi
            if (ShouldValidateExam(context))
            {
                _logger.LogInformation($"Validating exam for request: {context.Request.Path}");

                // Đọc body của request
                context.Request.EnableBuffering();
                var originalBodyStream = context.Request.Body;
                var requestBody = await ReadRequestBodyAsync(context.Request);

                // Parse dữ liệu đề thi từ body
                try
                {
                    // Bước 1: Parse dữ liệu đề thi
                    dynamic examData = JsonConvert.DeserializeObject(requestBody);

                    // Bước 2: Thực hiện kiểm tra
                    var validationResult = await ValidateExamAsync(examData, context, dbContext);

                    // Bước 3: Xử lý kết quả kiểm tra
                    if (!validationResult.IsValid)
                    {
                        _logger.LogWarning($"Exam validation failed: {validationResult.Message}");
                        await WriteResponseAsync(context, 400, new
                        {
                            Success = false,
                            Message = validationResult.Message,
                            ValidationErrors = validationResult.Errors
                        });
                        return;
                    }

                    // Bước 4: Nếu hợp lệ, trả lại body để tiếp tục xử lý
                    context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(requestBody));
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error parsing exam data: {ex.Message}");
                    await WriteResponseAsync(context, 400, new
                    {
                        Success = false,
                        Message = "Lỗi định dạng dữ liệu đề thi"
                    });
                    return;
                }
                finally
                {
                    context.Request.Body = originalBodyStream;
                }
            }

            // Gọi middleware tiếp theo
            await _next(context);
        }

        private bool ShouldValidateExam(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower();
            var method = context.Request.Method;

            return (path?.Contains("/api/exams") == true || path?.Contains("/api/tests") == true) &&
                  (method == "POST" || method == "PUT") &&
                  !path.Contains("feedback") &&
                  !path.Contains("results");
        }

        private async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            using (var reader = new StreamReader(
                request.Body,
                encoding: Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                leaveOpen: true))
            {
                var body = await reader.ReadToEndAsync();
                request.Body.Position = 0;
                return body;
            }
        }

        private async Task WriteResponseAsync(HttpContext context, int statusCode, object content)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonConvert.SerializeObject(content));
        }

        private async Task<ValidationResult> ValidateExamAsync(dynamic examData, HttpContext context, ApplicationDbContext dbContext)
        {
            var result = new ValidationResult { IsValid = true };

            try
            {
                // 1. Kiểm tra các trường bắt buộc
                if (examData.title == null || string.IsNullOrWhiteSpace(examData.title.ToString()))
                {
                    result.AddError("title", "Tiêu đề đề thi không được để trống");
                }

                if (examData.subjectId == null || (int)examData.subjectId <= 0)
                {
                    result.AddError("subjectId", "Môn học không hợp lệ");
                }

                if (examData.duration == null || (int)examData.duration <= 0)
                {
                    result.AddError("duration", "Thời gian làm bài phải lớn hơn 0");
                }

                // 2. Kiểm tra câu hỏi
                var hasQuestions = false;
                var questions = new System.Collections.Generic.List<dynamic>();

                // Trích xuất câu hỏi từ các cấu trúc khác nhau trong các API khác nhau
                if (examData.questions != null)
                {
                    hasQuestions = true;
                    foreach (var q in examData.questions)
                    {
                        questions.Add(q);
                    }
                }
                else if (examData.examQuestions != null)
                {
                    hasQuestions = true;
                    foreach (var eq in examData.examQuestions)
                    {
                        questions.Add(eq);
                    }
                }
                else if (examData.criteria != null) // Tạo đề theo cấu trúc
                {
                    // Với API tạo đề theo cấu trúc, không cần kiểm tra câu hỏi trước
                    hasQuestions = true;
                }

                if (!hasQuestions)
                {
                    result.AddError("questions", "Đề thi phải có ít nhất một câu hỏi");
                }
                else if (questions.Any())
                {
                    // Kiểm tra từng câu hỏi
                    var processedQuestionIds = new System.Collections.Generic.HashSet<int>();
                    decimal totalScore = 0;

                    foreach (var question in questions)
                    {
                        // Trích xuất ID câu hỏi (có thể nằm ở questionId hoặc id)
                        int questionId = 0;
                        if (question.questionId != null)
                            questionId = (int)question.questionId;
                        else if (question.id != null)
                            questionId = (int)question.id;

                        if (questionId <= 0)
                        {
                            result.AddError("questions", "Có câu hỏi không hợp lệ trong đề thi");
                            continue;
                        }

                        // Kiểm tra trùng lặp
                        if (processedQuestionIds.Contains(questionId))
                        {
                            result.AddError("questions", $"Câu hỏi ID: {questionId} bị trùng lặp trong đề thi");
                            continue;
                        }

                        processedQuestionIds.Add(questionId);

                        // Kiểm tra câu hỏi tồn tại trong CSDL
                        var dbQuestion = await dbContext.Questions
                            .Include(q => q.Options)
                            .FirstOrDefaultAsync(q => q.Id == questionId);

                        if (dbQuestion == null)
                        {
                            result.AddError("questions", $"Câu hỏi ID: {questionId} không tồn tại");
                            continue;
                        }

                        if (!dbQuestion.IsActive)
                        {
                            result.AddError("questions", $"Câu hỏi ID: {questionId} không còn hoạt động");
                            continue;
                        }

                        // Kiểm tra câu hỏi có đáp án hợp lệ
                        if (dbQuestion.Options == null || !dbQuestion.Options.Any())
                        {
                            result.AddError("questions", $"Câu hỏi ID: {questionId} không có đáp án");
                            continue;
                        }

                        if (dbQuestion.QuestionType == 1 && dbQuestion.Options.Count(o => o.IsCorrect) != 1)
                        {
                            result.AddError("questions", $"Câu hỏi trắc nghiệm ID: {questionId} phải có đúng một đáp án đúng");
                            continue;
                        }

                        // Tính điểm
                        decimal score = dbQuestion.DefaultScore;
                        if (question.score != null)
                        {
                            score = (decimal)question.score;
                        }

                        totalScore += score;
                    }

                    // Kiểm tra tổng số câu hỏi
                    if (processedQuestionIds.Count < 3)
                    {
                        result.AddError("questions", $"Đề thi phải có ít nhất 3 câu hỏi (hiện tại: {processedQuestionIds.Count})");
                    }

                    // Đảm bảo tổng điểm > 0
                    if (totalScore <= 0)
                    {
                        result.AddError("totalScore", "Tổng điểm của đề thi phải lớn hơn 0");
                    }
                }

                // 3. Kiểm tra quyền của người dùng
                var userIdClaim = context.User.FindFirst("userId") ??
                                  context.User.FindFirst("UserId") ??
                                  context.User.FindFirst("userid");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    result.AddError("user", "Không xác định được người dùng");
                }
                else
                {
                    var user = await dbContext.Users.FindAsync(userId);
                    if (user == null)
                    {
                        result.AddError("user", "Người dùng không tồn tại");
                    }
                    else if (!context.User.IsInRole("Admin") && !context.User.IsInRole("Teacher"))
                    {
                        result.AddError("user", "Bạn không có quyền tạo hoặc cập nhật đề thi");
                    }
                }

                // 4. Kiểm tra môn học tồn tại
                if (examData.subjectId != null && (int)examData.subjectId > 0)
                {
                    var subject = await dbContext.Subjects.FindAsync((int)examData.subjectId);
                    if (subject == null)
                    {
                        result.AddError("subjectId", $"Môn học với ID: {(int)examData.subjectId} không tồn tại");
                    }

                    // Nếu đang cập nhật đề thi (kiểm tra từ URL)
                    string path = context.Request.Path.Value ?? "";
                    if (context.Request.Method == "PUT" && int.TryParse(path.Split('/').LastOrDefault(), out int examId))
                    {
                        var existingExam = await dbContext.Exams.FindAsync(examId);
                        if (existingExam != null && existingExam.SubjectId != (int)examData.subjectId)
                        {
                            result.AddError("subjectId", "Không được phép thay đổi môn học khi cập nhật đề thi");
                        }
                    }
                }

                // 5. Kiểm tra điểm đạt
                if (examData.passScore != null && examData.totalScore != null &&
                    (decimal)examData.passScore > (decimal)examData.totalScore)
                {
                    result.AddError("passScore", "Điểm đạt không thể lớn hơn tổng điểm");
                }

                // 6. Kiểm tra loại đề thi
                if (examData.examTypeId != null && (int)examData.examTypeId > 0)
                {
                    var examType = await dbContext.ExamTypes.FindAsync((int)examData.examTypeId);
                    if (examType == null)
                    {
                        result.AddError("examTypeId", $"Loại đề thi với ID: {(int)examData.examTypeId} không tồn tại");
                    }
                }

                // Tóm tắt kết quả kiểm tra
                if (result.Errors.Any())
                {
                    result.IsValid = false;
                    result.Message = $"Đề thi không hợp lệ: {result.Errors.Count} lỗi được tìm thấy";
                }
                else
                {
                    result.Message = "Đề thi hợp lệ";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error validating exam: {ex.Message}");
                result.IsValid = false;
                result.Message = "Lỗi khi kiểm tra đề thi";
                result.AddError("general", ex.Message);
            }

            return result;
        }

        private class ValidationResult
        {
            public bool IsValid { get; set; }
            public string Message { get; set; }
            public System.Collections.Generic.Dictionary<string, string> Errors { get; } = new System.Collections.Generic.Dictionary<string, string>();

            public void AddError(string field, string message)
            {
                Errors[field] = message;
            }
        }
    }
}