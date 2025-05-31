using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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

                try
                {
                    // Log request body để debug
                    _logger.LogDebug($"Request body: {requestBody}");

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
                        Message = "Lỗi định dạng dữ liệu đề thi: " + ex.Message
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

            // Bỏ qua các API không yêu cầu validation đầy đủ
            if (path?.Contains("simple-practice") == true ||
                path?.Contains("practice-fixed") == true ||
                path?.Contains("practice") == true ||  // Exclude all practice endpoints
                path?.Contains("structured") == true ||
                path?.Contains("verify-token") == true ||
                path?.Contains("ping") == true)
            {
                return false;
            }

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
                string path = context.Request.Path.Value?.ToLower() ?? "";
                bool isStructuredExam = path.Contains("structured");
                bool isPracticeExam = path.Contains("practice") && !path.Contains("simple-practice");

                // 1. Kiểm tra các trường bắt buộc
                if (examData.title == null || string.IsNullOrWhiteSpace(examData.title.ToString()))
                {
                    result.AddError("title", "Tiêu đề đề thi không được để trống");
                }

                if (examData.subjectId == null || (int)examData.subjectId <= 0)
                {
                    result.AddError("subjectId", "Môn học không hợp lệ");
                }

                // Duration không bắt buộc cho practice exam
                if (!isPracticeExam && (examData.duration == null || (int)examData.duration <= 0))
                {
                    result.AddError("duration", "Thời gian làm bài phải lớn hơn 0");
                }

                // 2. Kiểm tra câu hỏi
                var hasQuestions = false;
                var questions = new List<dynamic>();

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
                    // Kiểm tra tiêu chí
                    int totalCount = 0;
                    decimal totalPoints = 0;

                    foreach (var criterion in examData.criteria)
                    {
                        if (criterion.count != null && (int)criterion.count > 0)
                        {
                            totalCount += (int)criterion.count;

                            if (criterion.score != null)
                            {
                                totalPoints += (decimal)criterion.score * (int)criterion.count;
                            }
                        }
                    }

                    // Kiểm tra tổng điểm
                    if (examData.totalScore != null && Math.Abs(totalPoints - (decimal)examData.totalScore) > 0.01m)
                    {
                        result.AddError("criteria", $"Tổng điểm theo tiêu chí ({totalPoints}) không khớp với tổng điểm đề thi ({(decimal)examData.totalScore})");
                    }

                    hasQuestions = true;
                }

                if (!hasQuestions)
                {
                    result.AddError("questions", "Đề thi phải có ít nhất một câu hỏi");
                }
                else if (questions.Any())
                {
                    // Sử dụng phương pháp tối ưu hơn để kiểm tra câu hỏi
                    var processedQuestionIds = new HashSet<int>();
                    foreach (var question in questions)
                    {
                        // Trích xuất ID câu hỏi
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
                    }

                    // Sau đó mới truy vấn để kiểm tra tất cả cùng một lúc
                    if (processedQuestionIds.Count > 0)
                    {
                        var dbQuestions = await dbContext.Questions
                            .Where(q => processedQuestionIds.Contains(q.Id))
                            .Include(q => q.Options)
                            .ToDictionaryAsync(q => q.Id, q => q);

                        decimal totalScore = 0;
                        foreach (var questionId in processedQuestionIds)
                        {
                            if (!dbQuestions.TryGetValue(questionId, out var dbQuestion))
                            {
                                result.AddError("questions", $"Câu hỏi ID: {questionId} không tồn tại");
                                continue;
                            }

                            if (!dbQuestion.IsActive)
                            {
                                result.AddError("questions", $"Câu hỏi ID: {questionId} không còn hoạt động");
                                continue;
                            }

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

                            totalScore += dbQuestion.DefaultScore;
                        }

                        // Chỉ áp dụng kiểm tra số lượng câu hỏi tối thiểu cho đề thi thực tế, không phải đề ôn tập
                        if (!isPracticeExam && !path.Contains("simple") && processedQuestionIds.Count < 2)
                        {
                            result.AddError("questions", $"Đề thi phải có ít nhất 2 câu hỏi (hiện tại: {processedQuestionIds.Count})");
                        }

                        if (!isPracticeExam && totalScore <= 0)
                        {
                            result.AddError("totalScore", "Tổng điểm của đề thi phải lớn hơn 0");
                        }
                    }
                }

                // 3. Kiểm tra quyền của người dùng - bỏ qua nếu là API practice đặc biệt
                if (!path.Contains("practice-fixed") && 
                    !path.Contains("simple-practice") &&
                    !path.Contains("structured"))  // THÊM ĐIỀU KIỆN NÀY
                {
                    var userIdClaim = context.User.FindFirst("userId") ??
                                      context.User.FindFirst("UserId") ??
                                      context.User.FindFirst("userid");

                    _logger.LogInformation($"🔍 Middleware user validation - userIdClaim: {userIdClaim?.Value}");

                    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    {
                        _logger.LogError("❌ Middleware: Không tìm thấy userId claim");
                        result.AddError("user", "Không xác định được người dùng");
                    }
                    else
                    {
                        _logger.LogInformation($"🔍 Middleware: Checking user ID {userId} in database");
                        var user = await dbContext.Users.FindAsync(userId);
                        if (user == null)
                        {
                            _logger.LogError($"❌ Middleware: User ID {userId} không tồn tại trong database");
                            result.AddError("user", "Người dùng không tồn tại");
                        }
                        else if (!context.User.IsInRole("Admin") && !context.User.IsInRole("Teacher"))
                        {
                            _logger.LogError($"❌ Middleware: User {userId} không có quyền - Roles: {string.Join(", ", context.User.Claims.Where(c => c.Type.Contains("role")).Select(c => c.Value))}");
                            result.AddError("user", "Bạn không có quyền tạo hoặc cập nhật đề thi");
                        }
                        else
                        {
                            _logger.LogInformation($"✅ Middleware: User {userId} ({user.Username}) validation passed");
                        }
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
                if (!isPracticeExam && examData.examTypeId != null && (int)examData.examTypeId > 0)
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
            public Dictionary<string, string> Errors { get; } = new Dictionary<string, string>();

            public void AddError(string field, string message)
            {
                Errors[field] = message;
            }
        }
    }
}