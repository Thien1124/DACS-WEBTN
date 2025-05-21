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
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
            if (_emailService == null)
            {
                _logger.LogWarning("EmailService is null - email notifications will be skipped");
            }

            try
            {
                _logger.LogInformation($"Processing score verification request for examResultId: {request.ExamResultId}");
                
                // Check if request is valid
                if (string.IsNullOrEmpty(request.Reason))
                {
                    return BadRequest(new { message = "Vui lòng cung cấp lý do yêu cầu xác minh điểm" });
                }

                // Get current user
                int currentUserId = GetCurrentUserId();
                _logger.LogInformation($"Current user ID: {currentUserId}");

                // Find exam result with proper includes
                var examResult = await _context.ExamResults
                    .Include(er => er.Exam)
                    .Include(er => er.Student)
                    .FirstOrDefaultAsync(er => er.Id == request.ExamResultId && er.StudentId == currentUserId);

                if (examResult == null)
                {
                    return NotFound(new { message = "Không tìm thấy kết quả bài thi" });
                }

                _logger.LogInformation($"Found exam result ID: {examResult.Id} for exam: {examResult.ExamId}");

                // Check if a verification request already exists for this exam result
                var existingVerification = await _context.ScoreVerifications
                    .FirstOrDefaultAsync(sv => sv.ExamResultId == examResult.Id && sv.StudentId == currentUserId);

                if (existingVerification != null)
                {
                    string status = existingVerification.Status;
                    return BadRequest(new { 
                        message = $"Đã tồn tại yêu cầu xác minh điểm cho bài thi này (Trạng thái: {status})",
                        verificationId = existingVerification.Id,
                        status = status
                    });
                }

                // Get current student data
                var student = await _context.Users.FindAsync(currentUserId);
                if (student == null)
                {
                    return BadRequest(new { message = "Không tìm thấy thông tin học sinh" });
                }

                // Try multiple approaches to find a responsible teacher
                int? teacherId = null;
                
                // 1. First try to use the graded by ID if available
                if (examResult.GradedById.HasValue)
                {
                    teacherId = examResult.GradedById;
                    _logger.LogInformation($"Using grader ID: {teacherId}");
                }
                
                // 2. If no grader, try to find from official exam
                if (!teacherId.HasValue)
                {
                    var officialExam = await _context.OfficialExams
                        .FirstOrDefaultAsync(oe => oe.ExamId == examResult.ExamId);
                    
                    if (officialExam?.CreatorId != null)
                    {
                        teacherId = officialExam.CreatorId;
                        _logger.LogInformation($"Using official exam creator ID: {teacherId}");
                    }
                }
                
                // 3. If still no teacher, try to find the exam creator
                if (!teacherId.HasValue && examResult.Exam?.CreatorId != null)
                {
                    teacherId = examResult.Exam.CreatorId;
                    _logger.LogInformation($"Using exam creator ID: {teacherId}");
                }
                
                // 4. Last resort - find any teacher or admin
                if (!teacherId.HasValue)
                {
                    var anyTeacher = await _context.Users
                        .Where(u => u.Role == "Teacher" || u.Role == "Admin")
                        .OrderBy(u => u.Id)
                        .FirstOrDefaultAsync();
                    
                    if (anyTeacher != null)
                    {
                        teacherId = anyTeacher.Id;
                        _logger.LogInformation($"Using fallback teacher ID: {teacherId}");
                    }
                }
                
                // If we still don't have a teacher, return an error
                if (!teacherId.HasValue)
                {
                    return BadRequest(new { message = "Không thể xác định giáo viên phụ trách" });
                }

                // Get teacher information
                var teacher = await _context.Users.FindAsync(teacherId.Value);
                if (teacher == null)
                {
                    return BadRequest(new { message = "Không tìm thấy thông tin giáo viên" });
                }

                // Create verification request record
                var verificationRequest = new ScoreVerification
                {
                    ExamResultId = examResult.Id,
                    StudentId = currentUserId,
                    TeacherId = teacherId.Value,
                    RequestReason = request.Reason,
                    OriginalScore = examResult.Score,
                    Status = "Pending", // Pending, Approved, Rejected
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow, 
                    NewScore = null,
                    TeacherResponse = "" // Add this line to provide a default empty string value
                };

                try {
                    // Add validation logging
                    _logger.LogInformation($"Saving verification request: ExamResultId={verificationRequest.ExamResultId}, " +
                                           $"StudentId={verificationRequest.StudentId}, TeacherId={verificationRequest.TeacherId}");
                    
                    // Add to database with specific error handling
                    _context.ScoreVerifications.Add(verificationRequest);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Created score verification request ID: {verificationRequest.Id}");
                } 
                catch (DbUpdateException dbEx) 
                {
                    _logger.LogError($"Database update error: {dbEx.Message}");
                    if (dbEx.InnerException != null) {
                        _logger.LogError($"Inner exception: {dbEx.InnerException.Message}");
                    }
                    
                    // Check for duplicate entry
                    if (dbEx.InnerException != null && 
                        (dbEx.InnerException.Message.Contains("IX_ScoreVerifications") ||
                         dbEx.InnerException.Message.Contains("duplicate") ||
                         dbEx.InnerException.Message.Contains("UNIQUE constraint")))
                    {
                        return BadRequest(new { message = "Đã tồn tại yêu cầu xác minh điểm cho bài thi này" });
                    }
                    
                    // More specific error message with details
                    return StatusCode(500, new { 
                        message = "Lỗi khi lưu dữ liệu vào cơ sở dữ liệu", 
                        details = dbEx.InnerException?.Message ?? dbEx.Message 
                    });
                }

                // Attempt to send email to teacher, but don't fail if email sending fails
                try
                {
                    // Only attempt to send email if both email service and teacher email exist
                    if (_emailService != null && !string.IsNullOrEmpty(teacher.Email))
                    {
                        string examTitle = examResult.Exam?.Title ?? "Không có tiêu đề";
                        
                        await _emailService.SendScoreVerificationEmailAsync(
                            teacher.Email,
                            student.FullName ?? "Học sinh",
                            examResult.Id,
                            examTitle,
                            examResult.Score,
                            request.Reason);
                        
                        _logger.LogInformation($"Score verification email sent to teacher {teacher.Id} ({teacher.Email})");
                    }
                    else
                    {
                        if (_emailService == null)
                            _logger.LogWarning("Email service is null, skipping email notification");
                        else
                            _logger.LogWarning($"Teacher {teacher.Id} has no email address, skipping verification email");
                    }
                }
                catch (Exception emailEx)
                {
                    // Log the error but don't fail the request
                    _logger.LogError($"Failed to send verification email: {emailEx.Message}");
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
                
                if (ex is UnauthorizedAccessException)
                {
                    return StatusCode(401, new { message = "Không có quyền truy cập" });
                }
                else if (ex is DbUpdateException dbEx)
                {
                    _logger.LogError($"Database error details: {dbEx.InnerException?.Message}");
                    
                    // Check for unique constraint violation
                    if (dbEx.InnerException != null && 
                        (dbEx.InnerException.Message.Contains("IX_ScoreVerifications_ExamResultId_StudentId") ||
                         dbEx.InnerException.Message.Contains("duplicate") ||
                         dbEx.InnerException.Message.Contains("UNIQUE constraint")))
                    {
                        return BadRequest(new { message = "Đã tồn tại yêu cầu xác minh điểm cho bài thi này" });
                    }
                    
                    return StatusCode(500, new { message = "Lỗi khi lưu dữ liệu vào cơ sở dữ liệu" });
                }
                
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi gửi yêu cầu xác minh điểm" });
            }
        }

        /// <summary>
/// Lấy danh sách yêu cầu xác minh điểm đang chờ giáo viên xử lý
/// </summary>
[HttpGet("pending")]
[Authorize(Roles = "Teacher,Admin")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetPendingVerifications([FromQuery] int? teacherId = null)
{
    try
    {
        int currentUserId = GetCurrentUserId();
        bool isAdmin = User.IsInRole("Admin");
        
        // Build query
        var query = _context.ScoreVerifications
            .Include(v => v.ExamResult)
                .ThenInclude(er => er.Exam)
            .Include(v => v.Student)
            .Where(v => v.Status == "Pending");
        
        // Filter by teacher if specified or if current user is a teacher (not admin)
        if (teacherId.HasValue)
        {
            query = query.Where(v => v.TeacherId == teacherId.Value);
        }
        else if (!isAdmin)
        {
            // If user is not admin and no specific teacher ID requested,
            // show only requests assigned to current user
            query = query.Where(v => v.TeacherId == currentUserId);
        }
        
        // Execute query and transform results
        var pendingRequests = await query
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                id = v.Id,
                studentId = v.StudentId,
                studentName = v.Student.FullName,
                examId = v.ExamResult.ExamId,
                examResultId = v.ExamResultId,
                examTitle = v.ExamResult.Exam.Title,
                originalScore = v.OriginalScore,
                requestReason = v.RequestReason,
                createdAt = v.CreatedAt,
                teacherId = v.TeacherId,
                daysPending = EF.Functions.DateDiffDay(v.CreatedAt, DateTime.UtcNow)
            })
            .ToListAsync();
        
        return Ok(pendingRequests);
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error getting pending verifications: {ex.Message}");
        return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách yêu cầu xác minh điểm đang chờ" });
    }
}

/// <summary>
/// Lấy danh sách tất cả yêu cầu xác minh điểm với bộ lọc
/// </summary>
[HttpGet]
[Authorize(Roles = "Teacher,Admin")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetVerifications(
    [FromQuery] string status = null,
    [FromQuery] int? teacherId = null,
    [FromQuery] int? studentId = null,
    [FromQuery] DateTime? fromDate = null,
    [FromQuery] DateTime? toDate = null)
{
    try
    {
        int currentUserId = GetCurrentUserId();
        bool isAdmin = User.IsInRole("Admin");
        
        // Start with base query
        var query = _context.ScoreVerifications
            .Include(v => v.ExamResult)
                .ThenInclude(er => er.Exam)
            .Include(v => v.Student)
            .AsQueryable();
        
        // Teachers can only see their own assignments unless specified by admin
        if (!isAdmin && teacherId == null)
        {
            query = query.Where(v => v.TeacherId == currentUserId);
        }
        else if (teacherId.HasValue)
        {
            query = query.Where(v => v.TeacherId == teacherId.Value);
        }
        
        // Apply filters if provided
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(v => v.Status.ToLower() == status.ToLower());
        }
        
        if (studentId.HasValue)
        {
            query = query.Where(v => v.StudentId == studentId.Value);
        }
        
        if (fromDate.HasValue)
        {
            query = query.Where(v => v.CreatedAt >= fromDate.Value);
        }
        
        if (toDate.HasValue)
        {
            query = query.Where(v => v.CreatedAt <= toDate.Value);
        }
        
        // Execute query
        var verifications = await query
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                id = v.Id,
                studentId = v.StudentId,
                studentName = v.Student.FullName,
                examId = v.ExamResult.ExamId,
                examResultId = v.ExamResultId,
                examTitle = v.ExamResult.Exam.Title,
                originalScore = v.OriginalScore,
                newScore = v.NewScore,
                requestReason = v.RequestReason,
                teacherResponse = v.TeacherResponse,
                status = v.Status,
                createdAt = v.CreatedAt,
                updatedAt = v.UpdatedAt
            })
            .ToListAsync();
        
        return Ok(verifications);
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error getting verifications: {ex.Message}");
        return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách yêu cầu xác minh điểm" });
    }
}

/// <summary>
/// Lấy thống kê tổng quan về các yêu cầu xác minh điểm
/// </summary>
[HttpGet("stats")]
[Authorize(Roles = "Teacher,Admin")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetVerificationStats()
{
    try
    {
        int currentUserId = GetCurrentUserId();
        bool isAdmin = User.IsInRole("Admin");
        
        var query = _context.ScoreVerifications.AsQueryable();
        
        // Filter by teacher if not admin
        if (!isAdmin)
        {
            query = query.Where(v => v.TeacherId == currentUserId);
        }
        
        var pendingCount = await query.CountAsync(v => v.Status == "Pending");
        var approvedCount = await query.CountAsync(v => v.Status == "Approved");
        var rejectedCount = await query.CountAsync(v => v.Status == "Rejected");
        var totalCount = await query.CountAsync();
        
        // Get recent pending requests for quick access
        var recentPending = await query
            .Where(v => v.Status == "Pending")
            .OrderByDescending(v => v.CreatedAt)
            .Take(5)
            .Select(v => new
            {
                id = v.Id,
                studentName = v.Student.FullName,
                examTitle = v.ExamResult.Exam.Title,
                createdAt = v.CreatedAt
            })
            .ToListAsync();
        
        return Ok(new
        {
            pendingCount,
            approvedCount,
            rejectedCount,
            totalCount,
            recentPending
        });
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error getting verification stats: {ex.Message}");
        return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thống kê yêu cầu xác minh điểm" });
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

        // Replace GetCurrentUserId method with this more robust version
        private int GetCurrentUserId()
        {
            try
            {
                // First try the standard ClaimTypes.NameIdentifier
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    return userId;
                }
                
                // Try a custom claim "userId" which might be used in your JWT token
                var customUserIdClaim = User.FindFirst("userId");
                if (customUserIdClaim != null && int.TryParse(customUserIdClaim.Value, out userId))
                {
                    _logger.LogInformation($"Found userId from custom claim: {userId}");
                    return userId;
                }
                
                // If all else fails, log available claims to help diagnose
                var allClaims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
                _logger.LogWarning($"Could not find user ID in claims. Available claims: {string.Join(", ", allClaims)}");
                
                throw new UnauthorizedAccessException("Invalid user ID claim");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error extracting user ID from claims: {ex.Message}");
                throw;
            }
        }
    }
}