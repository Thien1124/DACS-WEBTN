using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Models.Users;
using WEBTHITN_Backend.Helpers;

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// API để quản lý các kỳ thi chính thức trong hệ thống
    /// </summary>
    [Route("api/official-exams")]
    [ApiController]
    [Authorize(Roles = "Admin,Teacher")]
    public class OfficialExamController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OfficialExamController> _logger;

        /// <summary>
        /// Khởi tạo controller với các dependency
        /// </summary>
        public OfficialExamController(ApplicationDbContext context, ILogger<OfficialExamController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Tạo kỳ thi chính thức mới
        /// </summary>
        /// <remarks>
        /// API này cho phép tạo kỳ thi chính thức dựa trên một đề thi có sẵn
        /// </remarks>
        /// <param name="model">Thông tin kỳ thi chính thức</param>
        /// <returns>Thông tin kỳ thi đã tạo</returns>
        /// <response code="201">Kỳ thi được tạo thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="404">Không tìm thấy đề thi</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateOfficialExam([FromBody] CreateOfficialExamDTO model)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(model.Title))
                {
                    return BadRequest(new { message = "Tiêu đề kỳ thi không được để trống" });
                }

                // Check if exam exists
                var exam = await _context.Exams.FindAsync(model.ExamId);
                if (exam == null)
                {
                    return NotFound(new { message = "Không tìm thấy đề thi" });
                }

                // Get current user ID
                int currentUserId = GetCurrentUserId();

                // Create official exam
                var officialExam = new OfficialExam
                {
                    Title = model.Title.Trim(),
                    Description = model.Description?.Trim(),
                    ExamId = model.ExamId,
                    StartTime = model.StartTime,
                    EndTime = model.EndTime,
                    ClassroomName = model.ClassroomName?.Trim(),
                    CreatorId = currentUserId,
                    IsActive = true,
                    ResultsReleased = false,
                    CreatedAt = DateTimeHelper.GetVietnamNow()
                };

                _context.OfficialExams.Add(officialExam);
                await _context.SaveChangesAsync();

                // Assign students if provided
                if (model.StudentIds != null && model.StudentIds.Any())
                {
                    var officialExamStudents = new List<OfficialExamStudent>();

                    foreach (var studentId in model.StudentIds.Distinct())
                    {
                        // Check if student exists
                        var student = await _context.Users.FirstOrDefaultAsync(
                            u => u.Id == studentId && u.Role == "Student");

                        if (student != null)
                        {
                            officialExamStudents.Add(new OfficialExamStudent
                            {
                                OfficialExamId = officialExam.Id,
                                StudentId = studentId,
                                AssignedAt = DateTimeHelper.GetVietnamNow()
                            });
                        }
                    }

                    if (officialExamStudents.Any())
                    {
                        _context.OfficialExamStudents.AddRange(officialExamStudents);
                        await _context.SaveChangesAsync();
                    }
                }

                // Get created exam with details
                var result = await GetOfficialExamDetail(officialExam.Id);

                return CreatedAtAction(nameof(GetOfficialExam), new { id = officialExam.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating official exam: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo kỳ thi chính thức" });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết kỳ thi chính thức
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <returns>Thông tin chi tiết kỳ thi</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOfficialExam(int id)
        {
            try
            {
                var result = await GetOfficialExamDetail(id);

                if (result == null)
                {
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting official exam: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin kỳ thi chính thức" });
            }
        }

        /// <summary>
        /// Lấy danh sách kỳ thi chính thức
        /// </summary>
        /// <returns>Danh sách kỳ thi chính thức</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOfficialExams(
            [FromQuery] string classroomName = null,
            [FromQuery] bool? active = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách kỳ thi chính thức: ClassroomName={classroomName}, Active={active}, Page={page}, PageSize={pageSize}");

                // Build query
                var query = _context.OfficialExams
                    .Include(oe => oe.Exam)
                    .Include(oe => oe.Creator)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(classroomName))
                {
                    query = query.Where(oe => oe.ClassroomName == classroomName);
                }

                if (active.HasValue)
                {
                    query = query.Where(oe => oe.IsActive == active.Value);
                }

                // Count total
                int totalCount = await query.CountAsync();

                // Apply pagination
                var officialExams = await query
                    .OrderByDescending(oe => oe.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Get student counts
                var examIds = officialExams.Select(oe => oe.Id).ToList();
                var studentCounts = await _context.OfficialExamStudents
                    .Where(oes => examIds.Contains(oes.OfficialExamId))
                    .GroupBy(oes => oes.OfficialExamId)
                    .Select(g => new
                    {
                        OfficialExamId = g.Key,
                        AssignedCount = g.Count(),
                        CompletedCount = g.Count(oes => oes.HasTaken)
                    })
                    .ToDictionaryAsync(x => x.OfficialExamId, x => new { x.AssignedCount, x.CompletedCount });

                // Map to DTOs
                var result = officialExams.Select(oe =>
                {
                    var studentCount = studentCounts.ContainsKey(oe.Id)
                        ? studentCounts[oe.Id]
                        : new { AssignedCount = 0, CompletedCount = 0 };

                    return new OfficialExamListDTO
                    {
                        Id = oe.Id,
                        Title = oe.Title,
                        Description = oe.Description,
                        ExamId = oe.ExamId,
                        ExamTitle = oe.Exam?.Title,
                        StartTime = oe.StartTime,
                        EndTime = oe.EndTime,
                        ClassroomName = oe.ClassroomName,
                        Creator = oe.Creator != null ? new UserBasicDTO
                        {
                            Id = oe.Creator.Id,
                            Username = oe.Creator.Username ?? "unknown",
                            FullName = oe.Creator.FullName ?? "Unknown User"
                        } : new UserBasicDTO
                        {
                            Id = 0,
                            Username = "unknown",
                            FullName = "Unknown User"
                        },
                        IsActive = oe.IsActive,
                        ResultsReleased = oe.ResultsReleased,
                        CreatedAt = oe.CreatedAt,
                        UpdatedAt = oe.UpdatedAt,
                        AssignedStudentsCount = studentCount.AssignedCount,
                        CompletedStudentsCount = studentCount.CompletedCount,
                        Status = GetOfficialExamStatus(oe)
                    };
                }).ToList();

                return Ok(new
                {
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting official exams: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách kỳ thi chính thức" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin kỳ thi chính thức
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <param name="model">Thông tin cập nhật</param>
        /// <returns>Thông tin kỳ thi sau khi cập nhật</returns>
        [HttpPatch("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOfficialExam(int id, [FromBody] UpdateOfficialExamDTO model)
        {
            try
            {
                _logger.LogInformation($"Cập nhật kỳ thi chính thức ID: {id}");

                // Find official exam
                var officialExam = await _context.OfficialExams.FindAsync(id);
                if (officialExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy kỳ thi chính thức ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                // Check permissions
                int currentUserId = GetCurrentUserId();
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = officialExam.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền cập nhật kỳ thi ID: {id}");
                    return Forbid();
                }

                // Update fields
                if (!string.IsNullOrEmpty(model.Title))
                {
                    officialExam.Title = model.Title.Trim();
                }

                if (model.Description != null)
                {
                    officialExam.Description = model.Description.Trim();
                }

                if (model.StartTime.HasValue)
                {
                    officialExam.StartTime = model.StartTime;
                }

                if (model.EndTime.HasValue)
                {
                    officialExam.EndTime = model.EndTime;
                }

                if (model.ClassroomName != null)
                {
                    officialExam.ClassroomName = model.ClassroomName.Trim();
                }

                if (model.IsActive.HasValue)
                {
                    officialExam.IsActive = model.IsActive.Value;
                }

                officialExam.UpdatedAt = DateTimeHelper.GetVietnamNow();

                // Save changes
                _context.OfficialExams.Update(officialExam);
                await _context.SaveChangesAsync();

                // Get updated exam
                var result = await GetOfficialExamDetail(id);

                return Ok(new { message = "Cập nhật kỳ thi thành công", data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating official exam: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật kỳ thi chính thức" });
            }
        }

        /// <summary>
        /// Phân công học sinh tham gia kỳ thi
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <param name="model">Danh sách ID học sinh</param>
        /// <returns>Kết quả phân công</returns>
        [HttpPost("{id}/students")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AssignStudents(int id, [FromBody] AssignStudentsDTO model)
        {
            try
            {
                _logger.LogInformation($"Phân công học sinh cho kỳ thi ID: {id}, Số lượng: {model.StudentIds?.Count ?? 0}");

                // Validate input
                if (model.StudentIds == null || !model.StudentIds.Any())
                {
                    return BadRequest(new { message = "Danh sách học sinh không được để trống" });
                }

                // Find official exam
                var officialExam = await _context.OfficialExams.FindAsync(id);
                if (officialExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy kỳ thi chính thức ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                // Check permissions
                int currentUserId = GetCurrentUserId();
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = officialExam.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền phân công học sinh cho kỳ thi ID: {id}");
                    return Forbid();
                }

                // Get existing students
                var existingStudentIds = await _context.OfficialExamStudents
                    .Where(oes => oes.OfficialExamId == id)
                    .Select(oes => oes.StudentId)
                    .ToListAsync();

                // Find new students to add
                var newStudentIds = model.StudentIds
                    .Distinct()
                    .Except(existingStudentIds)
                    .ToList();

                // Check if students exist
                var validStudents = await _context.Users
                    .Where(u => newStudentIds.Contains(u.Id) && u.Role == "Student")
                    .Select(u => u.Id)
                    .ToListAsync();

                // Create new assignments
                var newStudentAssignments = validStudents.Select(studentId => new OfficialExamStudent
                {
                    OfficialExamId = id,
                    StudentId = studentId,
                    AssignedAt = DateTimeHelper.GetVietnamNow()
                }).ToList();

                if (newStudentAssignments.Any())
                {
                    _context.OfficialExamStudents.AddRange(newStudentAssignments);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã phân công {newStudentAssignments.Count} học sinh vào kỳ thi ID: {id}");
                }

                // Return results
                return Ok(new
                {
                    message = $"Đã phân công {newStudentAssignments.Count} học sinh vào kỳ thi",
                    totalAssigned = existingStudentIds.Count + newStudentAssignments.Count,
                    newlyAssigned = newStudentAssignments.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error assigning students: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi phân công học sinh" });
            }
        }

        /// <summary>
        /// Lấy danh sách học sinh tham gia kỳ thi
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <returns>Danh sách học sinh tham gia</returns>
        [HttpGet("{id}/students")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetStudents(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách học sinh tham gia kỳ thi ID: {id}");

                // Find official exam
                var officialExam = await _context.OfficialExams.FindAsync(id);
                if (officialExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy kỳ thi chính thức ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                // Get students
                var students = await _context.OfficialExamStudents
                    .Include(oes => oes.Student)
                    .Include(oes => oes.ExamResult)
                    .Where(oes => oes.OfficialExamId == id)
                    .OrderBy(oes => oes.Student.Username)
                    .Select(oes => new OfficialExamStudentDTO
                    {
                        Id = oes.Id,
                        StudentId = oes.StudentId,
                        StudentName = oes.Student.FullName,
                        StudentCode = oes.Student.Username,
                        HasTaken = oes.HasTaken,
                        ExamResultId = oes.ExamResultId,
                        Score = oes.ExamResult != null ? (double?)oes.ExamResult.Score : null,
                        PercentageScore = oes.ExamResult != null ? (double?)oes.ExamResult.PercentageScore : null,
                        IsPassed = oes.ExamResult != null ? oes.ExamResult.IsPassed : null,
                        CompletedAt = oes.ExamResult != null ? oes.ExamResult.CompletedAt ?? DateTime.MinValue : DateTime.MinValue
                    })
                    .ToListAsync();

                return Ok(new
                {
                    officialExamId = id,
                    resultsReleased = officialExam.ResultsReleased,
                    totalStudents = students.Count,
                    completedCount = students.Count(s => s.HasTaken),
                    passedCount = students.Count(s => s.IsPassed == true),
                    students = students
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting students: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách học sinh" });
            }
        }

        /// <summary>
        /// Công bố kết quả kỳ thi
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <param name="model">Thông tin công bố kết quả</param>
        /// <returns>Kết quả công bố</returns>
        [HttpPost("{id}/release-results")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReleaseResult(int id, [FromBody] ReleaseResultDTO model)
        {
            try
            {
                _logger.LogInformation($"Công bố kết quả kỳ thi ID: {id}, Release: {model.Release}");

                // Find official exam
                var officialExam = await _context.OfficialExams
                    .Include(oe => oe.Exam)
                    .FirstOrDefaultAsync(oe => oe.Id == id);

                if (officialExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy kỳ thi chính thức ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                // Check permissions
                int currentUserId = GetCurrentUserId();
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = officialExam.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền công bố kết quả kỳ thi ID: {id}");
                    return Forbid();
                }

                // Update results release status
                officialExam.ResultsReleased = model.Release;
                officialExam.UpdatedAt = DateTimeHelper.GetVietnamNow();

                _context.OfficialExams.Update(officialExam);
                await _context.SaveChangesAsync();

                // Also update the related exam's ShowResult property if needed
                if (officialExam.Exam != null)
                {
                    officialExam.Exam.ShowResult = model.Release;
                    _context.Exams.Update(officialExam.Exam);
                    await _context.SaveChangesAsync();
                }

                // TODO: Send notifications to students if needed
                if (!string.IsNullOrEmpty(model.NotificationMessage))
                {
                    // Implement notification logic here if you have a notification system
                    _logger.LogInformation($"Thông báo kết quả kỳ thi ID: {id}, Nội dung: {model.NotificationMessage}");
                }

                return Ok(new
                {
                    message = model.Release
                        ? "Đã công bố kết quả kỳ thi"
                        : "Đã ẩn kết quả kỳ thi",
                    officialExamId = id,
                    resultsReleased = model.Release
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error releasing results: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi công bố kết quả kỳ thi" });
            }
        }

        /// <summary>
        /// Xóa kỳ thi chính thức
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteOfficialExam(int id)
        {
            try
            {
                _logger.LogInformation($"Xóa kỳ thi chính thức ID: {id}");

                // Find official exam
                var officialExam = await _context.OfficialExams.FindAsync(id);
                if (officialExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy kỳ thi chính thức ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                // Check permissions
                int currentUserId = GetCurrentUserId();
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = officialExam.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền xóa kỳ thi ID: {id}");
                    return Forbid();
                }

                // Check if students have taken the exam
                bool hasResults = await _context.OfficialExamStudents
                    .AnyAsync(oes => oes.OfficialExamId == id && oes.HasTaken);

                if (hasResults && !isAdmin)
                {
                    _logger.LogWarning($"Không thể xóa kỳ thi ID: {id} vì đã có học sinh làm bài");
                    return StatusCode(403, new
                    {
                        message = "Kỳ thi đã có học sinh làm bài, chỉ admin mới có thể xóa"
                    });
                }

                // Begin transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Delete all student assignments
                    var studentAssignments = await _context.OfficialExamStudents
                        .Where(oes => oes.OfficialExamId == id)
                        .ToListAsync();

                    if (studentAssignments.Any())
                    {
                        _context.OfficialExamStudents.RemoveRange(studentAssignments);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation($"Đã xóa {studentAssignments.Count} học sinh trong kỳ thi ID: {id}");
                    }

                    // Delete official exam
                    _context.OfficialExams.Remove(officialExam);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã xóa kỳ thi chính thức ID: {id}");

                    // Commit transaction
                    await transaction.CommitAsync();

                    return Ok(new
                    {
                        message = "Đã xóa kỳ thi chính thức",
                        officialExamId = id
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi khi xóa kỳ thi chính thức: {ex.Message}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting official exam: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa kỳ thi chính thức" });
            }
        }

        /// <summary>
        /// Lấy thống kê tổng quan về kỳ thi chính thức
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <returns>Thống kê tổng quan</returns>
        [HttpGet("{id}/statistics")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOfficialExamStatistics(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thống kê kỳ thi chính thức ID: {id}");

                // Find official exam
                var officialExam = await _context.OfficialExams
                    .Include(oe => oe.Exam)
                    .FirstOrDefaultAsync(oe => oe.Id == id);

                if (officialExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy kỳ thi chính thức ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                // Get student statistics
                var studentStats = await _context.OfficialExamStudents
                    .Include(oes => oes.ExamResult)
                    .Where(oes => oes.OfficialExamId == id)
                    .GroupBy(oes => true)
                    .Select(g => new
                    {
                        TotalStudents = g.Count(),
                        CompletedExams = g.Count(oes => oes.HasTaken),
                        PassedExams = g.Count(oes => oes.HasTaken && oes.ExamResult != null && oes.ExamResult.IsPassed),
                        AverageScore = g.Where(oes => oes.ExamResult != null).Average(oes => (double?)oes.ExamResult.Score) ?? 0,
                        HighestScore = g.Where(oes => oes.ExamResult != null).Max(oes => (double?)oes.ExamResult.Score) ?? 0,
                        LowestScore = g.Where(oes => oes.ExamResult != null && oes.HasTaken).Min(oes => (double?)oes.ExamResult.Score) ?? 0
                    })
                    .FirstOrDefaultAsync() ?? new
                    {
                        TotalStudents = 0,
                        CompletedExams = 0,
                        PassedExams = 0,
                        AverageScore = 0.0,
                        HighestScore = 0.0,
                        LowestScore = 0.0
                    };

                // Get score distribution
                var scoreRanges = new Dictionary<string, int>
                {
                    {"0-4", 0},
                    {"4-5", 0},
                    {"5-6", 0},
                    {"6-7", 0},
                    {"7-8", 0},
                    {"8-9", 0},
                    {"9-10", 0}
                };

                var scores = await _context.OfficialExamStudents
                    .Include(oes => oes.ExamResult)
                    .Where(oes => oes.OfficialExamId == id && oes.HasTaken && oes.ExamResult != null)
                    .Select(oes => oes.ExamResult.Score)
                    .ToListAsync();

                foreach (var score in scores)
                {
                    if (score < 4) scoreRanges["0-4"]++;
                    else if (score < 5) scoreRanges["4-5"]++;
                    else if (score < 6) scoreRanges["5-6"]++;
                    else if (score < 7) scoreRanges["6-7"]++;
                    else if (score < 8) scoreRanges["7-8"]++;
                    else if (score < 9) scoreRanges["8-9"]++;
                    else scoreRanges["9-10"]++;
                }

                // Tính thời gian trung bình làm bài (nếu có thông tin)
                double avgCompletionTime = 0;

                // Điều chỉnh để lấy thông tin về thời gian làm bài nếu có
                var examResults = await _context.OfficialExamStudents
                    .Include(oes => oes.ExamResult)
                    .Where(oes => oes.OfficialExamId == id && oes.HasTaken && oes.ExamResult != null)
                    .Select(oes => oes.ExamResult)
                    .ToListAsync();

                // Nếu có thông tin về thời gian làm bài, tính giá trị trung bình
                if (examResults.Any())
                {
                    // Sử dụng thông tin về thời gian làm bài từ ExamResult nếu có
                    // Nếu không có, giữ giá trị avgCompletionTime = 0
                }

                // Create result
                return Ok(new
                {
                    officialExamId = id,
                    title = officialExam.Title,
                    examTitle = officialExam.Exam?.Title,
                    passScore = officialExam.Exam?.PassScore,
                    totalScore = officialExam.Exam?.TotalScore,
                    resultsReleased = officialExam.ResultsReleased,
                    status = GetOfficialExamStatus(officialExam),
                    statistics = new
                    {
                        studentStats.TotalStudents,
                        studentStats.CompletedExams,
                        studentStats.PassedExams,
                        CompletionPercentage = studentStats.TotalStudents > 0
                            ? Math.Round((double)studentStats.CompletedExams / studentStats.TotalStudents * 100, 2)
                            : 0,
                        PassPercentage = studentStats.CompletedExams > 0
                            ? Math.Round((double)studentStats.PassedExams / studentStats.CompletedExams * 100, 2)
                            : 0,
                        studentStats.AverageScore,
                        studentStats.HighestScore,
                        studentStats.LowestScore,
                        ScoreDistribution = scoreRanges,
                        AverageCompletionTimeInMinutes = Math.Round(avgCompletionTime / 60, 2)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting statistics: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thống kê kỳ thi chính thức" });
            }
        }

        // Helper methods
        private async Task<OfficialExamDetailDTO> GetOfficialExamDetail(int id)
        {
            var officialExam = await _context.OfficialExams
                .Include(oe => oe.Exam)
                    .ThenInclude(e => e.Subject)
                .Include(oe => oe.Exam)
                    .ThenInclude(e => e.ExamType)
                .Include(oe => oe.Creator)
                .FirstOrDefaultAsync(oe => oe.Id == id);

            if (officialExam == null)
            {
                return null;
            }

            // Get student counts
            int assignedCount = await _context.OfficialExamStudents
                .CountAsync(oes => oes.OfficialExamId == id);

            int completedCount = await _context.OfficialExamStudents
                .CountAsync(oes => oes.OfficialExamId == id && oes.HasTaken);

            // Get students
            var students = await _context.OfficialExamStudents
                .Include(oes => oes.Student)
                .Include(oes => oes.ExamResult)
                .Where(oes => oes.OfficialExamId == id)
                .OrderBy(oes => oes.Student.Username)
                .Select(oes => new OfficialExamStudentDTO
                {
                    Id = oes.Id,
                    StudentId = oes.StudentId,
                    StudentName = oes.Student.FullName ?? "Unknown",
                    StudentCode = oes.Student.Username ?? "unknown",
                    HasTaken = oes.HasTaken,
                    ExamResultId = oes.ExamResultId,
                    Score = oes.ExamResult != null ? (double?)oes.ExamResult.Score : null,
                    PercentageScore = oes.ExamResult != null ? (double?)oes.ExamResult.PercentageScore : null,
                    IsPassed = oes.ExamResult != null ? oes.ExamResult.IsPassed : null,
                    CompletedAt = oes.ExamResult != null ? oes.ExamResult.CompletedAt ?? DateTime.MinValue : DateTime.MinValue
                })
                .ToListAsync();

            // Map exam to DTO
            var examDTO = new ExamListDTO
            {
                Id = officialExam.Exam.Id,
                Title = officialExam.Exam.Title,
                Type = officialExam.Exam.ExamType?.Name,
                Description = officialExam.Exam.Description,
                Duration = officialExam.Exam.Duration,
                QuestionCount = await _context.ExamQuestions.CountAsync(eq => eq.ExamId == officialExam.ExamId),
                TotalScore = officialExam.Exam.TotalScore,
                PassScore = officialExam.Exam.PassScore,
                MaxAttempts = officialExam.Exam.MaxAttempts,
                StartTime = officialExam.Exam.StartTime,
                EndTime = officialExam.Exam.EndTime,
                Status = GetExamStatus(officialExam.Exam),
                IsActive = officialExam.Exam.IsActive,
                ShowResult = officialExam.Exam.ShowResult,
                ShowAnswers = officialExam.Exam.ShowAnswers,
                ShuffleQuestions = officialExam.Exam.ShuffleQuestions,
                ShuffleOptions = officialExam.Exam.ShuffleOptions,
                AutoGradeShortAnswer = officialExam.Exam.AutoGradeShortAnswer,
                AllowPartialGrading = officialExam.Exam.AllowPartialGrading,
                CreatedAt = officialExam.Exam.CreatedAt,
                Creator = officialExam.Exam.Creator != null ? new UserBasicDTO
                {
                    Id = officialExam.Exam.Creator.Id,
                    Username = officialExam.Exam.Creator.Username ?? "unknown",
                    FullName = officialExam.Exam.Creator.FullName ?? "Unknown User"
                } : new UserBasicDTO
                {
                    Id = 0,
                    Username = "unknown",
                    FullName = "Unknown User"
                },
                Subject = officialExam.Exam.Subject != null ? new SubjectBasicDTO
                {
                    Id = officialExam.Exam.Subject.Id,
                    Name = officialExam.Exam.Subject.Name,
                    Code = officialExam.Exam.Subject.Code
                } : null,
                QuestionTypeCounts = await GetQuestionTypeStatistics(officialExam.ExamId)
            };

            // Create result
            return new OfficialExamDetailDTO
            {
                Id = officialExam.Id,
                Title = officialExam.Title,
                Description = officialExam.Description,
                ExamId = officialExam.ExamId,
                ExamTitle = officialExam.Exam?.Title,
                StartTime = officialExam.StartTime,
                EndTime = officialExam.EndTime,
                ClassroomName = officialExam.ClassroomName,
                Creator = officialExam.Creator != null ? new UserBasicDTO
                {
                    Id = officialExam.Creator.Id,
                    Username = officialExam.Creator.Username ?? "unknown",
                    FullName = officialExam.Creator.FullName ?? "Unknown User"
                } : new UserBasicDTO
                {
                    Id = 0,
                    Username = "unknown",
                    FullName = "Unknown User"
                },
                IsActive = officialExam.IsActive,
                ResultsReleased = officialExam.ResultsReleased,
                CreatedAt = officialExam.CreatedAt,
                UpdatedAt = officialExam.UpdatedAt,
                AssignedStudentsCount = assignedCount,
                CompletedStudentsCount = completedCount,
                Status = GetOfficialExamStatus(officialExam),
                Exam = examDTO,
                Students = students
            };
        }

        private async Task<QuestionTypeCountDTO> GetQuestionTypeStatistics(int examId)
        {
            var stats = new QuestionTypeCountDTO
            {
                SingleChoiceCount = 0,
                ShortAnswerCount = 0,
                TrueFalseCount = 0
            };

            var examQuestions = await _context.ExamQuestions
                .Include(eq => eq.Question)
                .Where(eq => eq.ExamId == examId)
                .ToListAsync();

            foreach (var eq in examQuestions)
            {
                if (eq.Question == null)
                    continue;

                switch (eq.Question.QuestionType)
                {
                    case 1: // Trắc nghiệm một đáp án
                        stats.SingleChoiceCount++;
                        break;
                    case 3: // Trả lời ngắn
                        stats.ShortAnswerCount++;
                        break;
                    case 5: // Đúng-sai
                        stats.TrueFalseCount++;
                        break;
                }
            }

            return stats;
        }

        private string GetOfficialExamStatus(OfficialExam exam)
        {
            if (!exam.IsActive)
                return "Không hoạt động";

            var now = DateTimeHelper.GetVietnamNow();

            if (exam.StartTime.HasValue && now < exam.StartTime.Value)
                return "Chưa mở";

            if (exam.EndTime.HasValue && now > exam.EndTime.Value)
                return "Đã đóng";

            return "Đang mở";
        }

        private string GetExamStatus(Exam exam)
        {
            if (!exam.IsActive)
                return "Không hoạt động";

            var now = DateTimeHelper.GetVietnamNow();

            if (exam.StartTime.HasValue && now < exam.StartTime.Value)
                return "Chưa mở";

            if (exam.EndTime.HasValue && now > exam.EndTime.Value)
                return "Đã đóng";

            return "Đang mở";
        }

        private int GetCurrentUserId()
        {
            int currentUserId = 0;
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst("UserId");

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                currentUserId = userId;
            }

            return currentUserId;
        }
    }

    // DTO classes for OfficialExam
    public class CreateOfficialExamDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int ExamId { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string ClassroomName { get; set; }
        public List<int> StudentIds { get; set; } = new List<int>();
    }

    public class UpdateOfficialExamDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string ClassroomName { get; set; }
        public bool? IsActive { get; set; }
    }

    public class OfficialExamListDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int ExamId { get; set; }
        public string ExamTitle { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string ClassroomName { get; set; }
        public UserBasicDTO Creator { get; set; }
        public bool IsActive { get; set; }
        public bool ResultsReleased { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int AssignedStudentsCount { get; set; }
        public int CompletedStudentsCount { get; set; }
        public string Status { get; set; }
    }

    public class OfficialExamDetailDTO : OfficialExamListDTO
    {
        public ExamListDTO Exam { get; set; }
        public List<OfficialExamStudentDTO> Students { get; set; }
    }

    public class OfficialExamStudentDTO
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public string StudentCode { get; set; }
        public bool HasTaken { get; set; }
        public int? ExamResultId { get; set; }
        public double? Score { get; set; }
        public double? PercentageScore { get; set; }
        public bool? IsPassed { get; set; }
        public DateTime CompletedAt { get; set; }
    }

    public class AssignStudentsDTO
    {
        public List<int> StudentIds { get; set; } = new List<int>();
    }

    public class ReleaseResultDTO
    {
        public bool Release { get; set; } = true;
        public string NotificationMessage { get; set; }
    }
}