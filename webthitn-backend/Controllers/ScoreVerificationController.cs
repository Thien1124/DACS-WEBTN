using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using webthitn_backend.Data;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Services;

namespace webthitn_backend.Controllers
{
    [Route("api/score-verification")]
    [ApiController]
    [Authorize]
    public class ScoreVerificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ScoreVerificationController> _logger;
        private readonly EmailService _emailService;

        public ScoreVerificationController(
            ApplicationDbContext context,
            ILogger<ScoreVerificationController> logger,
            EmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        /// <summary>
        /// Học sinh yêu cầu xác minh điểm số bài thi
        /// </summary>
        [HttpPost("request")]
        [Authorize(Roles = "Student")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RequestScoreVerification([FromBody] ScoreVerificationRequestDTO request)
        {
            try
            {
                // Check if request is valid
                if (string.IsNullOrEmpty(request.Reason))
                {
                    return BadRequest(new { message = "Vui lòng cung cấp lý do yêu cầu xác minh điểm" });
                }

                // Get current user
                int currentUserId = GetCurrentUserId();

                // Find exam result
                var examResult = await _context.ExamResults
                    .Include(er => er.Exam)
                    .FirstOrDefaultAsync(er => er.Id == request.ExamResultId && er.StudentId == currentUserId);

                if (examResult == null)
                {
                    return NotFound(new { message = "Không tìm thấy kết quả bài thi" });
                }

                // Get teacher info (either creator of the exam or the teacher who graded it)
                var student = await _context.Users.FindAsync(currentUserId);
                var officialExam = await _context.OfficialExams
                    .FirstOrDefaultAsync(oe => oe.ExamId == examResult.ExamId);
                
                var teacherId = examResult.GradedById ?? officialExam?.CreatorId;
                
                if (teacherId == null)
                {
                    return BadRequest(new { message = "Không thể xác định giáo viên phụ trách" });
                }

                var teacher = await _context.Users.FindAsync(teacherId);
                
                // Create verification request record
                var verificationRequest = new ScoreVerification
                {
                    ExamResultId = examResult.Id,
                    StudentId = currentUserId,
                    TeacherId = teacherId.Value,
                    RequestReason = request.Reason,
                    OriginalScore = examResult.Score,
                    Status = "Pending", // Pending, Approved, Rejected
                    CreatedAt = DateTime.UtcNow
                };

                _context.ScoreVerifications.Add(verificationRequest);
                await _context.SaveChangesAsync();

                // Send email to teacher
                if (!string.IsNullOrEmpty(teacher.Email))
                {
                    await _emailService.SendScoreVerificationEmailAsync(
                        teacher.Email,
                        student.FullName,
                        examResult.Id,
                        examResult.Exam.Title,
                        examResult.Score,
                        request.Reason);
                }

                return Ok(new
                {
                    message = "Yêu cầu xác minh điểm đã được gửi thành công",
                    verificationId = verificationRequest.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error requesting score verification: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi gửi yêu cầu xác minh điểm" });
            }
        }

        /// <summary>
        /// Giáo viên phản hồi yêu cầu xác minh điểm
        /// </summary>
        [HttpPost("respond/{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RespondToVerification(int id, [FromBody] ScoreVerificationResponseDTO response)
        {
            try
            {
                // Get current user
                int currentUserId = GetCurrentUserId();

                // Find verification request
                var verification = await _context.ScoreVerifications
                    .Include(v => v.ExamResult)
                        .ThenInclude(er => er.Exam)
                    .Include(v => v.Student)
                    .FirstOrDefaultAsync(v => v.Id == id);

                if (verification == null)
                {
                    return NotFound(new { message = "Không tìm thấy yêu cầu xác minh điểm" });
                }

                // Check if user is allowed to respond (must be the assigned teacher or admin)
                bool isAdmin = User.IsInRole("Admin");
                if (!isAdmin && verification.TeacherId != currentUserId)
                {
                    return Forbid();
                }

                // Update verification
                verification.TeacherResponse = response.Response;
                verification.Status = response.NewScore.HasValue ? "Approved" : "Rejected";
                verification.UpdatedAt = DateTime.UtcNow;
                verification.ResponderId = currentUserId;

                // Update score if changed
                if (response.NewScore.HasValue)
                {
                    verification.NewScore = response.NewScore.Value;
                    
                    // Update exam result
                    var examResult = verification.ExamResult;
                    decimal oldScore = examResult.Score;
                    examResult.Score = response.NewScore.Value;
                    
                    // Recalculate percentage score
                    decimal totalPossibleScore = 10; // Default scale
                    if (examResult.Exam != null && examResult.Exam.TotalScore > 0)
                    {
                        examResult.PercentageScore = (examResult.Score / totalPossibleScore) * 100;
                    }
                    
                    _context.ExamResults.Update(examResult);
                }

                _context.ScoreVerifications.Update(verification);
                await _context.SaveChangesAsync();

                // Send email to student
                if (!string.IsNullOrEmpty(verification.Student.Email))
                {
                    await _emailService.SendScoreVerificationResponseEmailAsync(
                        verification.Student.Email,
                        verification.Student.FullName,
                        verification.ExamResult.Id,
                        verification.ExamResult.Exam.Title,
                        verification.OriginalScore,
                        response.NewScore ?? verification.OriginalScore,
                        response.Response);
                }

                return Ok(new
                {
                    message = "Đã phản hồi yêu cầu xác minh điểm",
                    status = verification.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error responding to score verification: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi phản hồi yêu cầu xác minh điểm" });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Invalid user ID claim");
        }
    }
}