using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Services;
using System.Globalization;
using WEBTHITN_Backend.Helpers;

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// API quản lý kết quả bài thi
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ResultsController> _logger;
        private readonly IExamGradingService _gradingService;

        public ResultsController(
            ApplicationDbContext context,
            ILogger<ResultsController> logger,
            IExamGradingService gradingService)
        {
            _context = context;
            _logger = logger;
            _gradingService = gradingService;
        }

        /// <summary>
        /// Nộp bài và tính điểm
        /// </summary>
        /// <param name="model">Thông tin bài thi và câu trả lời</param>
        /// <returns>Kết quả chấm điểm và thông tin kết quả bài thi</returns>
        [Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SubmitExam([FromBody] SubmitExamDTO model)
        {
            try
            {
                _logger.LogInformation($"Nộp bài thi ID: {model.ExamId}");

                // Lấy ID người dùng từ token
                int currentUserId = GetCurrentUserId();
                if (currentUserId <= 0)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                // Kiểm tra bài thi tồn tại
                var exam = await _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.ExamType)
                    .Include(e => e.ExamQuestions)
                        .ThenInclude(eq => eq.Question)
                            .ThenInclude(q => q.Options)
                    .FirstOrDefaultAsync(e => e.Id == model.ExamId);

                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy bài thi ID: {model.ExamId}");
                    return NotFound(new { message = "Không tìm thấy bài thi" });
                }

                // Kiểm tra xem bài thi có đang mở không
                try
                {
                    // Lấy thời gian hiện tại theo giờ Việt Nam
                    var now = DateTimeHelper.GetVietnamNow();

                    // Log thông tin để debug
                    _logger.LogInformation($"Thời gian hiện tại (VN): {now.ToString("yyyy-MM-dd HH:mm:ss")}");

                    if (exam.StartTime.HasValue)
                        _logger.LogInformation($"Thời gian bắt đầu bài thi: {exam.StartTime.Value.ToString("yyyy-MM-dd HH:mm:ss")}");
                    if (exam.EndTime.HasValue)
                        _logger.LogInformation($"Thời gian kết thúc bài thi: {exam.EndTime.Value.ToString("yyyy-MM-dd HH:mm:ss")}");

                    // Kiểm tra thời gian làm bài
                    if ((exam.StartTime.HasValue && now < exam.StartTime.Value) ||
                        (exam.EndTime.HasValue && now > exam.EndTime.Value))
                    {
                        _logger.LogWarning($"Bài thi ID: {model.ExamId} không trong thời gian làm bài. " +
                            $"Thời gian hiện tại: {now.ToString("yyyy-MM-dd HH:mm:ss")}, " +
                            $"Thời gian bắt đầu: {exam.StartTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "không có"}, " +
                            $"Thời gian kết thúc: {exam.EndTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "không có"}");
                        return BadRequest(new { message = "Bài thi không trong thời gian làm bài" });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Lỗi xử lý múi giờ: {ex.Message}");
                    return BadRequest(new { message = "Đã xảy ra lỗi khi kiểm tra thời gian làm bài" });
                }

                // Kiểm tra số lần làm bài tối đa
                if (exam.MaxAttempts.HasValue)
                {
                    int attemptCount = await _context.ExamResults
                        .CountAsync(er => er.ExamId == model.ExamId && er.StudentId == currentUserId);

                    if (attemptCount >= exam.MaxAttempts.Value)
                    {
                        _logger.LogWarning($"Học sinh ID: {currentUserId} đã vượt quá số lần làm bài tối đa ({exam.MaxAttempts.Value}) cho bài thi ID: {model.ExamId}");
                        return BadRequest(new { message = $"Bạn đã làm bài thi này {attemptCount} lần, đã vượt quá số lần tối đa cho phép ({exam.MaxAttempts.Value})" });
                    }
                }

                // Gọi service chấm điểm để tạo và lưu kết quả bài thi
                var result = await _gradingService.GradeAndSaveExamResult(model, currentUserId);
                if (result == null)
                {
                    return StatusCode(500, new { message = "Đã xảy ra lỗi khi lưu kết quả bài thi" });
                }

                // Trả về thông tin kết quả bài thi vừa lưu
                return CreatedAtAction(nameof(GetExamResult), new { resultId = result.Id },
                    new
                    {
                        message = "Nộp bài thành công",
                        resultId = result.Id,
                        score = result.Score,
                        percentageScore = result.PercentageScore,
                        isPassed = result.IsPassed,
                        status = result.GradingStatus,
                        correctAnswers = result.CorrectAnswers,
                        totalQuestions = result.TotalQuestions
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi nộp bài thi: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi nộp bài thi", error = ex.Message });
            }
        }

        /// <summary>
        ///  Lịch sử bài thi theo người dùng 
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="subjectId">Lọc theo môn học (không bắt buộc)</param>
        /// <param name="page">Trang hiện tại</param>
        /// <param name="pageSize">Số lượng kết quả mỗi trang</param>
        /// <returns>Danh sách kết quả bài thi của người dùng</returns>
        [Authorize]
        [HttpGet("user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetUserResults(
            int userId,
            [FromQuery] int? subjectId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                // Kiểm tra quyền truy cập
                int currentUserId = GetCurrentUserId();
                if (currentUserId <= 0)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                bool isOwner = userId == currentUserId;
                bool isAdminOrTeacher = User.IsInRole("Admin") || User.IsInRole("Teacher");

                if (!isOwner && !isAdminOrTeacher)
                {
                    return StatusCode(403, new { message = "Bạn không có quyền xem kết quả bài thi của người dùng khác" });
                }

                _logger.LogInformation($"Lấy danh sách kết quả bài thi của người dùng ID: {userId}");

                // Lấy thông tin user để hiển thị
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng" });
                }

                // Xây dựng truy vấn
                var query = _context.ExamResults
                    .Include(er => er.Exam)
                        .ThenInclude(e => e.Subject)
                    .Include(er => er.Exam.ExamType)
                    .Include(er => er.Student)
                    .Where(er => er.StudentId == userId);

                // Lọc theo môn học nếu có
                if (subjectId.HasValue && subjectId.Value > 0)
                {
                    query = query.Where(er => er.Exam.SubjectId == subjectId.Value);
                }

                // Đếm tổng số bản ghi
                var totalCount = await query.CountAsync();

                // Phân trang và sắp xếp
                var results = await query
                    .OrderByDescending(er => er.StartedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Chuyển sang DTO
                var resultDTOs = new List<ExamResultListDTO>();
                foreach (var result in results)
                {
                    var correctRatio = $"{result.CorrectAnswers}/{result.TotalQuestions}";

                    // Tính thời gian làm bài định dạng
                    var durationFormatted = FormatDuration(result.Duration);

                    var dto = new ExamResultListDTO
                    {
                        Id = result.Id,
                        Exam = new ExamBasicDTO
                        {
                            Id = result.ExamId,
                            Title = result.Exam.Title,
                            Type = result.Exam.ExamType?.Name ?? "Bài thi",
                            Subject = new SubjectBasicDTO
                            {
                                Id = result.Exam.Subject.Id,
                                Name = result.Exam.Subject.Name,
                                Code = result.Exam.Subject.Code
                            }
                        },
                        Student = new UserBasicDTO
                        {
                            Id = user.Id,
                            Username = user.Username,
                            FullName = user.FullName
                        },
                        Score = result.Score,
                        PercentageScore = result.PercentageScore,
                        IsPassed = result.IsPassed,
                        CorrectRatio = correctRatio,
                        DurationFormatted = durationFormatted,
                        AttemptNumber = result.AttemptNumber,
                        IsCompleted = result.IsCompleted,
                        StartedAt = result.StartedAt,
                        CompletedAt = result.CompletedAt
                    };
                    resultDTOs.Add(dto);
                }

                // Trả về kết quả với phân trang
                return Ok(new
                {
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    data = resultDTOs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách kết quả bài thi: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách kết quả bài thi" });
            }
        }

        /// <summary>
        /// Lấy chi tiết kết quả bài thi
        /// </summary>
        /// <param name="resultId">ID của kết quả bài thi</param>
        /// <returns>Thông tin chi tiết kết quả bài thi và các câu trả lời</returns>
        [Authorize]
        [HttpGet("{resultId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetExamResult(int resultId)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin chi tiết kết quả bài thi ID: {resultId}");

                // Lấy thông tin kết quả bài thi
                var examResult = await _context.ExamResults
                    .Include(er => er.Exam)
                        .ThenInclude(e => e.Subject)
                    .Include(er => er.Exam.ExamType)
                    .Include(er => er.Student)
                    .FirstOrDefaultAsync(er => er.Id == resultId);

                if (examResult == null)
                {
                    _logger.LogWarning($"Không tìm thấy kết quả bài thi ID: {resultId}");
                    return NotFound(new { message = "Không tìm thấy kết quả bài thi" });
                }

                // Kiểm tra quyền truy cập
                int currentUserId = GetCurrentUserId();
                if (currentUserId <= 0)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                bool isOwner = examResult.StudentId == currentUserId;
                bool isAdminOrTeacher = User.IsInRole("Admin") || User.IsInRole("Teacher");

                if (!isOwner && !isAdminOrTeacher)
                {
                    return StatusCode(403, new { message = "Bạn không có quyền xem kết quả bài thi này" });
                }

                // Tạo đối tượng trả về từ service
                var resultDetail = await _gradingService.GetExamResultDetail(examResult, isAdminOrTeacher);

                return Ok(resultDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy chi tiết kết quả bài thi: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy chi tiết kết quả bài thi" });
            }
        }

        /// <summary>
        /// Xóa kết quả bài thi (chỉ dành cho admin)
        /// </summary>
        /// <param name="id">ID của kết quả bài thi cần xóa</param>
        /// <returns>Thông báo kết quả xóa</returns>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteExamResult(int id)
        {
            try
            {
                _logger.LogInformation($"Xóa kết quả bài thi ID: {id}");

                // Kiểm tra kết quả bài thi tồn tại
                var examResult = await _context.ExamResults
                    .Include(er => er.StudentAnswers)
                    .FirstOrDefaultAsync(er => er.Id == id);

                if (examResult == null)
                {
                    _logger.LogWarning($"Không tìm thấy kết quả bài thi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kết quả bài thi" });
                }

                // Xóa kết quả bài thi qua service
                bool success = await _gradingService.DeleteExamResult(examResult);
                if (!success)
                {
                    return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa kết quả bài thi" });
                }

                return Ok(new { message = "Xóa kết quả bài thi thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa kết quả bài thi: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa kết quả bài thi" });
            }
        }

        #region Helper Methods

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

        /// <summary>
        /// Cập nhật điểm bài thi (dành cho giáo viên)
        /// </summary>
        /// <param name="resultId">ID của kết quả bài thi</param>
        /// <param name="updateDto">Thông tin cập nhật điểm</param>
        /// <returns>Kết quả cập nhật</returns>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPut("{resultId}/grade")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateExamResult(int resultId, [FromBody] UpdateResultDTO updateDto)
        {
            try
            {
                // Kiểm tra quyền truy cập
                int currentUserId = GetCurrentUserId();
                if (currentUserId <= 0)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                // Kiểm tra xem kết quả bài thi có tồn tại không
                var examResult = await _context.ExamResults.FindAsync(resultId);
                if (examResult == null)
                {
                    return NotFound(new { message = "Không tìm thấy kết quả bài thi" });
                }

                // Cập nhật điểm thông qua service
                bool success = await _gradingService.UpdateExamResult(resultId, updateDto, currentUserId);
                if (!success)
                {
                    return BadRequest(new { message = "Không thể cập nhật kết quả bài thi" });
                }

                return Ok(new { message = "Cập nhật kết quả bài thi thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật kết quả bài thi: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật kết quả bài thi" });
            }
        }

        /// <summary>
        /// Định dạng thời gian từ giây sang định dạng phút:giây
        /// </summary>
        private string FormatDuration(int seconds)
        {
            var timeSpan = TimeSpan.FromSeconds(seconds);
            return timeSpan.Hours > 0
                ? $"{timeSpan.Hours}:{timeSpan.Minutes:D2}:{timeSpan.Seconds:D2}"
                : $"{timeSpan.Minutes:D2}:{timeSpan.Seconds:D2}";
        }

        #endregion
    }
}