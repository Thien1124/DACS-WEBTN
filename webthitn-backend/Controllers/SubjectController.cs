using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.Models;
using webthitn_backend.DTOs;

namespace webthitn_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SubjectController> _logger;

        public SubjectController(ApplicationDbContext context, ILogger<SubjectController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách môn học có phân trang
        /// </summary>
        /// <param name="page">Trang hiện tại</param>
        /// <param name="pageSize">Số lượng mỗi trang</param>
        /// <param name="includeInactive">Có hiển thị môn học không hoạt động</param>
        /// <returns>Danh sách môn học được phân trang</returns>
        [HttpGet]
        public async Task<IActionResult> GetSubjects(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool includeInactive = false,
            [FromQuery] string searchTerm = null)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách môn học: Trang {page}, Kích thước trang {pageSize}, Bao gồm không hoạt động: {includeInactive}");

                var query = _context.Subjects.AsQueryable();

                // Lọc theo trạng thái active
                if (!includeInactive)
                {
                    query = query.Where(s => s.IsActive);
                }

                // Lọc theo từ khóa tìm kiếm
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    searchTerm = searchTerm.Trim().ToLower();
                    query = query.Where(s =>
                        s.Name.ToLower().Contains(searchTerm) ||
                        s.Code.ToLower().Contains(searchTerm) ||
                        s.Description.ToLower().Contains(searchTerm));
                }

                // Đếm tổng số bản ghi
                var totalCount = await query.CountAsync();

                // Lấy dữ liệu theo phân trang
                var subjects = await query
                    .OrderBy(s => s.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(s => new SubjectListDTO
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Code = s.Code,
                        Description = s.Description,
                        IsActive = s.IsActive,
                        CreatedAt = s.CreatedAt,
                        UpdatedAt = s.UpdatedAt,
                        ChaptersCount = s.Chapters.Count(c => c.IsActive),
                        ExamsCount = s.Exams.Count
                    })
                    .ToListAsync();

                // Trả về kết quả với thông tin phân trang
                return Ok(new
                {
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    data = subjects
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách môn học: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách môn học" });
            }
        }

        /// <summary>
        /// Lấy chi tiết một môn học theo ID
        /// </summary>
        /// <param name="id">ID của môn học</param>
        /// <returns>Thông tin chi tiết môn học</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubject(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin chi tiết môn học ID: {id}");

                var subject = await _context.Subjects
                    .Include(s => s.Chapters.Where(c => c.IsActive))
                        .ThenInclude(c => c.Lessons.Where(l => l.IsActive))
                    .Include(s => s.Exams)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {id}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Chuyển đổi sang DTO
                var subjectDetail = new SubjectDetailDTO
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Code = subject.Code,
                    Description = subject.Description,
                    IsActive = subject.IsActive,
                    CreatedAt = subject.CreatedAt,
                    UpdatedAt = subject.UpdatedAt,
                    Chapters = subject.Chapters?
                        .OrderBy(c => c.OrderIndex)
                        .Select(c => new ChapterBasicDTO
                        {
                            Id = c.Id,
                            Name = c.Name,
                            Description = c.Description,
                            OrderIndex = c.OrderIndex,
                            IsActive = c.IsActive,
                            LessonsCount = c.Lessons?.Count ?? 0
                        }),
                    ExamsCount = subject.Exams?.Count ?? 0
                };

                return Ok(subjectDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy thông tin môn học (ID: {id}): {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin môn học" });
            }
        }

        /// <summary>
        /// Tạo môn học mới
        /// </summary>
        /// <param name="model">Thông tin môn học cần tạo</param>
        /// <returns>Thông tin môn học đã tạo</returns>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost]
        public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDTO model)
        {
            try
            {
                _logger.LogInformation($"Tạo môn học mới: {model.Name}, Mã: {model.Code}");

                // Validate dữ liệu đầu vào
                if (string.IsNullOrEmpty(model.Name))
                {
                    return BadRequest(new { message = "Tên môn học không được để trống" });
                }

                // Kiểm tra xem mã môn học đã tồn tại chưa
                if (!string.IsNullOrEmpty(model.Code))
                {
                    var existingSubject = await _context.Subjects
                        .FirstOrDefaultAsync(s => s.Code.ToLower() == model.Code.ToLower());

                    if (existingSubject != null)
                    {
                        _logger.LogWarning($"Mã môn học đã tồn tại: {model.Code}");
                        return Conflict(new { message = "Mã môn học đã tồn tại" });
                    }
                }

                // Tạo đối tượng môn học mới
                var subject = new Subject
                {
                    Name = model.Name.Trim(),
                    Code = model.Code?.Trim() ?? "", // Đảm bảo không null
                    Description = model.Description?.Trim() ?? "", // Đảm bảo không null
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Subjects.Add(subject);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã tạo thành công môn học ID: {subject.Id}");

                // Trả về thông tin môn học mới đã tạo
                return CreatedAtAction(nameof(GetSubject), new { id = subject.Id }, new SubjectListDTO
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Code = subject.Code,
                    Description = subject.Description,
                    IsActive = subject.IsActive,
                    CreatedAt = subject.CreatedAt,
                    ChaptersCount = 0,
                    ExamsCount = 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo môn học: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo môn học" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin môn học
        /// </summary>
        /// <param name="id">ID của môn học cần cập nhật</param>
        /// <param name="model">Thông tin cần cập nhật</param>
        /// <returns>Thông tin môn học sau khi cập nhật</returns>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] UpdateSubjectDTO model)
        {
            try
            {
                _logger.LogInformation($"Cập nhật môn học ID: {id}");

                var subject = await _context.Subjects.FindAsync(id);
                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {id}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Validate dữ liệu đầu vào
                if (string.IsNullOrEmpty(model.Name))
                {
                    return BadRequest(new { message = "Tên môn học không được để trống" });
                }

                // Kiểm tra xem mã môn học mới có trùng với môn học khác không
                if (!string.IsNullOrEmpty(model.Code) && model.Code != subject.Code)
                {
                    var existingSubject = await _context.Subjects
                        .FirstOrDefaultAsync(s => s.Code.ToLower() == model.Code.ToLower() && s.Id != id);

                    if (existingSubject != null)
                    {
                        _logger.LogWarning($"Mã môn học đã được sử dụng bởi môn học khác: {model.Code}");
                        return Conflict(new { message = "Mã môn học đã được sử dụng bởi môn học khác" });
                    }
                }

                // Cập nhật thông tin
                subject.Name = model.Name.Trim();
                subject.Code = model.Code?.Trim() ?? subject.Code;
                subject.Description = model.Description?.Trim() ?? subject.Description;
                subject.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation($"Cập nhật thành công môn học ID: {id}");

                // Trả về thông tin sau khi cập nhật
                return Ok(new SubjectListDTO
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Code = subject.Code,
                    Description = subject.Description,
                    IsActive = subject.IsActive,
                    CreatedAt = subject.CreatedAt,
                    UpdatedAt = subject.UpdatedAt,
                    ChaptersCount = subject.Chapters?.Count(c => c.IsActive) ?? 0,
                    ExamsCount = subject.Exams?.Count ?? 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật môn học (ID: {id}): {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật môn học" });
            }
        }

        /// <summary>
        /// Thay đổi trạng thái kích hoạt/vô hiệu hóa môn học
        /// </summary>
        /// <param name="id">ID của môn học</param>
        /// <returns>Thông tin và trạng thái mới</returns>
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleSubjectStatus(int id)
        {
            try
            {
                _logger.LogInformation($"Thay đổi trạng thái môn học ID: {id}");

                var subject = await _context.Subjects.FindAsync(id);
                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {id}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Đảo ngược trạng thái
                subject.IsActive = !subject.IsActive;
                subject.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation($"Đã thay đổi trạng thái môn học ID: {id} sang {(subject.IsActive ? "kích hoạt" : "vô hiệu hóa")}");

                return Ok(new
                {
                    id = subject.Id,
                    name = subject.Name,
                    isActive = subject.IsActive,
                    message = subject.IsActive ?
                        "Môn học đã được kích hoạt thành công" :
                        "Môn học đã bị vô hiệu hóa thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi thay đổi trạng thái môn học (ID: {id}): {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi thay đổi trạng thái môn học" });
            }
        }

        /// <summary>
        /// Xóa môn học
        /// </summary>
        /// <param name="id">ID của môn học cần xóa</param>
        /// <returns>Thông báo kết quả</returns>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            try
            {
                _logger.LogInformation($"Yêu cầu xóa môn học ID: {id}");

                var subject = await _context.Subjects
                    .Include(s => s.Chapters)
                    .Include(s => s.Exams)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {id}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Kiểm tra xem môn học có chương hoặc bài thi không
                if ((subject.Chapters != null && subject.Chapters.Count > 0) ||
                    (subject.Exams != null && subject.Exams.Count > 0))
                {
                    _logger.LogWarning($"Không thể xóa môn học ID: {id} vì đã có chương hoặc bài thi liên kết");
                    return BadRequest(new
                    {
                        message = "Không thể xóa môn học vì đã có chương hoặc bài thi liên kết. Hãy vô hiệu hóa môn học thay vì xóa.",
                        chaptersCount = subject.Chapters?.Count ?? 0,
                        examsCount = subject.Exams?.Count ?? 0
                    });
                }

                _context.Subjects.Remove(subject);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Đã xóa thành công môn học ID: {id}");

                return Ok(new { message = "Xóa môn học thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa môn học (ID: {id}): {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa môn học" });
            }
        }

        /// <summary>
        /// Lấy tất cả môn học không phân trang (sử dụng cho dropdown)
        /// </summary>
        /// <param name="activeOnly">Chỉ lấy môn học đang hoạt động</param>
        /// <returns>Danh sách môn học đơn giản</returns>
        [HttpGet("all")]
        public async Task<IActionResult> GetAllSubjects([FromQuery] bool activeOnly = true)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách tất cả môn học, chỉ môn học hoạt động: {activeOnly}");

                var query = _context.Subjects.AsQueryable();

                // Chỉ lấy các môn học đang hoạt động nếu có yêu cầu
                if (activeOnly)
                {
                    query = query.Where(s => s.IsActive);
                }

                var subjects = await query
                    .OrderBy(s => s.Name)
                    .Select(s => new SubjectDropdownDTO
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Code = s.Code
                    })
                    .ToListAsync();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách tất cả môn học: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách môn học" });
            }
        }
    }
}