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
    public class ChapterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ChapterController> _logger;

        public ChapterController(ApplicationDbContext context, ILogger<ChapterController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách chương có phân trang và lọc theo môn học
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetChapters(
            [FromQuery] int? subjectId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool includeInactive = false,
            [FromQuery] string searchTerm = null)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách chương: Môn học ID={subjectId}, Trang {page}, Kích thước trang {pageSize}");

                var query = _context.Chapters
                    .Include(c => c.Subject)
                    .AsQueryable();

                // Lọc theo môn học
                if (subjectId.HasValue && subjectId.Value > 0)
                {
                    query = query.Where(c => c.SubjectId == subjectId.Value);
                }

                // Lọc theo trạng thái active
                if (!includeInactive)
                {
                    query = query.Where(c => c.IsActive);
                }

                // Lọc theo từ khóa tìm kiếm
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    searchTerm = searchTerm.Trim().ToLower();
                    query = query.Where(c =>
                        c.Name.ToLower().Contains(searchTerm) ||
                        c.Description.ToLower().Contains(searchTerm));
                }

                // Đếm tổng số bản ghi
                var totalCount = await query.CountAsync();

                // Lấy dữ liệu theo phân trang
                var chapters = await query
                    .OrderBy(c => c.SubjectId)
                    .ThenBy(c => c.OrderIndex)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new ChapterDTO
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        SubjectId = c.SubjectId,
                        SubjectName = c.Subject.Name,
                        OrderIndex = c.OrderIndex,
                        IsActive = c.IsActive,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt,
                        LessonsCount = c.Lessons.Count(l => l.IsActive)
                    })
                    .ToListAsync();

                // Trả về kết quả với thông tin phân trang
                return Ok(new
                {
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    data = chapters
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách chương: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách chương" });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết của một chương theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetChapter(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin chương: ID={id}");

                var chapter = await _context.Chapters
                    .Include(c => c.Subject)
                    .Include(c => c.Lessons.Where(l => l.IsActive))
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (chapter == null)
                {
                    _logger.LogWarning($"Không tìm thấy chương: ID={id}");
                    return NotFound(new { message = "Không tìm thấy chương" });
                }

                var result = new ChapterDetailDTO
                {
                    Id = chapter.Id,
                    Name = chapter.Name,
                    Description = chapter.Description,
                    SubjectId = chapter.SubjectId,
                    SubjectName = chapter.Subject.Name,
                    OrderIndex = chapter.OrderIndex,
                    IsActive = chapter.IsActive,
                    CreatedAt = chapter.CreatedAt,
                    UpdatedAt = chapter.UpdatedAt,
                    Lessons = chapter.Lessons.Select(l => new LessonDTO
                    {
                        Id = l.Id,
                        Name = l.Name,
                        OrderIndex = l.OrderIndex,
                        IsActive = l.IsActive
                    }).OrderBy(l => l.OrderIndex).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy thông tin chương: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin chương" });
            }
        }

        /// <summary>
        /// Tạo chương mới
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> CreateChapter([FromBody] CreateChapterDTO model)
        {
            try
            {
                _logger.LogInformation($"Tạo chương mới: {model.Name}, SubjectId={model.SubjectId}");

                // Kiểm tra môn học tồn tại
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học: ID={model.SubjectId}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Xác định OrderIndex nếu không được cung cấp
                if (model.OrderIndex <= 0)
                {
                    // Lấy OrderIndex lớn nhất trong môn học và cộng thêm 1
                    var maxOrderIndex = await _context.Chapters
                        .Where(c => c.SubjectId == model.SubjectId)
                        .Select(c => c.OrderIndex)
                        .DefaultIfEmpty(0)
                        .MaxAsync();
                    model.OrderIndex = maxOrderIndex + 1;
                }

                // Tạo đối tượng chương mới
                var chapter = new Chapter
                {
                    Name = model.Name,
                    Description = model.Description,
                    SubjectId = model.SubjectId,
                    OrderIndex = model.OrderIndex,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                // Lưu vào database
                _context.Chapters.Add(chapter);
                await _context.SaveChangesAsync();

                // Trả về thông tin chương đã tạo
                return CreatedAtAction(nameof(GetChapter), new { id = chapter.Id }, new
                {
                    id = chapter.Id,
                    name = chapter.Name,
                    description = chapter.Description,
                    subjectId = chapter.SubjectId,
                    orderIndex = chapter.OrderIndex,
                    createdAt = chapter.CreatedAt,
                    message = "Tạo chương thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo chương: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo chương mới" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin chương
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateChapter(int id, [FromBody] UpdateChapterDTO model)
        {
            try
            {
                _logger.LogInformation($"Cập nhật chương: ID={id}");

                var chapter = await _context.Chapters.FindAsync(id);
                if (chapter == null)
                {
                    _logger.LogWarning($"Không tìm thấy chương: ID={id}");
                    return NotFound(new { message = "Không tìm thấy chương" });
                }

                // Cập nhật thông tin
                if (!string.IsNullOrEmpty(model.Name))
                    chapter.Name = model.Name;

                if (!string.IsNullOrEmpty(model.Description))
                    chapter.Description = model.Description;

                if (model.OrderIndex > 0)
                    chapter.OrderIndex = model.OrderIndex;

                if (model.IsActive.HasValue)
                    chapter.IsActive = model.IsActive.Value;

                // Cập nhật môn học nếu được cung cấp và thay đổi
                if (model.SubjectId.HasValue && model.SubjectId.Value > 0 && model.SubjectId.Value != chapter.SubjectId)
                {
                    // Kiểm tra môn học tồn tại
                    var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == model.SubjectId.Value);
                    if (!subjectExists)
                    {
                        return NotFound(new { message = "Không tìm thấy môn học" });
                    }

                    chapter.SubjectId = model.SubjectId.Value;
                }

                chapter.UpdatedAt = DateTime.UtcNow;

                // Lưu thay đổi
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = chapter.Id,
                    name = chapter.Name,
                    description = chapter.Description,
                    subjectId = chapter.SubjectId,
                    orderIndex = chapter.OrderIndex,
                    isActive = chapter.IsActive,
                    updatedAt = chapter.UpdatedAt,
                    message = "Cập nhật chương thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật chương: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật chương" });
            }
        }

        /// <summary>
        /// Xóa chương
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteChapter(int id)
        {
            try
            {
                _logger.LogInformation($"Xóa chương: ID={id}");

                var chapter = await _context.Chapters
                    .Include(c => c.Lessons)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (chapter == null)
                {
                    _logger.LogWarning($"Không tìm thấy chương: ID={id}");
                    return NotFound(new { message = "Không tìm thấy chương" });
                }

                // Kiểm tra xem chương có bài học không
                if (chapter.Lessons != null && chapter.Lessons.Any())
                {
                    _logger.LogWarning($"Không thể xóa chương: ID={id}, có {chapter.Lessons.Count} bài học");
                    return BadRequest(new
                    {
                        message = "Không thể xóa chương này vì có bài học liên quan. Hãy xóa các bài học trước."
                    });
                }

                // Xóa chương
                _context.Chapters.Remove(chapter);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa chương thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa chương: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa chương" });
            }
        }
        /// <summary>
        /// DTO hiển thị thông tin chương trong danh sách
        /// </summary>
        public class ChapterDTO
        {
            /// <summary>
            /// ID của chương
            /// </summary>
            /// <example>1</example>
            public int Id { get; set; }

            /// <summary>
            /// Tên chương
            /// </summary>
            /// <example>Đạo hàm</example>
            public string Name { get; set; }

            /// <summary>
            /// Mô tả chương
            /// </summary>
            /// <example>Kiến thức cơ bản về đạo hàm và ứng dụng</example>
            public string Description { get; set; }

            /// <summary>
            /// ID của môn học
            /// </summary>
            /// <example>1</example>
            public int SubjectId { get; set; }

            /// <summary>
            /// Tên môn học
            /// </summary>
            /// <example>Toán 12</example>
            public string SubjectName { get; set; }

            /// <summary>
            /// Thứ tự hiển thị
            /// </summary>
            /// <example>1</example>
            public int OrderIndex { get; set; }

            /// <summary>
            /// Trạng thái kích hoạt
            /// </summary>
            /// <example>true</example>
            public bool IsActive { get; set; }

            /// <summary>
            /// Thời gian tạo
            /// </summary>
            public DateTime CreatedAt { get; set; }

            /// <summary>
            /// Thời gian cập nhật gần nhất
            /// </summary>
            public DateTime? UpdatedAt { get; set; }

            /// <summary>
            /// Số lượng bài học trong chương
            /// </summary>
            /// <example>5</example>
            public int LessonsCount { get; set; }
        }
    }
}
