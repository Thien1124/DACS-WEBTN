using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Services;

namespace webthitn_backend.Controllers
{
    [Route("api/videos")]
    [ApiController]
    [Authorize(Roles = "Admin,Teacher")]
    public class VideosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VideosController> _logger;
        private readonly IFileStorageService _fileStorageService;

        public VideosController(
            ApplicationDbContext context,
            ILogger<VideosController> logger,
            IFileStorageService fileStorageService)
        {
            _context = context;
            _logger = logger;
            _fileStorageService = fileStorageService;
        }

        /// <summary>
        /// Upload video ôn tập cho môn học
        /// </summary>
        /// <remarks>
        /// API này cho phép giáo viên hoặc admin upload video ôn tập cho một môn học cụ thể.
        /// Video phải có định dạng mp4, avi, mov, wmv hoặc mkv và kích thước không quá 500MB.
        /// 
        /// Sample request:
        /// 
        ///     POST /api/videos/upload
        ///     Content-Type: multipart/form-data
        ///     Form data:
        ///       - file: [video file]
        ///       - title: "Ôn tập Toán học chương 3"
        ///       - description: "Video ôn tập về đạo hàm và tích phân"
        ///       - subjectId: 1
        ///       - chapterId: 3 (optional)
        ///       - tags: "đạo hàm, tích phân" (optional)
        /// 
        /// </remarks>
        /// <param name="file">File video cần upload</param>
        /// <param name="title">Tiêu đề video</param>
        /// <param name="description">Mô tả video (tùy chọn)</param>
        /// <param name="subjectId">ID của môn học</param>
        /// <param name="chapterId">ID của chương học (tùy chọn)</param>
        /// <param name="tags">Các tag, phân cách bởi dấu phẩy (tùy chọn)</param>
        /// <returns>Thông tin video đã upload bao gồm URL để xem</returns>
        /// <response code="201">Video đã được upload thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="401">Không có quyền truy cập</response>
        /// <response code="413">File quá lớn</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [RequestFormLimits(MultipartBodyLengthLimit = 524288000)] // 500MB
        [RequestSizeLimit(524288000)] // 500MB
        public async Task<IActionResult> UploadVideo(
            IFormFile file,
            [FromForm] string title,
            [FromForm] string description = null,
            [FromForm] int subjectId = 0,
            [FromForm] int? chapterId = null,
            [FromForm] string tags = null)
        {
            try
            {
                _logger.LogInformation($"Bắt đầu upload video: {title}");

                // Validate dữ liệu đầu vào
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

                // Kiểm tra định dạng file
                var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".mkv" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Định dạng file không được hỗ trợ. Chỉ hỗ trợ mp4, avi, mov, wmv, mkv"
                    });
                }

                // Kiểm tra kích thước file (max 500MB)
                if (file.Length > 524288000) // 500MB in bytes
                {
                    return StatusCode(StatusCodes.Status413PayloadTooLarge, new
                    {
                        Success = false,
                        Message = "File quá lớn. Kích thước tối đa là 500MB"
                    });
                }

                // Kiểm tra môn học tồn tại
                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null)
                {
                    return BadRequest(new { Success = false, Message = "Môn học không tồn tại" });
                }

                // Kiểm tra chapter nếu có
                if (chapterId.HasValue)
                {
                    var chapter = await _context.Chapters.FindAsync(chapterId.Value);
                    if (chapter == null || chapter.SubjectId != subjectId)
                    {
                        return BadRequest(new
                        {
                            Success = false,
                            Message = "Chương học không tồn tại hoặc không thuộc môn học đã chọn"
                        });
                    }
                }

                // Lấy user id từ token
                var userIdClaim = User.FindFirst("userId") ?? User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Tạo tên file duy nhất
                var fileName = $"{Guid.NewGuid()}{fileExtension}";

                // Upload file và tạo thumbnail
                var (videoUrl, thumbnailUrl, duration) = await _fileStorageService.SaveVideoAsync(
                    file.OpenReadStream(),
                    fileName,
                    fileExtension);

                // Tạo entity video mới
                var video = new VideoResource
                {
                    Title = title,
                    Description = description,
                    SubjectId = subjectId,
                    ChapterId = chapterId,
                    Url = videoUrl,
                    ThumbnailUrl = thumbnailUrl,
                    FileSize = file.Length,
                    Duration = duration,
                    FileType = fileExtension.TrimStart('.'),
                    Tags = tags,
                    UploadedById = userId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Lưu vào database
                _context.VideoResources.Add(video);
                await _context.SaveChangesAsync();

                // Trả về kết quả
                return StatusCode(StatusCodes.Status201Created, new
                {
                    Success = true,
                    Message = "Upload video thành công",
                    Data = new VideoDTO
                    {
                        Id = video.Id,
                        Title = video.Title,
                        Description = video.Description,
                        Url = video.Url,
                        ThumbnailUrl = video.ThumbnailUrl,
                        Duration = video.Duration,
                        FileSize = video.FileSize,
                        FileType = video.FileType,
                        SubjectId = video.SubjectId,
                        SubjectName = subject.Name,
                        ChapterId = video.ChapterId,
                        Tags = video.Tags,
                        CreatedAt = video.CreatedAt,
                        ViewCount = 0
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi upload video: {ex.Message}");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi upload video",
                    Error = ex.Message
                });
            }
        }
    }
}