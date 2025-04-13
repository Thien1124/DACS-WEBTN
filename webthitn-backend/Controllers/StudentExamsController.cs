using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Services;

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// Controller quản lý các chức năng liên quan đến bài thi cho học sinh
    /// </summary>
    [Route("api/student/exams")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentExamsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IExamGradingService _examGradingService;

        /// <summary>
        /// Khởi tạo controller với các service cần thiết
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="examGradingService">Service chấm điểm bài thi</param>
        public StudentExamsController(ApplicationDbContext context, IExamGradingService examGradingService)
        {
            _context = context;
            _examGradingService = examGradingService;
        }

        /// <summary>
        /// Lấy danh sách các bài thi khả dụng cho học sinh
        /// </summary>
        /// <returns>Danh sách bài thi đang hoạt động</returns>
        /// <response code="200">Trả về danh sách bài thi</response>
        /// <response code="404">Không tìm thấy thông tin học sinh</response>
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableExams()
        {
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            // Lấy thông tin học sinh
            var student = await _context.Users
                .Include(u => u.Class)
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (student == null)
            {
                return NotFound("Không tìm thấy thông tin học sinh");
            }

            // Lấy các bài thi phù hợp với học sinh (lớp, môn học,...)
            var exams = await _context.Exams
                .Where(e => e.IsActive) // Chỉ lấy bài thi đang hoạt động
                .Include(e => e.Subject)
                .Include(e => e.ExamType)
                .Include(e => e.ExamQuestions) // Thêm để đếm số câu hỏi
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.Description,
                    SubjectId = e.Subject.Id,
                    SubjectName = e.Subject.Name,
                    ExamTypeId = e.ExamType.Id,
                    ExamTypeName = e.ExamType.Name,
                    e.Duration,
                    TotalQuestions = e.ExamQuestions.Count, // Đếm số lượng câu hỏi
                    e.TotalScore,
                    e.CreatedAt
                })
                .ToListAsync();

            return Ok(exams);
        }

        /// <summary>
        /// Lấy thông tin chi tiết của bài thi và lần làm gần nhất của học sinh
        /// </summary>
        /// <param name="id">Id của bài thi</param>
        /// <returns>Chi tiết bài thi và lần làm gần nhất</returns>
        /// <response code="200">Trả về thông tin chi tiết bài thi</response>
        /// <response code="404">Không tìm thấy bài thi hoặc bài thi không khả dụng</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetExamDetails(int id)
        {
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            // Kiểm tra xem học sinh đã làm bài thi này chưa
            var existingResult = await _context.ExamResults
                .Where(er => er.StudentId == currentUserId && er.ExamId == id)
                .OrderByDescending(er => er.StartedAt)
                .FirstOrDefaultAsync();

            var exam = await _context.Exams
                .Include(e => e.Subject)
                .Include(e => e.ExamType)
                .Include(e => e.ExamQuestions) // Thêm để đếm số câu hỏi
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActive); // Chỉ lấy bài thi đang hoạt động

            if (exam == null)
            {
                return NotFound("Không tìm thấy bài thi hoặc bài thi không khả dụng");
            }

            return Ok(new
            {
                exam.Id,
                exam.Title,
                exam.Description,
                SubjectId = exam.Subject.Id,
                SubjectName = exam.Subject.Name,
                ExamTypeId = exam.ExamType.Id,
                ExamTypeName = exam.ExamType.Name,
                exam.Duration,
                TotalQuestions = exam.ExamQuestions.Count, // Đếm số lượng câu hỏi
                exam.TotalScore,
                exam.CreatedAt,
                HasAttempted = existingResult != null,
                LastAttempt = existingResult != null ? new
                {
                    existingResult.Id,
                    StartTime = existingResult.StartedAt,
                    EndTime = existingResult.CompletedAt,
                    existingResult.Score,
                    existingResult.IsCompleted
                } : null
            });
        }

        /// <summary>
        /// Bắt đầu làm bài thi và tạo bản ghi kết quả mới
        /// </summary>
        /// <param name="id">Id của bài thi</param>
        /// <returns>Thông tin về bài thi đã bắt đầu</returns>
        /// <response code="200">Trả về thông tin kết quả thi mới được tạo</response>
        /// <response code="400">Học sinh đang làm bài thi khác</response>
        /// <response code="404">Không tìm thấy bài thi hoặc bài thi không khả dụng</response>
        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartExam(int id)
        {
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            // Kiểm tra xem bài thi có tồn tại và khả dụng không
            var exam = await _context.Exams
                .Include(e => e.ExamQuestions) // Thêm để đếm số câu hỏi
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActive); // Chỉ lấy bài thi đang hoạt động

            if (exam == null)
            {
                return NotFound("Không tìm thấy bài thi hoặc bài thi không khả dụng");
            }

            // Kiểm tra xem học sinh có đang làm bài thi khác không
            var ongoingExam = await _context.ExamResults
                .FirstOrDefaultAsync(er => er.StudentId == currentUserId && !er.IsCompleted);

            if (ongoingExam != null)
            {
                return BadRequest("Bạn đang làm bài thi khác. Vui lòng hoàn thành hoặc hủy bài thi đó trước.");
            }

            // Xác định số lần làm bài
            int attemptNumber = await _context.ExamResults
                .CountAsync(er => er.ExamId == id && er.StudentId == currentUserId) + 1;

            // Tạo kết quả thi mới
            var startTime = DateTime.UtcNow;
            var examResult = new ExamResult
            {
                ExamId = id,
                StudentId = currentUserId,
                StartedAt = startTime,
                CompletedAt = null,
                IsCompleted = false,
                Score = 0,
                Duration = 0, // Sẽ cập nhật khi hoàn thành
                GradingStatus = 0, // 0: Pending
                IsPassed = false,
                IsSubmittedManually = false,
                TeacherComment = null,
                CorrectAnswers = 0,
                PartiallyCorrectAnswers = 0,
                AnsweredQuestions = 0,
                TotalQuestions = exam.ExamQuestions.Count, // Đếm số lượng câu hỏi
                PendingManualGradeCount = 0,
                PercentageScore = 0,
                AttemptNumber = attemptNumber
            };

            _context.ExamResults.Add(examResult);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                examResultId = examResult.Id,
                StartTime = examResult.StartedAt,
                exam.Duration
            });
        }

        /// <summary>
        /// Lấy danh sách câu hỏi của bài thi
        /// </summary>
        /// <param name="id">Id của bài thi</param>
        /// <returns>Danh sách câu hỏi của bài thi</returns>
        /// <response code="200">Trả về danh sách câu hỏi</response>
        /// <response code="400">Học sinh chưa bắt đầu làm bài thi này hoặc bài thi đã kết thúc</response>
        [HttpGet("{id}/questions")]
        public async Task<IActionResult> GetExamQuestions(int id)
        {
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            // Kiểm tra xem học sinh có đang làm bài thi này không
            var examResult = await _context.ExamResults
                .FirstOrDefaultAsync(er => er.StudentId == currentUserId && er.ExamId == id && !er.IsCompleted);

            if (examResult == null)
            {
                return BadRequest("Bạn chưa bắt đầu làm bài thi này hoặc bài thi đã kết thúc");
            }

            // Lấy danh sách câu hỏi
            var questions = await _context.ExamQuestions
                .Where(eq => eq.ExamId == id)
                .Include(eq => eq.Question)
                    .ThenInclude(q => q.Options)
                .Select(eq => new
                {
                    eq.QuestionId,
                    QuestionText = eq.Question.Content, // Sử dụng Content thay vì QuestionText
                    eq.Question.QuestionType,
                    eq.Score,
                    Options = eq.Question.Options.Select(o => new
                    {
                        o.Id,
                        OptionText = o.Content, // Sử dụng Content thay vì OptionText
                        o.Label
                        // Không trả về IsCorrect để tránh lộ đáp án
                    }).ToList()
                })
                .ToListAsync();

            return Ok(questions);
        }

        /// <summary>
        /// Nộp bài thi và chấm điểm
        /// </summary>
        /// <param name="id">Id của bài thi</param>
        /// <param name="submitDto">Dữ liệu nộp bài</param>
        /// <returns>Kết quả chấm điểm</returns>
        /// <response code="200">Trả về kết quả chấm điểm</response>
        /// <response code="400">Dữ liệu không hợp lệ hoặc có lỗi khi chấm điểm</response>
        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitExam(int id, [FromBody] SubmitExamDTO submitDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            try
            {
                // Kiểm tra xem học sinh có đang làm bài thi này không
                var examResult = await _context.ExamResults
                    .FirstOrDefaultAsync(er => er.StudentId == currentUserId && er.ExamId == id && !er.IsCompleted);

                if (examResult == null)
                {
                    return BadRequest("Bạn chưa bắt đầu làm bài thi này hoặc bài thi đã kết thúc");
                }

                // Đảm bảo rằng ExamId trong submitDto khớp với id trong URL
                submitDto.ExamId = id;

                // Chấm điểm và lưu kết quả
                var result = await _examGradingService.GradeAndSaveExamResult(submitDto, currentUserId);

                if (result == null)
                {
                    return BadRequest("Có lỗi xảy ra khi chấm điểm bài thi");
                }

                return Ok(new
                {
                    message = "Nộp bài thành công",
                    examResultId = result.Id,
                    score = result.Score,
                    isCompleted = result.IsCompleted,
                    needsGrading = result.GradingStatus == 0, // 0: Pending
                    isPassed = result.IsPassed
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Lấy danh sách kết quả bài thi của học sinh
        /// </summary>
        /// <returns>Danh sách kết quả bài thi</returns>
        /// <response code="200">Trả về danh sách kết quả bài thi</response>
        [HttpGet("results")]
        public async Task<IActionResult> GetStudentResults()
        {
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            // Lấy các kết quả bài thi của học sinh
            var results = await _context.ExamResults
                .Where(r => r.StudentId == currentUserId && r.IsCompleted)
                .Include(r => r.Exam)
                    .ThenInclude(e => e.Subject)
                .Include(r => r.Exam)
                    .ThenInclude(e => e.ExamType)
                .OrderByDescending(r => r.CompletedAt)
                .Select(r => new
                {
                    r.Id,
                    r.ExamId,
                    ExamTitle = r.Exam.Title,
                    SubjectName = r.Exam.Subject.Name,
                    ExamTypeName = r.Exam.ExamType.Name,
                    r.Score,
                    r.PercentageScore,
                    r.IsPassed,
                    r.StartedAt,
                    r.CompletedAt,
                    r.Duration,
                    DurationFormatted = FormatDuration(r.Duration),
                    r.CorrectAnswers,
                    r.PartiallyCorrectAnswers,
                    r.TotalQuestions,
                    r.GradingStatus,
                    r.AttemptNumber
                })
                .ToListAsync();

            return Ok(results);
        }

        /// <summary>
        /// Lấy chi tiết kết quả bài thi của học sinh
        /// </summary>
        /// <param name="id">Id của kết quả bài thi</param>
        /// <returns>Chi tiết kết quả bài thi</returns>
        /// <response code="200">Trả về chi tiết kết quả bài thi</response>
        /// <response code="400">Có lỗi xảy ra khi lấy chi tiết kết quả bài thi</response>
        /// <response code="404">Không tìm thấy kết quả bài thi</response>
        [HttpGet("results/{id}")]
        public async Task<IActionResult> GetStudentResultDetail(int id)
        {
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            // Lấy kết quả bài thi cụ thể
            var result = await _context.ExamResults
                .Include(r => r.Exam)
                .FirstOrDefaultAsync(r => r.Id == id && r.StudentId == currentUserId);

            if (result == null)
            {
                return NotFound("Không tìm thấy kết quả bài thi");
            }

            // Lấy chi tiết kết quả bài thi
            var detailResult = await _examGradingService.GetExamResultDetail(result, false);

            if (detailResult == null)
            {
                return BadRequest("Có lỗi xảy ra khi lấy chi tiết kết quả bài thi");
            }

            return Ok(detailResult);
        }

        /// <summary>
        /// Định dạng thời gian từ giây sang định dạng phút:giây
        /// </summary>
        /// <param name="seconds">Thời gian tính bằng giây</param>
        /// <returns>Chuỗi thời gian theo định dạng HH:MM:SS hoặc MM:SS</returns>
        private static string FormatDuration(int seconds)
        {
            var timeSpan = TimeSpan.FromSeconds(seconds);
            return timeSpan.Hours > 0
                ? $"{timeSpan.Hours}:{timeSpan.Minutes:D2}:{timeSpan.Seconds:D2}"
                : $"{timeSpan.Minutes:D2}:{timeSpan.Seconds:D2}";
        }
    }
}