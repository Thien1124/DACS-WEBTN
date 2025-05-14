using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    [Route("api/materials")]
    [ApiController]
    public class MaterialsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MaterialsController> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public MaterialsController(
            ApplicationDbContext context,
            ILogger<MaterialsController> logger,
            IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
        }

        /// <summary>
        /// Lấy danh sách tài liệu ôn tập
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy danh sách tài liệu ôn tập (PDF, slides, etc.) theo các tiêu chí lọc.
        /// </remarks>
        /// <param name="subjectId">ID của môn học (tùy chọn)</param>
        /// <param name="chapterId">ID của chương học (tùy chọn)</param>
        /// <param name="gradeId">ID của khối lớp (tùy chọn)</param>
        /// <param name="documentType">Loại tài liệu (PDF, Slide, etc.) (tùy chọn)</param>
        /// <param name="search">Từ khóa tìm kiếm (tùy chọn)</param>
        /// <param name="page">Số trang, mặc định là 1</param>
        /// <param name="pageSize">Kích thước trang, mặc định là 10</param>
        /// <returns>Danh sách tài liệu ôn tập phù hợp với tiêu chí lọc</returns>
        [HttpGet("documents")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDocuments(
            [FromQuery] int? subjectId = null,
            [FromQuery] int? chapterId = null,
            [FromQuery] int? gradeId = null,
            [FromQuery] string documentType = null,
            [FromQuery] string search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1 || pageSize < 1 || pageSize > 50)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Tham số phân trang không hợp lệ. Page phải >= 1 và 1 <= PageSize <= 50"
                    });
                }

                // Xây dựng query
                var query = _context.DocumentResources
                    .Where(d => d.IsActive)
                    .AsQueryable();

                // Áp dụng các bộ lọc
                if (subjectId.HasValue)
                {
                    query = query.Where(d => d.SubjectId == subjectId.Value);
                }

                if (chapterId.HasValue)
                {
                    query = query.Where(d => d.ChapterId == chapterId.Value);
                }

                if (gradeId.HasValue)
                {
                    query = query.Where(d => d.GradeId == gradeId.Value);
                }

                if (!string.IsNullOrEmpty(documentType))
                {
                    query = query.Where(d => d.DocumentType.ToLower() == documentType.ToLower());
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    query = query.Where(d =>
                        d.Title.ToLower().Contains(search) ||
                        (d.Description != null && d.Description.ToLower().Contains(search)) ||
                        (d.Tags != null && d.Tags.ToLower().Contains(search))
                    );
                }

                // Đếm tổng số kết quả
                var totalCount = await query.CountAsync();

                // Phân trang
                var documents = await query
                    .Include(d => d.Subject)
                    .Include(d => d.Chapter)
                    .OrderByDescending(d => d.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Map sang DTO
                var documentDTOs = documents.Select(d => new DocumentDTO
                {
                    Id = d.Id,
                    Title = d.Title,
                    Description = d.Description,
                    Url = d.Url,
                    ThumbnailUrl = d.ThumbnailUrl,
                    FileSize = d.FileSize,
                    FileType = d.FileType,
                    DocumentType = d.DocumentType,
                    SubjectId = d.SubjectId,
                    SubjectName = d.Subject?.Name,
                    ChapterId = d.ChapterId,
                    ChapterName = d.Chapter?.Name,
                    GradeId = d.GradeId,
                    Tags = d.Tags,
                    CreatedAt = d.CreatedAt,
                    DownloadCount = d.DownloadCount
                }).ToList();

                // Trả về kết quả
                return Ok(new
                {
                    Success = true,
                    TotalCount = totalCount,
                    PageCount = (int)Math.Ceiling((double)totalCount / pageSize),
                    CurrentPage = page,
                    PageSize = pageSize,
                    Data = documentDTOs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách tài liệu: {ex.Message}");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi lấy danh sách tài liệu",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy chi tiết tài liệu theo ID
        /// </summary>
        /// <param name="id">ID của tài liệu</param>
        /// <returns>Thông tin chi tiết của tài liệu</returns>
        [HttpGet("documents/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDocumentById(int id)
        {
            try
            {
                var document = await _context.DocumentResources
                    .Include(d => d.Subject)
                    .Include(d => d.Chapter)
                    .FirstOrDefaultAsync(d => d.Id == id && d.IsActive);

                if (document == null)
                {
                    return NotFound(new { Success = false, Message = "Không tìm thấy tài liệu" });
                }

                // Tăng số lượt xem
                document.DownloadCount++;
                await _context.SaveChangesAsync();

                var documentDTO = new DocumentDTO
                {
                    Id = document.Id,
                    Title = document.Title,
                    Description = document.Description,
                    Url = document.Url,
                    ThumbnailUrl = document.ThumbnailUrl,
                    FileSize = document.FileSize,
                    FileType = document.FileType,
                    DocumentType = document.DocumentType,
                    SubjectId = document.SubjectId,
                    SubjectName = document.Subject?.Name,
                    ChapterId = document.ChapterId,
                    ChapterName = document.Chapter?.Name,
                    GradeId = document.GradeId,
                    Tags = document.Tags,
                    CreatedAt = document.CreatedAt,
                    DownloadCount = document.DownloadCount
                };

                return Ok(new { Success = true, Data = documentDTO });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy thông tin tài liệu: {ex.Message}");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi lấy thông tin tài liệu",
                    Error = ex.Message
                });
            }
        }

        // API để upload tài liệu (tương tự như upload video)
        [HttpPost("documents/upload")]
        [Authorize(Roles = "Admin,Teacher")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
        [RequestFormLimits(MultipartBodyLengthLimit = 104857600)] // 100MB
        [RequestSizeLimit(104857600)] // 100MB
        public async Task<IActionResult> UploadDocument(
            IFormFile file,
            [FromForm] string title,
            [FromForm] string description = null,
            [FromForm] int subjectId = 0,
            [FromForm] int? chapterId = null,
            [FromForm] int? gradeId = null,
            [FromForm] string documentType = null,
            [FromForm] string tags = null)
        {
            try
            {
                // Validate inputs
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { Success = false, Message = "Không có file được upload" });
                }

                if (string.IsNullOrEmpty(title))
                {
                    return BadRequest(new { Success = false, Message = "Tiêu đề không được để trống" });
                }

                if (subjectId <= 0)
                {
                    return BadRequest(new { Success = false, Message = "Phải chọn môn học" });
                }

                // Check file extension
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar", ".txt" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Định dạng file không được hỗ trợ. Chỉ hỗ trợ các định dạng phổ biến như PDF, DOC, PPT, XLS, ZIP, RAR, TXT"
                    });
                }

                // Check file size (100MB max)
                if (file.Length > 104857600)
                {
                    return StatusCode(StatusCodes.Status413PayloadTooLarge, new
                    {
                        Success = false,
                        Message = "File quá lớn. Kích thước tối đa là 100MB"
                    });
                }

                // Verify subject exists
                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null)
                {
                    return BadRequest(new { Success = false, Message = "Môn học không tồn tại" });
                }

                // Verify chapter if provided
                if (chapterId.HasValue && chapterId.Value > 0)
                {
                    var chapter = await _context.Chapters.FindAsync(chapterId.Value);
                    if (chapter == null)
                    {
                        return BadRequest(new { Success = false, Message = "Chương học không tồn tại" });
                    }
                }

                // Get user ID from claims
                int currentUserId;
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out currentUserId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Create upload directory if it doesn't exist
                var documentsDir = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "documents");
                if (!Directory.Exists(documentsDir))
                {
                    Directory.CreateDirectory(documentsDir);
                }

                // Generate unique filename
                var fileId = Guid.NewGuid().ToString();
                var fileName = $"doc_{currentUserId}_{fileId}{fileExtension}";
                var filePath = Path.Combine(documentsDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Get document type if not specified
                if (string.IsNullOrEmpty(documentType))
                {
                    documentType = fileExtension.TrimStart('.').ToUpper();
                }

                // Create document record
                var document = new DocumentResource
                {
                    Title = title,
                    Description = description,
                    Url = $"/uploads/documents/{fileName}",
                    ThumbnailUrl = fileExtension.Contains("pdf") ? "/images/pdf-icon.png" : 
                                   fileExtension.Contains("doc") ? "/images/doc-icon.png" : 
                                   fileExtension.Contains("xls") ? "/images/xls-icon.png" : 
                                   fileExtension.Contains("ppt") ? "/images/ppt-icon.png" : 
                                   "/images/document-icon.png",
                    FileSize = file.Length,
                    FileType = fileExtension.TrimStart('.').ToLower(),
                    DocumentType = documentType,
                    SubjectId = subjectId,
                    ChapterId = chapterId,
                    GradeId = gradeId,
                    Tags = tags ?? "",
                    UploadedById = currentUserId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    DownloadCount = 0
                };

                _context.DocumentResources.Add(document);
                await _context.SaveChangesAsync();

                // Return success response
                return StatusCode(StatusCodes.Status201Created, new
                {
                    Success = true,
                    Message = "Tài liệu đã được tải lên thành công",
                    Data = new
                    {
                        Id = document.Id,
                        Title = document.Title,
                        Description = document.Description,
                        Url = document.Url,
                        FileSize = document.FileSize,
                        FileType = document.FileType,
                        DocumentType = document.DocumentType,
                        SubjectId = document.SubjectId,
                        ChapterId = document.ChapterId,
                        GradeId = document.GradeId,
                        Tags = document.Tags,
                        CreatedAt = document.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi upload tài liệu: {ex.Message}");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi upload tài liệu",
                    Error = ex.Message
                });
            }
        }
    }
}