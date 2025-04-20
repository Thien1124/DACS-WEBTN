using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// API xuất kết quả bài thi
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Teacher")]
    public class ResultsExportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ResultsExportController> _logger;

        /// <summary>
        /// Khởi tạo controller với các dependency
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="logger">Logger service</param>
        public ResultsExportController(ApplicationDbContext context, ILogger<ResultsExportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Xuất kết quả bài thi ra file CSV
        /// </summary>
        /// <remarks>
        /// API này cho phép xuất kết quả của bài thi ra file CSV.
        /// 
        /// Sample request:
        /// 
        ///     GET /api/results/export?examId=1&includeAnswers=false
        /// 
        /// </remarks>
        /// <param name="examId">ID của bài thi cần xuất kết quả</param>
        /// <param name="includeAnswers">Bao gồm câu trả lời chi tiết (mặc định: false)</param>
        /// <param name="startDate">Lọc từ ngày (định dạng yyyy-MM-dd)</param>
        /// <param name="endDate">Lọc đến ngày (định dạng yyyy-MM-dd)</param>
        /// <param name="completedOnly">Chỉ xuất kết quả đã hoàn thành (mặc định: true)</param>
        /// <returns>File CSV chứa kết quả bài thi</returns>
        /// <response code="200">Tải file CSV thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="401">Không có quyền truy cập</response>
        /// <response code="404">Không tìm thấy bài thi</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpGet("export")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExportResults(
            [FromQuery] int examId,
            [FromQuery] bool includeAnswers = false,
            [FromQuery] string startDate = null,
            [FromQuery] string endDate = null,
            [FromQuery] bool completedOnly = true)
        {
            try
            {
                _logger.LogInformation("Xuất kết quả bài thi ID: {0}", examId);

                // Kiểm tra quyền truy cập
                int currentUserId = GetCurrentUserId();
                if (currentUserId <= 0)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                // Kiểm tra bài thi tồn tại
                var exam = await _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.ExamType)
                    .FirstOrDefaultAsync(e => e.Id == examId);

                if (exam == null)
                {
                    _logger.LogWarning("Không tìm thấy bài thi ID: {0}", examId);
                    return NotFound(new { message = "Không tìm thấy bài thi" });
                }

                // Kiểm tra quyền truy cập (chỉ admin hoặc giáo viên tạo đề mới được xuất kết quả)
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = exam.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    return StatusCode(403, new { message = "Bạn không có quyền xuất kết quả bài thi này" });
                }

                // Xây dựng truy vấn
                var query = _context.ExamResults
                    .Include(er => er.Student)
                    .Include(er => er.StudentAnswers)
                        .ThenInclude(sa => sa.Question)
                            .ThenInclude(q => q.Options)
                    .Where(er => er.ExamId == examId);

                // Lọc theo trạng thái hoàn thành
                if (completedOnly)
                {
                    query = query.Where(er => er.IsCompleted);
                }

                // Lọc theo ngày bắt đầu nếu có
                if (!string.IsNullOrWhiteSpace(startDate) && DateTime.TryParse(startDate, out DateTime startDateTime))
                {
                    query = query.Where(er => er.StartedAt >= startDateTime);
                }

                // Lọc theo ngày kết thúc nếu có
                if (!string.IsNullOrWhiteSpace(endDate) && DateTime.TryParse(endDate, out DateTime endDateTime))
                {
                    // Đặt thời gian kết thúc là cuối ngày
                    endDateTime = endDateTime.AddDays(1).AddTicks(-1);
                    query = query.Where(er => er.StartedAt <= endDateTime);
                }

                // Sắp xếp theo thời gian bắt đầu mới nhất
                var results = await query.OrderByDescending(er => er.StartedAt).ToListAsync();

                if (!results.Any())
                {
                    return Ok(new { message = "Không có kết quả nào phù hợp với điều kiện lọc" });
                }

                // Tạo tên file CSV
                string fileName = $"ket-qua-{exam.Subject.Code}-{DateTime.Now:yyyyMMdd-HHmmss}.csv";
                fileName = fileName.Replace(" ", "_");

                // Tạo stream để ghi file CSV
                MemoryStream memoryStream = new MemoryStream();
                StreamWriter streamWriter = new StreamWriter(memoryStream, System.Text.Encoding.UTF8);

                // Cấu hình CsvWriter với văn hóa Việt Nam
                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    Delimiter = ",",
                    HasHeaderRecord = true,
                };

                CsvWriter csvWriter = new CsvWriter(streamWriter, config);

                // Ghi header cho file CSV
                if (includeAnswers)
                {
                    // Xuất file với câu trả lời chi tiết
                    await WriteDetailedResultsCsv(csvWriter, results, exam);
                }
                else
                {
                    // Xuất file chỉ với thông tin tổng quan
                    await WriteBasicResultsCsv(csvWriter, results, exam);
                }

                await csvWriter.FlushAsync();
                await streamWriter.FlushAsync();

                // Đặt con trỏ về đầu stream
                memoryStream.Position = 0;

                // Trả về file CSV
                return File(memoryStream, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError("Lỗi khi xuất kết quả bài thi: {0}", ex.Message);
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xuất kết quả bài thi", error = ex.Message });
            }
        }

        /// <summary>
        /// Xuất kết quả cơ bản không bao gồm câu trả lời chi tiết
        /// </summary>
        private async Task WriteBasicResultsCsv(CsvWriter csvWriter, List<ExamResult> results, Exam exam)
        {
            // Viết tiêu đề các cột
            csvWriter.WriteField("STT");
            csvWriter.WriteField("Mã học sinh");
            csvWriter.WriteField("Họ tên");
            csvWriter.WriteField("Lần thi");
            csvWriter.WriteField("Thời gian bắt đầu");
            csvWriter.WriteField("Thời gian kết thúc");
            csvWriter.WriteField("Thời gian làm bài (phút)");
            csvWriter.WriteField("Số câu đúng");
            csvWriter.WriteField("Tổng số câu");
            csvWriter.WriteField("Điểm");
            csvWriter.WriteField("Điểm tối đa");
            csvWriter.WriteField("Phần trăm");
            csvWriter.WriteField("Đạt yêu cầu");
            csvWriter.WriteField("Bài làm đã hoàn thành");
            csvWriter.WriteField("Trạng thái");
            csvWriter.NextRecord();

            // Viết dữ liệu từng dòng
            int index = 1;
            foreach (var result in results)
            {
                // Định dạng thời gian làm bài thành phút
                double durationMinutes = result.Duration / 60.0;

                // Xử lý trạng thái
                string gradingStatus = "Không xác định";
                if (result.GradingStatus != null)
                {
                    gradingStatus = result.GradingStatus.ToString();
                }

                csvWriter.WriteField(index.ToString());
                csvWriter.WriteField(result.Student?.Username ?? string.Empty);
                csvWriter.WriteField(result.Student?.FullName ?? string.Empty);
                csvWriter.WriteField(result.AttemptNumber.ToString());
                csvWriter.WriteField(result.StartedAt.ToString("dd/MM/yyyy HH:mm:ss"));
                csvWriter.WriteField(result.CompletedAt?.ToString("dd/MM/yyyy HH:mm:ss") ?? "Chưa hoàn thành");
                csvWriter.WriteField(durationMinutes.ToString("F2"));
                csvWriter.WriteField(result.CorrectAnswers.ToString());
                csvWriter.WriteField(result.TotalQuestions.ToString());
                csvWriter.WriteField(result.Score.ToString("F2"));
                csvWriter.WriteField(exam.TotalScore.ToString("F2"));
                csvWriter.WriteField(result.PercentageScore.ToString("F1"));
                csvWriter.WriteField(result.IsPassed ? "Đạt" : "Không đạt");
                csvWriter.WriteField(result.IsCompleted ? "Đã hoàn thành" : "Chưa hoàn thành");
                csvWriter.WriteField(gradingStatus);
                csvWriter.NextRecord();

                index++;
            }

            await Task.CompletedTask;
        }

        /// <summary>
        /// Xuất kết quả chi tiết bao gồm câu trả lời
        /// </summary>
        private async Task WriteDetailedResultsCsv(CsvWriter csvWriter, List<ExamResult> results, Exam exam)
        {
            // Lấy danh sách câu hỏi của bài thi theo thứ tự
            var examQuestions = await _context.ExamQuestions
                .Include(eq => eq.Question)
                .Where(eq => eq.ExamId == exam.Id)
                .OrderBy(eq => eq.OrderIndex)
                .ToListAsync();

            // Viết tiêu đề các cột
            csvWriter.WriteField("STT");
            csvWriter.WriteField("Mã học sinh");
            csvWriter.WriteField("Họ tên");
            csvWriter.WriteField("Lần thi");
            csvWriter.WriteField("Thời gian bắt đầu");
            csvWriter.WriteField("Thời gian kết thúc");
            csvWriter.WriteField("Thời gian làm bài (phút)");
            csvWriter.WriteField("Số câu đúng");
            csvWriter.WriteField("Tổng số câu");
            csvWriter.WriteField("Điểm");
            csvWriter.WriteField("Điểm tối đa");
            csvWriter.WriteField("Phần trăm");
            csvWriter.WriteField("Đạt yêu cầu");
            csvWriter.WriteField("Bài làm đã hoàn thành");
            csvWriter.WriteField("Trạng thái");

            // Thêm các cột cho từng câu hỏi
            foreach (var examQuestion in examQuestions)
            {
                string questionTitle = "Câu " + examQuestion.OrderIndex.ToString() + " (" + examQuestion.Score.ToString("F2") + " điểm)";
                csvWriter.WriteField(questionTitle);
            }

            csvWriter.NextRecord();

            // Viết dữ liệu từng dòng
            int index = 1;
            foreach (var result in results)
            {
                // Định dạng thời gian làm bài thành phút
                double durationMinutes = result.Duration / 60.0;

                // Xử lý trạng thái
                string gradingStatus = "Không xác định";
                if (result.GradingStatus != null)
                {
                    gradingStatus = result.GradingStatus.ToString();
                }

                // Viết thông tin chung
                csvWriter.WriteField(index.ToString());
                csvWriter.WriteField(result.Student?.Username ?? string.Empty);
                csvWriter.WriteField(result.Student?.FullName ?? string.Empty);
                csvWriter.WriteField(result.AttemptNumber.ToString());
                csvWriter.WriteField(result.StartedAt.ToString("dd/MM/yyyy HH:mm:ss"));
                csvWriter.WriteField(result.CompletedAt?.ToString("dd/MM/yyyy HH:mm:ss") ?? "Chưa hoàn thành");
                csvWriter.WriteField(durationMinutes.ToString("F2"));
                csvWriter.WriteField(result.CorrectAnswers.ToString());
                csvWriter.WriteField(result.TotalQuestions.ToString());
                csvWriter.WriteField(result.Score.ToString("F2"));
                csvWriter.WriteField(exam.TotalScore.ToString("F2"));
                csvWriter.WriteField(result.PercentageScore.ToString("F1"));
                csvWriter.WriteField(result.IsPassed ? "Đạt" : "Không đạt");
                csvWriter.WriteField(result.IsCompleted ? "Đã hoàn thành" : "Chưa hoàn thành");
                csvWriter.WriteField(gradingStatus);

                // Thêm dữ liệu cho từng câu trả lời
                var studentAnswers = result.StudentAnswers.ToDictionary(sa => sa.QuestionId);

                foreach (var examQuestion in examQuestions)
                {
                    // Kiểm tra xem học sinh có trả lời câu hỏi này không
                    if (studentAnswers.TryGetValue(examQuestion.QuestionId, out var answer))
                    {
                        // Định dạng câu trả lời dựa vào loại câu hỏi
                        string answerText = FormatAnswerText(answer);
                        csvWriter.WriteField(answerText);
                    }
                    else
                    {
                        csvWriter.WriteField("Không trả lời");
                    }
                }

                csvWriter.NextRecord();

                index++;
            }
        }

        /// <summary>
        /// Định dạng câu trả lời dựa theo loại câu hỏi
        /// </summary>
        private string FormatAnswerText(StudentAnswer answer)
        {
            try
            {
                // Định dạng dựa vào loại câu hỏi
                int questionType = 0;
                if (answer.Question != null)
                {
                    questionType = answer.Question.QuestionType;
                }

                switch (questionType)
                {
                    case 1: // Trắc nghiệm một đáp án
                        if (answer.SelectedOptionId.HasValue)
                        {
                            var option = answer.Question?.Options?.FirstOrDefault(o => o.Id == answer.SelectedOptionId.Value);
                            if (option != null)
                            {
                                return option.Content + " (" + (answer.IsCorrect ? "Đúng" : "Sai") + ")";
                            }
                            return "Đáp án không hợp lệ";
                        }
                        return "Không chọn";

                    case 3: // Trả lời ngắn
                        if (!string.IsNullOrEmpty(answer.TextAnswer))
                        {
                            string status = answer.IsCorrect ? "Đúng" :
                                         (answer.IsPartiallyCorrect ? "Đúng một phần" : "Sai");
                            return answer.TextAnswer + " (" + status + ")";
                        }
                        return "Không trả lời";

                    case 5: // Đúng-sai nhiều ý
                        string tfStatus = answer.IsCorrect ? "Đúng" :
                                      (answer.IsPartiallyCorrect ? "Đúng một phần" : "Sai");
                        return "Xem chi tiết (" + tfStatus + ")";

                    default:
                        return "Loại câu hỏi không hỗ trợ (" + questionType.ToString() + ")";
                }
            }
            catch (Exception ex)
            {
                return "Lỗi: " + ex.Message;
            }
        }

        /// <summary>
        /// Lấy ID người dùng hiện tại từ token
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null)
            {
                userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
            }

            return userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId) ? userId : 0;
        }
    }
}