using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    [Route("api/tests")]
    [ApiController]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FeedbackController> _logger;

        public FeedbackController(ApplicationDbContext context, ILogger<FeedbackController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Gửi phản hồi về bài thi
        /// </summary>
        /// <param name="id">ID của bài thi</param>
        /// <param name="model">Nội dung phản hồi</param>
        /// <returns>Thông tin phản hồi đã gửi</returns>
        [HttpPost("{id}/feedback")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateFeedback(int id, [FromBody] CreateFeedbackDTO model)
        {
            try
            {
                _logger.LogInformation($"Gửi phản hồi cho bài thi ID: {id}");

                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrWhiteSpace(model.Content))
                {
                    return BadRequest(new { Success = false, Message = "Nội dung phản hồi không được để trống" });
                }

                // Kiểm tra bài thi tồn tại
                var exam = await _context.Exams.FindAsync(id);
                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy bài thi ID: {id}");
                    return NotFound(new { Success = false, Message = "Không tìm thấy bài thi" });
                }

                // Lấy user id từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Kiểm tra câu hỏi tồn tại (nếu có)
                if (model.QuestionId.HasValue)
                {
                    var question = await _context.Questions.FindAsync(model.QuestionId.Value);
                    if (question == null)
                    {
                        return BadRequest(new { Success = false, Message = "Câu hỏi không tồn tại" });
                    }

                    // Kiểm tra xem câu hỏi có thuộc bài thi không
                    bool questionInExam = await _context.ExamQuestions
                        .AnyAsync(eq => eq.ExamId == id && eq.QuestionId == model.QuestionId.Value);

                    if (!questionInExam)
                    {
                        return BadRequest(new { Success = false, Message = "Câu hỏi không thuộc bài thi này" });
                    }
                }

                // Kiểm tra loại phản hồi hợp lệ
                if (!Enum.IsDefined(typeof(FeedbackType), model.FeedbackType))
                {
                    model.FeedbackType = (int)FeedbackType.General;
                }

                // Tạo phản hồi mới
                var feedback = new ExamFeedback
                {
                    ExamId = id,
                    UserId = userId,
                    Content = model.Content.Trim(),
                    // FIX: Thêm giá trị mặc định cho ResponseContent
                    ResponseContent = "",  // Giá trị mặc định rỗng thay vì null
                    CreatedAt = DateTime.UtcNow,
                    Status = FeedbackStatus.Pending,
                    Type = (FeedbackType)model.FeedbackType,
                    QuestionId = model.QuestionId
                };

                _context.ExamFeedbacks.Add(feedback);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã tạo phản hồi ID: {feedback.Id} cho bài thi ID: {id}");

                // Tạo response
                var createdFeedback = await _context.ExamFeedbacks
                    .Include(f => f.User)
                    .Include(f => f.Exam)
                    .Include(f => f.Question)
                    .FirstOrDefaultAsync(f => f.Id == feedback.Id);

                var result = new FeedbackDTO
                {
                    Id = createdFeedback.Id,
                    ExamId = createdFeedback.ExamId,
                    ExamTitle = createdFeedback.Exam.Title,
                    UserId = createdFeedback.UserId,
                    UserName = createdFeedback.User?.FullName ?? createdFeedback.User?.Username,
                    Content = createdFeedback.Content,
                    CreatedAt = createdFeedback.CreatedAt,
                    Status = createdFeedback.Status.ToString(),
                    Type = createdFeedback.Type.ToString(),
                    QuestionId = createdFeedback.QuestionId,
                    QuestionContent = createdFeedback.Question?.Content
                };

                return CreatedAtAction(nameof(GetFeedback), new { id = feedback.Id }, new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tạo phản hồi cho bài thi ID: {id}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi tạo phản hồi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin một phản hồi
        /// </summary>
        /// <param name="id">ID của phản hồi</param>
        /// <returns>Thông tin chi tiết phản hồi</returns>
        [HttpGet("feedback/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFeedback(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin phản hồi ID: {id}");

                var feedback = await _context.ExamFeedbacks
                    .Include(f => f.User)
                    .Include(f => f.Exam)
                    .Include(f => f.Question)
                    .Include(f => f.ResolvedBy)
                    .FirstOrDefaultAsync(f => f.Id == id);

                if (feedback == null)
                {
                    _logger.LogWarning($"Không tìm thấy phản hồi ID: {id}");
                    return NotFound(new { Success = false, Message = "Không tìm thấy phản hồi" });
                }

                // Lấy user id từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Kiểm tra quyền truy cập - chỉ admin hoặc người gửi phản hồi mới có quyền xem
                bool isAdmin = User.IsInRole("Admin");

                if (!isAdmin && feedback.UserId != userId)
                {
                    _logger.LogWarning($"Người dùng không có quyền xem phản hồi ID: {id}");
                    return StatusCode(403, new { Success = false, Message = "Bạn không có quyền xem phản hồi này" });
                }

                var result = new FeedbackDTO
                {
                    Id = feedback.Id,
                    ExamId = feedback.ExamId,
                    ExamTitle = feedback.Exam?.Title,
                    UserId = feedback.UserId,
                    UserName = feedback.User?.FullName ?? feedback.User?.Username,
                    Content = feedback.Content,
                    ResponseContent = feedback.ResponseContent,
                    CreatedAt = feedback.CreatedAt,
                    ResolvedAt = feedback.ResolvedAt,
                    Status = feedback.Status.ToString(),
                    Type = feedback.Type.ToString(),
                    QuestionId = feedback.QuestionId,
                    QuestionContent = feedback.Question?.Content,
                    ResolvedById = feedback.ResolvedById,
                    ResolvedByName = feedback.ResolvedBy?.FullName ?? feedback.ResolvedBy?.Username
                };

                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin phản hồi ID: {id}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy thông tin phản hồi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Xử lý phản hồi bài thi (chỉ admin)
        /// </summary>
        /// <param name="id">ID của bài thi</param>
        /// <param name="feedbackId">ID của phản hồi</param>
        /// <param name="model">Thông tin xử lý</param>
        /// <returns>Kết quả xử lý phản hồi</returns>
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/resolve-feedback/{feedbackId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ResolveFeedback(int id, int feedbackId, [FromBody] ResolveFeedbackDTO model)
        {
            try
            {
                _logger.LogInformation($"Xử lý phản hồi ID: {feedbackId} của bài thi ID: {id}");

                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrWhiteSpace(model.ResponseContent))
                {
                    return BadRequest(new { Success = false, Message = "Nội dung phản hồi không được để trống" });
                }

                // Kiểm tra trạng thái hợp lệ
                if (model.Status != (int)FeedbackStatus.InProcess &&
                    model.Status != (int)FeedbackStatus.Resolved &&
                    model.Status != (int)FeedbackStatus.Rejected)
                {
                    return BadRequest(new { Success = false, Message = "Trạng thái không hợp lệ" });
                }

                // Kiểm tra bài thi tồn tại
                var exam = await _context.Exams.FindAsync(id);
                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy bài thi ID: {id}");
                    return NotFound(new { Success = false, Message = "Không tìm thấy bài thi" });
                }

                // Kiểm tra phản hồi tồn tại và thuộc về bài thi
                var feedback = await _context.ExamFeedbacks
                    .FirstOrDefaultAsync(f => f.Id == feedbackId && f.ExamId == id);

                if (feedback == null)
                {
                    _logger.LogWarning($"Không tìm thấy phản hồi ID: {feedbackId} cho bài thi ID: {id}");
                    return NotFound(new { Success = false, Message = "Không tìm thấy phản hồi cho bài thi này" });
                }

                // Lấy user id từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Cập nhật phản hồi
                feedback.ResponseContent = model.ResponseContent.Trim();
                feedback.Status = (FeedbackStatus)model.Status;
                feedback.ResolvedById = userId;
                feedback.ResolvedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã xử lý phản hồi ID: {feedbackId} cho bài thi ID: {id}");

                // Tạo response
                var updatedFeedback = await _context.ExamFeedbacks
                    .Include(f => f.User)
                    .Include(f => f.Exam)
                    .Include(f => f.Question)
                    .Include(f => f.ResolvedBy)
                    .FirstOrDefaultAsync(f => f.Id == feedbackId);

                var result = new FeedbackDTO
                {
                    Id = updatedFeedback.Id,
                    ExamId = updatedFeedback.ExamId,
                    ExamTitle = updatedFeedback.Exam?.Title,
                    UserId = updatedFeedback.UserId,
                    UserName = updatedFeedback.User?.FullName ?? updatedFeedback.User?.Username,
                    Content = updatedFeedback.Content,
                    ResponseContent = updatedFeedback.ResponseContent,
                    CreatedAt = updatedFeedback.CreatedAt,
                    ResolvedAt = updatedFeedback.ResolvedAt,
                    Status = updatedFeedback.Status.ToString(),
                    Type = updatedFeedback.Type.ToString(),
                    QuestionId = updatedFeedback.QuestionId,
                    QuestionContent = updatedFeedback.Question?.Content,
                    ResolvedById = updatedFeedback.ResolvedById,
                    ResolvedByName = updatedFeedback.ResolvedBy?.FullName ?? updatedFeedback.ResolvedBy?.Username
                };

                return Ok(new { Success = true, Message = "Đã xử lý phản hồi thành công", Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xử lý phản hồi ID: {feedbackId} cho bài thi ID: {id}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi xử lý phản hồi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách phản hồi của bài thi
        /// </summary>
        /// <param name="id">ID của bài thi</param>
        /// <param name="page">Số trang</param>
        /// <param name="pageSize">Số phản hồi mỗi trang</param>
        /// <param name="status">Lọc theo trạng thái</param>
        /// <returns>Danh sách phản hồi</returns>
        [Authorize(Roles = "Admin")]
        [HttpGet("{id}/feedbacks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetExamFeedbacks(
            int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? status = null)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách phản hồi của bài thi ID: {id}, Page: {page}, PageSize: {pageSize}");

                // Kiểm tra bài thi tồn tại
                var exam = await _context.Exams.FindAsync(id);
                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy bài thi ID: {id}");
                    return NotFound(new { Success = false, Message = "Không tìm thấy bài thi" });
                }

                // Tạo query lấy phản hồi
                var query = _context.ExamFeedbacks
                    .Include(f => f.User)
                    .Include(f => f.Question)
                    .Include(f => f.ResolvedBy)
                    .Where(f => f.ExamId == id);

                // Lọc theo trạng thái nếu có
                if (status.HasValue && Enum.IsDefined(typeof(FeedbackStatus), status.Value))
                {
                    query = query.Where(f => (int)f.Status == status.Value);
                }

                // Sắp xếp theo thời gian tạo, mới nhất lên trên
                query = query.OrderByDescending(f => f.CreatedAt);

                // Đếm tổng số phản hồi
                var totalCount = await query.CountAsync();

                // Phân trang
                query = query.Skip((page - 1) * pageSize).Take(pageSize);

                // Lấy dữ liệu
                var feedbacks = await query.ToListAsync();

                // Tạo response
                var result = feedbacks.Select(f => new FeedbackDTO
                {
                    Id = f.Id,
                    ExamId = f.ExamId,
                    ExamTitle = exam.Title,
                    UserId = f.UserId,
                    UserName = f.User?.FullName ?? f.User?.Username,
                    Content = f.Content,
                    ResponseContent = f.ResponseContent,
                    CreatedAt = f.CreatedAt,
                    ResolvedAt = f.ResolvedAt,
                    Status = f.Status.ToString(),
                    Type = f.Type.ToString(),
                    QuestionId = f.QuestionId,
                    QuestionContent = f.Question?.Content,
                    ResolvedById = f.ResolvedById,
                    ResolvedByName = f.ResolvedBy?.FullName ?? f.ResolvedBy?.Username
                }).ToList();

                return Ok(new
                {
                    Success = true,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy danh sách phản hồi của bài thi ID: {id}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy danh sách phản hồi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách phản hồi của người dùng
        /// </summary>
        /// <param name="page">Số trang</param>
        /// <param name="pageSize">Số phản hồi mỗi trang</param>
        /// <returns>Danh sách phản hồi</returns>
        [HttpGet("my-feedbacks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyFeedbacks(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                // Lấy user id từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                _logger.LogInformation($"Lấy danh sách phản hồi của người dùng ID: {userId}, Page: {page}, PageSize: {pageSize}");

                // Tạo query lấy phản hồi
                var query = _context.ExamFeedbacks
                    .Include(f => f.User)
                    .Include(f => f.Exam)
                    .Include(f => f.Question)
                    .Include(f => f.ResolvedBy)
                    .Where(f => f.UserId == userId);

                // Sắp xếp theo thời gian tạo, mới nhất lên trên
                query = query.OrderByDescending(f => f.CreatedAt);

                // Đếm tổng số phản hồi
                var totalCount = await query.CountAsync();

                // Phân trang
                query = query.Skip((page - 1) * pageSize).Take(pageSize);

                // Lấy dữ liệu
                var feedbacks = await query.ToListAsync();

                // Tạo response
                var result = feedbacks.Select(f => new FeedbackDTO
                {
                    Id = f.Id,
                    ExamId = f.ExamId,
                    ExamTitle = f.Exam?.Title,
                    UserId = f.UserId,
                    UserName = f.User?.FullName ?? f.User?.Username,
                    Content = f.Content,
                    ResponseContent = f.ResponseContent,
                    CreatedAt = f.CreatedAt,
                    ResolvedAt = f.ResolvedAt,
                    Status = f.Status.ToString(),
                    Type = f.Type.ToString(),
                    QuestionId = f.QuestionId,
                    QuestionContent = f.Question?.Content,
                    ResolvedById = f.ResolvedById,
                    ResolvedByName = f.ResolvedBy?.FullName ?? f.ResolvedBy?.Username
                }).ToList();

                return Ok(new
                {
                    Success = true,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách phản hồi của người dùng");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy danh sách phản hồi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách tất cả phản hồi (cho admin)
        /// </summary>
        /// <param name="page">Số trang</param>
        /// <param name="pageSize">Số phản hồi mỗi trang</param>
        /// <param name="status">Lọc theo trạng thái</param>
        /// <returns>Danh sách phản hồi</returns>
        [Authorize(Roles = "Admin")]
        [HttpGet("all-feedbacks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllFeedbacks(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? status = null)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách tất cả phản hồi, Page: {page}, PageSize: {pageSize}");

                // Tạo query lấy phản hồi
                var query = _context.ExamFeedbacks
                    .Include(f => f.User)
                    .Include(f => f.Exam)
                    .Include(f => f.Question)
                    .Include(f => f.ResolvedBy)
                    .AsQueryable();

                // Lọc theo trạng thái nếu có
                if (status.HasValue && Enum.IsDefined(typeof(FeedbackStatus), status.Value))
                {
                    query = query.Where(f => (int)f.Status == status.Value);
                }

                // Sắp xếp theo thời gian tạo, mới nhất lên trên
                query = query.OrderByDescending(f => f.CreatedAt);

                // Đếm tổng số phản hồi
                var totalCount = await query.CountAsync();

                // Phân trang
                query = query.Skip((page - 1) * pageSize).Take(pageSize);

                // Lấy dữ liệu
                var feedbacks = await query.ToListAsync();

                // Tạo response
                var result = feedbacks.Select(f => new FeedbackDTO
                {
                    Id = f.Id,
                    ExamId = f.ExamId,
                    ExamTitle = f.Exam?.Title,
                    UserId = f.UserId,
                    UserName = f.User?.FullName ?? f.User?.Username,
                    Content = f.Content,
                    ResponseContent = f.ResponseContent,
                    CreatedAt = f.CreatedAt,
                    ResolvedAt = f.ResolvedAt,
                    Status = f.Status.ToString(),
                    Type = f.Type.ToString(),
                    QuestionId = f.QuestionId,
                    QuestionContent = f.Question?.Content,
                    ResolvedById = f.ResolvedById,
                    ResolvedByName = f.ResolvedBy?.FullName ?? f.ResolvedBy?.Username
                }).ToList();

                return Ok(new
                {
                    Success = true,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tất cả phản hồi");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy danh sách phản hồi", Error = ex.Message });
            }
        }
    }
}