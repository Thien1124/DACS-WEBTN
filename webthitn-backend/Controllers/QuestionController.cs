using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Annotations;
using System.Reflection;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace webthitn_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<QuestionController> _logger;

        public QuestionController(ApplicationDbContext context, ILogger<QuestionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Thêm một câu hỏi mới vào hệ thống
        /// </summary>
        /// <remarks>
        /// API này cho phép giáo viên hoặc admin tạo một câu hỏi mới theo một trong ba dạng:
        /// 1. Trắc nghiệm một đáp án (a,b,c,d) (QuestionType=1)
        /// 2. Đúng-sai nhiều ý (QuestionType=2)
        /// 3. Trả lời ngắn (QuestionType=3)
        /// </remarks>
        /// <param name="model">Thông tin câu hỏi cần tạo</param>
        /// <returns>Thông tin câu hỏi đã tạo</returns>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDTO model)
        {
            try
            {
                _logger.LogInformation($"Tạo câu hỏi mới với loại: {model.QuestionType}");

                // Validate dữ liệu đầu vào
                if (string.IsNullOrWhiteSpace(model.Content))
                {
                    return BadRequest(new { message = "Nội dung câu hỏi không được để trống" });
                }

                // Kiểm tra loại câu hỏi hợp lệ
                if (model.QuestionType != 1 && model.QuestionType != 2 && model.QuestionType != 3)
                {
                    return BadRequest(new { message = "Loại câu hỏi không hợp lệ. Chỉ hỗ trợ loại 1 (Một đáp án), 2 (Đúng-sai nhiều ý), hoặc 3 (Trả lời ngắn)" });
                }

                // Kiểm tra các options theo loại câu hỏi
                if (model.Options == null || !model.Options.Any())
                {
                    return BadRequest(new { message = "Câu hỏi phải có ít nhất một đáp án" });
                }

                // Kiểm tra theo loại câu hỏi cụ thể
                switch (model.QuestionType)
                {
                    case 1: // Một đáp án (ABCD)
                        if (model.Options.Count(o => o.IsCorrect) != 1)
                        {
                            return BadRequest(new { message = "Câu hỏi trắc nghiệm một đáp án phải có duy nhất một đáp án đúng" });
                        }

                        // Đặt giá trị mặc định cho các trường không cần thiết với câu hỏi trắc nghiệm ABCD
                        foreach (var option in model.Options)
                        {
                            // Đặt matchingValue mặc định nếu chưa có
                            if (string.IsNullOrEmpty(option.MatchingValue))
                            {
                                option.MatchingValue = string.Empty;
                            }

                            // Đặt các trường khác không cần thiết cho loại 1
                            option.IsPartOfTrueFalseGroup = false;
                            option.GroupId = 0;
                        }
                        break;

                    case 2: // Đúng-sai nhiều ý
                        if (model.Options.Count < 2)
                        {
                            return BadRequest(new { message = "Câu hỏi đúng-sai nhiều ý phải có ít nhất 2 mục để đánh giá" });
                        }
                        if (model.Options.Any(o => !o.IsPartOfTrueFalseGroup))
                        {
                            return BadRequest(new { message = "Tất cả các đáp án trong câu hỏi đúng-sai nhiều ý phải có trường isPartOfTrueFalseGroup = true" });
                        }

                        // Đặt matchingValue mặc định nếu chưa có
                        foreach (var option in model.Options)
                        {
                            if (string.IsNullOrEmpty(option.MatchingValue))
                            {
                                option.MatchingValue = string.Empty;
                            }
                        }
                        break;

                    case 3: // Trả lời ngắn
                        if (!model.Options.Any(o => o.IsCorrect))
                        {
                            return BadRequest(new { message = "Câu hỏi trả lời ngắn phải có ít nhất một đáp án đúng" });
                        }

                        // Đặt giá trị mặc định cho các trường không cần thiết với câu hỏi trả lời ngắn
                        foreach (var option in model.Options)
                        {
                            // Đặt matchingValue mặc định nếu chưa có
                            if (string.IsNullOrEmpty(option.MatchingValue))
                            {
                                option.MatchingValue = string.Empty;
                            }

                            // Đặt các trường khác không cần thiết cho loại 3
                            option.IsPartOfTrueFalseGroup = false;
                            option.GroupId = 0;
                        }
                        break;
                }

                // Kiểm tra môn học tồn tại
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {model.SubjectId}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Kiểm tra chương học tồn tại (nếu có)
                Chapter chapter = null;
                int chapterId = 0;
                if (model.ChapterId.HasValue && model.ChapterId.Value > 0)
                {
                    chapter = await _context.Chapters.FindAsync(model.ChapterId.Value);
                    if (chapter == null)
                    {
                        _logger.LogWarning($"Không tìm thấy chương ID: {model.ChapterId}");
                        return NotFound(new { message = "Không tìm thấy chương học" });
                    }
                    chapterId = model.ChapterId.Value;
                }
                else
                {
                    // Nếu không có chapterId thì tìm một chương mặc định của môn học
                    chapter = await _context.Chapters
                        .FirstOrDefaultAsync(c => c.SubjectId == model.SubjectId);

                    if (chapter != null)
                    {
                        chapterId = chapter.Id;
                    }
                    else
                    {
                        // Nếu không tìm thấy chương nào thì tạo một chương mặc định
                        chapter = new Chapter
                        {
                            SubjectId = model.SubjectId,
                            Name = "Chương mặc định",
                            Description = "Chương được tạo tự động",
                            OrderIndex = 1,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Chapters.Add(chapter);
                        await _context.SaveChangesAsync();
                        chapterId = chapter.Id;
                    }
                }

                // Kiểm tra mức độ câu hỏi tồn tại
                var level = await _context.QuestionLevels.FindAsync(model.QuestionLevelId);
                if (level == null)
                {
                    _logger.LogWarning($"Không tìm thấy mức độ câu hỏi ID: {model.QuestionLevelId}");
                    return NotFound(new { message = "Không tìm thấy mức độ câu hỏi" });
                }

                // Lấy ID của người dùng hiện tại (từ token JWT)
                int currentUserId;
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    // Thử tìm với các biến thể khác nếu không tìm thấy
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out currentUserId) || currentUserId <= 0)
                {
                    _logger.LogWarning("Không xác định được người dùng hiện tại từ token");
                    return StatusCode(500, new { message = "Không xác định được người dùng hiện tại" });
                }

                // Xác định người tạo
                var creator = await _context.Users.FindAsync(currentUserId);
                if (creator == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng ID: {currentUserId}");
                    return NotFound(new { message = "Không tìm thấy thông tin người dùng" });
                }

                // Xử lý cấu hình đặc biệt cho từng loại câu hỏi
                string scoringConfig = model.ScoringConfig ?? "";
                string shortAnswerConfig = model.ShortAnswerConfig ?? "";
                // Cấu hình mặc định cho câu hỏi đúng-sai nhiều ý nếu không có
                if (model.QuestionType == 2 && string.IsNullOrEmpty(scoringConfig))
                {
                    scoringConfig = "{\"1_correct\": 0.10, \"2_correct\": 0.25, \"3_correct\": 0.50, \"4_correct\": 1.00}";
                }

                // Cấu hình mặc định cho câu hỏi trả lời ngắn nếu không có
                if (model.QuestionType == 3 && string.IsNullOrEmpty(shortAnswerConfig))
                {
                    shortAnswerConfig = "{\"case_sensitive\": false, \"exact_match\": false, \"partial_credit\": true, \"partial_credit_percent\": 50, \"allow_similar\": true, \"similarity_threshold\": 80}";
                }

                DateTime createdAt = DateTime.UtcNow;

                // Bắt đầu transaction để đảm bảo tất cả dữ liệu được lưu nhất quán
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Tạo đối tượng Question mới với tất cả các thuộc tính required
                    var question = new Question
                    {
                        Content = model.Content.Trim(),
                        Explanation = model.Explanation?.Trim() ?? "",
                        SubjectId = model.SubjectId,
                        ChapterId = chapterId,
                        QuestionLevelId = model.QuestionLevelId,
                        QuestionType = model.QuestionType,
                        Tags = model.Tags?.Trim() ?? "",
                        SuggestedTime = model.SuggestedTime,
                        DefaultScore = model.DefaultScore > 0 ? model.DefaultScore : 1,
                        IsActive = model.IsActive,
                        ImagePath = "", // Không có ImagePath trong DTO, để trống
                        CreatorId = currentUserId,
                        CreatedAt = createdAt,
                        UpdatedAt = createdAt, // Required field
                        Subject = subject, // Required field
                        Chapter = chapter, // Required field
                        Creator = creator, // Required field
                        Options = new List<QuestionOption>(), // Khởi tạo danh sách rỗng
                        ExamQuestions = new List<ExamQuestion>(),// Required field
                        ScoringConfig = scoringConfig,  // Đảm bảo không null
                        ShortAnswerConfig = shortAnswerConfig,
                    };

                    _context.Questions.Add(question);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã lưu câu hỏi, ID: {question.Id}");

                    // Lưu các đáp án cho câu hỏi
                    foreach (var optionDTO in model.Options)
                    {
                        var questionOption = new QuestionOption
                        {
                            QuestionId = question.Id,
                            Content = optionDTO.Content.Trim(),
                            IsCorrect = optionDTO.IsCorrect,
                            OrderIndex = optionDTO.OrderIndex,
                            Label = optionDTO.Label?.Trim() ?? "",
                            ImagePath = "", // Không có ImagePath trong DTO, để trống
                            Explanation = optionDTO.Explanation?.Trim() ?? "",
                            ScorePercentage = optionDTO.ScorePercentage > 0 ? optionDTO.ScorePercentage : 100,
                            IsPartOfTrueFalseGroup = optionDTO.IsPartOfTrueFalseGroup,
                            GroupId = optionDTO.GroupId ?? 0,
                            MatchingValue = optionDTO.MatchingValue ?? "", // Sử dụng giá trị từ DTO hoặc chuỗi rỗng
                            Question = question // Đặt tham chiếu đến câu hỏi
                        };

                        _context.QuestionOptions.Add(questionOption);
                    }

                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã lưu {model.Options.Count} đáp án cho câu hỏi ID: {question.Id}");

                    await transaction.CommitAsync();
                    _logger.LogInformation($"Đã commit transaction");

                    // Tạo đối tượng DTO để trả về
                    var questionDetail = await _context.Questions
                        .Include(q => q.Subject)
                        .Include(q => q.Chapter)
                        .Include(q => q.Level)
                        .Include(q => q.Creator)
                        .Include(q => q.Options)
                        .FirstOrDefaultAsync(q => q.Id == question.Id);

                    var questionDetailDTO = new QuestionDetailDTO
                    {
                        Id = questionDetail.Id,
                        Content = questionDetail.Content,
                        Explanation = questionDetail.Explanation,
                        SubjectId = questionDetail.SubjectId,
                        ChapterId = questionDetail.ChapterId,
                        QuestionLevelId = questionDetail.QuestionLevelId,
                        QuestionType = questionDetail.QuestionType,
                        Tags = questionDetail.Tags,
                        SuggestedTime = questionDetail.SuggestedTime,
                        DefaultScore = questionDetail.DefaultScore,
                        HasImage = !string.IsNullOrEmpty(questionDetail.ImagePath),
                        ImagePath = questionDetail.ImagePath,
                        IsActive = questionDetail.IsActive,
                        ScoringConfig = questionDetail.ScoringConfig,
                        ShortAnswerConfig = questionDetail.ShortAnswerConfig,
                        Subject = new SubjectBasicDTO
                        {
                            Id = questionDetail.Subject.Id,
                            Name = questionDetail.Subject.Name,
                            Code = questionDetail.Subject.Code
                        },
                        Chapter = questionDetail.Chapter != null ? new ChapterBasicDTO
                        {
                            Id = questionDetail.Chapter.Id,
                            Name = questionDetail.Chapter.Name
                        } : null,
                        Level = questionDetail.Level != null ? new QuestionLevelDTO
                        {
                            Id = questionDetail.Level.Id,
                            Name = questionDetail.Level.Name,
                            Value = questionDetail.Level.Value,
                            Description = questionDetail.Level.Description
                        } : null,
                        Creator = questionDetail.Creator != null ? new UserBasicDTO
                        {
                            Id = questionDetail.Creator.Id,
                            Username = questionDetail.Creator.Username,
                            FullName = questionDetail.Creator.FullName
                        } : null,
                        Options = questionDetail.Options.Select(o => new QuestionOptionDTO
                        {
                            Id = o.Id,
                            Content = o.Content,
                            IsCorrect = o.IsCorrect,
                            OrderIndex = o.OrderIndex,
                            Label = o.Label,
                            ImagePath = o.ImagePath,
                            Explanation = o.Explanation,
                            MatchingValue = o.MatchingValue ?? "", // Đảm bảo không null
                            IsPartOfTrueFalseGroup = o.IsPartOfTrueFalseGroup,
                            GroupId = o.GroupId,
                            ScorePercentage = o.ScorePercentage
                        }).OrderBy(o => o.OrderIndex).ToList()
                    };

                    // Trả về kết quả với status code 201 Created
                    return CreatedAtAction(nameof(GetQuestion), new { id = question.Id }, questionDetailDTO);
                }
                catch (Exception ex)
                {
                    // Nếu có lỗi, rollback transaction
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi khi lưu dữ liệu: {ex.Message}, Stack trace: {ex.StackTrace}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo câu hỏi: {ex.Message}, Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo câu hỏi", error = ex.Message, innerException = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết của một câu hỏi theo ID
        /// </summary>
        /// <param name="id">ID của câu hỏi</param>
        /// <returns>Thông tin chi tiết của câu hỏi</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuestion(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin chi tiết câu hỏi ID: {id}");

                var question = await _context.Questions
                    .Include(q => q.Subject)
                    .Include(q => q.Chapter)
                    .Include(q => q.Level)
                    .Include(q => q.Creator)
                    .Include(q => q.Options)
                    .FirstOrDefaultAsync(q => q.Id == id);

                if (question == null)
                {
                    _logger.LogWarning($"Không tìm thấy câu hỏi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy câu hỏi" });
                }

                var questionDto = new QuestionDetailDTO
                {
                    Id = question.Id,
                    Content = question.Content,
                    Explanation = question.Explanation,
                    SubjectId = question.SubjectId,
                    ChapterId = question.ChapterId,
                    QuestionLevelId = question.QuestionLevelId,
                    QuestionType = question.QuestionType,
                    Tags = question.Tags,
                    SuggestedTime = question.SuggestedTime,
                    DefaultScore = question.DefaultScore,
                    HasImage = !string.IsNullOrEmpty(question.ImagePath),
                    ImagePath = question.ImagePath,
                    IsActive = question.IsActive,
                    ScoringConfig = question.ScoringConfig,
                    ShortAnswerConfig = question.ShortAnswerConfig,
                    Subject = new SubjectBasicDTO
                    {
                        Id = question.Subject.Id,
                        Name = question.Subject.Name,
                        Code = question.Subject.Code
                    },
                    Chapter = question.Chapter != null ? new ChapterBasicDTO
                    {
                        Id = question.Chapter.Id,
                        Name = question.Chapter.Name
                    } : null,
                    Level = question.Level != null ? new QuestionLevelDTO
                    {
                        Id = question.Level.Id,
                        Name = question.Level.Name,
                        Value = question.Level.Value,
                        Description = question.Level.Description
                    } : null,
                    Creator = question.Creator != null ? new UserBasicDTO
                    {
                        Id = question.Creator.Id,
                        Username = question.Creator.Username,
                        FullName = question.Creator.FullName
                    } : null,
                    Options = question.Options.Select(o => new QuestionOptionDTO
                    {
                        Id = o.Id,
                        Content = o.Content,
                        IsCorrect = o.IsCorrect,
                        OrderIndex = o.OrderIndex,
                        Label = o.Label,
                        ImagePath = o.ImagePath,
                        Explanation = o.Explanation,
                        MatchingValue = o.MatchingValue ?? "", // Đảm bảo không null
                        IsPartOfTrueFalseGroup = o.IsPartOfTrueFalseGroup,
                        GroupId = o.GroupId,
                        ScorePercentage = o.ScorePercentage
                    }).OrderBy(o => o.OrderIndex).ToList()
                };

                return Ok(questionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy thông tin câu hỏi ID: {id}, Error: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin câu hỏi" });
            }
        }

        /// <summary>
        /// Lấy danh sách câu hỏi với các bộ lọc và phân trang
        /// </summary>
        /// <param name="subjectId">ID của môn học</param>
        /// <param name="chapterId">ID của chương</param>
        /// <param name="levelId">ID của mức độ câu hỏi</param>
        /// <param name="questionType">Loại câu hỏi (1: Một đáp án, 2: Đúng-sai nhiều ý, 3: Trả lời ngắn)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm</param>
        /// <param name="page">Số trang</param>
        /// <param name="pageSize">Số mục mỗi trang</param>
        /// <param name="activeOnly">Chỉ lấy câu hỏi đang hoạt động</param>
        /// <returns>Danh sách câu hỏi được lọc và phân trang</returns>
        [HttpGet]
        public async Task<IActionResult> GetQuestions(
            [FromQuery] int? subjectId = null,
            [FromQuery] int? chapterId = null,
            [FromQuery] int? levelId = null,
            [FromQuery] int? questionType = null,
            [FromQuery] string searchTerm = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool activeOnly = true)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách câu hỏi với filter: SubjectId={subjectId}, " +
                    $"ChapterId={chapterId}, LevelId={levelId}, QuestionType={questionType}, " +
                    $"Page={page}, PageSize={pageSize}, ActiveOnly={activeOnly}");

                var query = _context.Questions
                    .Include(q => q.Subject)
                    .Include(q => q.Chapter)
                    .Include(q => q.Level)
                    .Include(q => q.Options)
                    .AsQueryable();

                // Áp dụng các bộ lọc
                if (subjectId.HasValue && subjectId > 0)
                {
                    query = query.Where(q => q.SubjectId == subjectId.Value);
                }

                if (chapterId.HasValue && chapterId > 0)
                {
                    query = query.Where(q => q.ChapterId == chapterId.Value);
                }

                if (levelId.HasValue && levelId > 0)
                {
                    query = query.Where(q => q.QuestionLevelId == levelId.Value);
                }

                if (questionType.HasValue && (questionType == 1 || questionType == 2 || questionType == 3))
                {
                    query = query.Where(q => q.QuestionType == questionType.Value);
                }

                if (activeOnly)
                {
                    query = query.Where(q => q.IsActive);
                }

                // Tìm kiếm theo nội dung hoặc tags
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    var search = searchTerm.Trim().ToLower();
                    query = query.Where(q =>
                        q.Content.ToLower().Contains(search) ||
                        q.Tags.ToLower().Contains(search) ||
                        q.Explanation.ToLower().Contains(search));
                }

                // Đếm tổng số bản ghi
                var totalCount = await query.CountAsync();

                // Phân trang và sắp xếp
                var questions = await query
                    .OrderByDescending(q => q.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Chuyển sang DTO
                var questionDTOs = questions.Select(q => new QuestionListDTO
                {
                    Id = q.Id,
                    Content = q.Content,
                    QuestionType = q.QuestionTypeName,
                    Level = q.Level?.Name,
                    DefaultScore = q.DefaultScore,
                    Subject = new SubjectBasicDTO
                    {
                        Id = q.Subject.Id,
                        Name = q.Subject.Name,
                        Code = q.Subject.Code
                    },
                    Chapter = q.Chapter != null ? new ChapterBasicDTO
                    {
                        Id = q.Chapter.Id,
                        Name = q.Chapter.Name
                    } : null,
                    Tags = q.Tags,
                    OptionsCount = q.Options.Count,
                    IsActive = q.IsActive,
                    CreatedAt = q.CreatedAt
                }).ToList();

                return Ok(new
                {
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    data = questionDTOs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách câu hỏi: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách câu hỏi" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin của một câu hỏi / chỉnh sửa
        /// </summary>
        /// <param name="id">ID của câu hỏi cần cập nhật</param>
        /// <param name="model">Thông tin cập nhật</param>
        /// <returns>Thông tin câu hỏi sau khi cập nhật</returns>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] UpdateQuestionDTO model)
        {
            try
            {
                _logger.LogInformation($"Cập nhật câu hỏi ID: {id}");

                // Kiểm tra câu hỏi tồn tại
                var question = await _context.Questions
                    .Include(q => q.Options)
                    .FirstOrDefaultAsync(q => q.Id == id);

                if (question == null)
                {
                    _logger.LogWarning($"Không tìm thấy câu hỏi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy câu hỏi" });
                }

                // Kiểm tra quyền - chỉ Admin hoặc người tạo ra câu hỏi mới có thể cập nhật
                int currentUserId;
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out currentUserId) || currentUserId <= 0)
                {
                    _logger.LogWarning("Không xác định được người dùng hiện tại từ token");
                    return StatusCode(500, new { message = "Không xác định được người dùng hiện tại" });
                }

                // Kiểm tra quyền
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = question.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền cập nhật câu hỏi ID: {id}");
                    return StatusCode(403, new { message = "Bạn không có quyền cập nhật câu hỏi này" });
                }

                // Bắt đầu transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Cập nhật thông tin câu hỏi
                    question.Content = !string.IsNullOrEmpty(model.Content) ? model.Content.Trim() : question.Content;
                    question.Explanation = model.Explanation?.Trim() ?? question.Explanation;

                    // Cập nhật môn học nếu có thay đổi
                    if (model.SubjectId.HasValue && model.SubjectId.Value > 0 && model.SubjectId.Value != question.SubjectId)
                    {
                        var subject = await _context.Subjects.FindAsync(model.SubjectId.Value);
                        if (subject == null)
                        {
                            return NotFound(new { message = "Không tìm thấy môn học" });
                        }
                        question.SubjectId = model.SubjectId.Value;
                        question.Subject = subject;
                    }

                    // Cập nhật chương nếu có thay đổi
                    if (model.ChapterId.HasValue && model.ChapterId.Value > 0 && model.ChapterId.Value != question.ChapterId)
                    {
                        var chapter = await _context.Chapters.FindAsync(model.ChapterId.Value);
                        if (chapter == null)
                        {
                            return NotFound(new { message = "Không tìm thấy chương học" });
                        }
                        question.ChapterId = model.ChapterId.Value;
                        question.Chapter = chapter;
                    }

                    // Cập nhật mức độ nếu có thay đổi
                    if (model.QuestionLevelId.HasValue && model.QuestionLevelId.Value > 0 && model.QuestionLevelId.Value != question.QuestionLevelId)
                    {
                        var level = await _context.QuestionLevels.FindAsync(model.QuestionLevelId.Value);
                        if (level == null)
                        {
                            return NotFound(new { message = "Không tìm thấy mức độ câu hỏi" });
                        }
                        question.QuestionLevelId = model.QuestionLevelId.Value;
                        question.Level = level;
                    }

                    // Không cho phép thay đổi loại câu hỏi - cấu trúc đáp án khác nhau
                    // if (model.QuestionType.HasValue && model.QuestionType.Value != question.QuestionType)
                    // {
                    //     return BadRequest(new { message = "Không thể thay đổi loại câu hỏi sau khi đã tạo" });
                    // }

                    // Cập nhật các thông tin khác
                    if (model.Tags != null)
                        question.Tags = model.Tags.Trim();

                    if (model.SuggestedTime.HasValue)
                        question.SuggestedTime = model.SuggestedTime.Value;

                    if (model.DefaultScore.HasValue && model.DefaultScore.Value > 0)
                        question.DefaultScore = model.DefaultScore.Value;

                    if (model.IsActive.HasValue)
                        question.IsActive = model.IsActive.Value;

                    if (!string.IsNullOrEmpty(model.ScoringConfig))
                        question.ScoringConfig = model.ScoringConfig;

                    if (!string.IsNullOrEmpty(model.ShortAnswerConfig))
                        question.ShortAnswerConfig = model.ShortAnswerConfig;

                    question.UpdatedAt = DateTime.UtcNow;

                    // Cập nhật các đáp án nếu có thay đổi
                    if (model.Options != null && model.Options.Any())
                    {
                        // Xử lý cập nhật hoặc thêm đáp án
                        foreach (var optionDTO in model.Options)
                        {
                            if (optionDTO.Id > 0) // Cập nhật đáp án hiện có
                            {
                                var option = question.Options.FirstOrDefault(o => o.Id == optionDTO.Id);
                                if (option != null)
                                {
                                    option.Content = !string.IsNullOrEmpty(optionDTO.Content) ? optionDTO.Content.Trim() : option.Content;
                                    option.IsCorrect = optionDTO.IsCorrect;
                                    option.OrderIndex = optionDTO.OrderIndex > 0 ? optionDTO.OrderIndex : option.OrderIndex;
                                    option.Label = !string.IsNullOrEmpty(optionDTO.Label) ? optionDTO.Label.Trim() : option.Label;
                                    option.Explanation = optionDTO.Explanation?.Trim() ?? option.Explanation;
                                    option.ScorePercentage = optionDTO.ScorePercentage > 0 ? optionDTO.ScorePercentage : option.ScorePercentage;

                                    // Xử lý các trường đặc biệt theo loại câu hỏi
                                    if (question.QuestionType == 1) // ABCD
                                    {
                                        // Với câu hỏi ABCD, đảm bảo các trường này có giá trị mặc định
                                        option.IsPartOfTrueFalseGroup = false;
                                        option.GroupId = 0;
                                        option.MatchingValue = optionDTO.MatchingValue ?? "";
                                    }
                                    else
                                    {
                                        // Với các loại câu hỏi khác, giữ nguyên thông tin cập nhật
                                        option.IsPartOfTrueFalseGroup = optionDTO.IsPartOfTrueFalseGroup;
                                        option.GroupId = optionDTO.GroupId ?? 0;
                                        option.MatchingValue = optionDTO.MatchingValue ?? "";
                                    }
                                }
                            }
                            else // Thêm mới đáp án
                            {
                                var newOption = new QuestionOption
                                {
                                    QuestionId = question.Id,
                                    Content = optionDTO.Content.Trim(),
                                    IsCorrect = optionDTO.IsCorrect,
                                    OrderIndex = optionDTO.OrderIndex,
                                    Label = optionDTO.Label?.Trim() ?? "",
                                    ImagePath = "", // Không có ImagePath trong DTO
                                    Explanation = optionDTO.Explanation?.Trim() ?? "",
                                    ScorePercentage = optionDTO.ScorePercentage > 0 ? optionDTO.ScorePercentage : 100,
                                    Question = question
                                };

                                // Xử lý các trường đặc biệt theo loại câu hỏi
                                if (question.QuestionType == 1) // ABCD
                                {
                                    // Với câu hỏi ABCD, đảm bảo các trường này có giá trị mặc định
                                    newOption.IsPartOfTrueFalseGroup = false;
                                    newOption.GroupId = 0;
                                    newOption.MatchingValue = optionDTO.MatchingValue ?? "";
                                }
                                else
                                {
                                    // Với các loại câu hỏi khác, sử dụng thông tin từ DTO
                                    newOption.IsPartOfTrueFalseGroup = optionDTO.IsPartOfTrueFalseGroup;
                                    newOption.GroupId = optionDTO.GroupId ?? 0;
                                    newOption.MatchingValue = optionDTO.MatchingValue ?? "";
                                }

                                _context.QuestionOptions.Add(newOption);
                            }
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation($"Câu hỏi ID: {id} đã được cập nhật");

                    // Lấy lại câu hỏi sau khi cập nhật
                    var updatedQuestion = await _context.Questions
                        .Include(q => q.Subject)
                        .Include(q => q.Chapter)
                        .Include(q => q.Level)
                        .Include(q => q.Creator)
                        .Include(q => q.Options)
                        .FirstOrDefaultAsync(q => q.Id == id);

                    var questionDetailDTO = new QuestionDetailDTO
                    {
                        Id = updatedQuestion.Id,
                        Content = updatedQuestion.Content,
                        Explanation = updatedQuestion.Explanation,
                        SubjectId = updatedQuestion.SubjectId,
                        ChapterId = updatedQuestion.ChapterId,
                        QuestionLevelId = updatedQuestion.QuestionLevelId,
                        QuestionType = updatedQuestion.QuestionType,
                        Tags = updatedQuestion.Tags,
                        SuggestedTime = updatedQuestion.SuggestedTime,
                        DefaultScore = updatedQuestion.DefaultScore,
                        HasImage = !string.IsNullOrEmpty(updatedQuestion.ImagePath),
                        ImagePath = updatedQuestion.ImagePath,
                        IsActive = updatedQuestion.IsActive,
                        ScoringConfig = updatedQuestion.ScoringConfig,
                        ShortAnswerConfig = updatedQuestion.ShortAnswerConfig,
                        Subject = new SubjectBasicDTO
                        {
                            Id = updatedQuestion.Subject.Id,
                            Name = updatedQuestion.Subject.Name,
                            Code = updatedQuestion.Subject.Code
                        },
                        Chapter = updatedQuestion.Chapter != null ? new ChapterBasicDTO
                        {
                            Id = updatedQuestion.Chapter.Id,
                            Name = updatedQuestion.Chapter.Name
                        } : null,
                        Level = updatedQuestion.Level != null ? new QuestionLevelDTO
                        {
                            Id = updatedQuestion.Level.Id,
                            Name = updatedQuestion.Level.Name,
                            Value = updatedQuestion.Level.Value,
                            Description = updatedQuestion.Level.Description
                        } : null,
                        Creator = updatedQuestion.Creator != null ? new UserBasicDTO
                        {
                            Id = updatedQuestion.Creator.Id,
                            Username = updatedQuestion.Creator.Username,
                            FullName = updatedQuestion.Creator.FullName
                        } : null,
                        Options = updatedQuestion.Options.Select(o => new QuestionOptionDTO
                        {
                            Id = o.Id,
                            Content = o.Content,
                            IsCorrect = o.IsCorrect,
                            OrderIndex = o.OrderIndex,
                            Label = o.Label,
                            ImagePath = o.ImagePath,
                            Explanation = o.Explanation,
                            MatchingValue = o.MatchingValue ?? "", // Đảm bảo không null
                            IsPartOfTrueFalseGroup = o.IsPartOfTrueFalseGroup,
                            GroupId = o.GroupId,
                            ScorePercentage = o.ScorePercentage
                        }).OrderBy(o => o.OrderIndex).ToList()
                    };

                    return Ok(questionDetailDTO);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi khi cập nhật câu hỏi ID: {id}, Error: {ex.Message}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật câu hỏi ID: {id}, Error: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật câu hỏi" });
            }
        }

        /// <summary>
        /// Xóa một đáp án khỏi câu hỏi
        /// </summary>
        /// <param name="questionId">ID của câu hỏi</param>
        /// <param name="optionId">ID của đáp án cần xóa</param>
        /// <returns>Thông báo kết quả</returns>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{questionId}/options/{optionId}")]
        public async Task<IActionResult> DeleteOption(int questionId, int optionId)
        {
            try
            {
                _logger.LogInformation($"Xóa đáp án ID: {optionId} khỏi câu hỏi ID: {questionId}");

                // Kiểm tra câu hỏi và đáp án tồn tại
                var question = await _context.Questions
                    .Include(q => q.Options)
                    .FirstOrDefaultAsync(q => q.Id == questionId);

                if (question == null)
                {
                    _logger.LogWarning($"Không tìm thấy câu hỏi ID: {questionId}");
                    return NotFound(new { message = "Không tìm thấy câu hỏi" });
                }

                var option = question.Options.FirstOrDefault(o => o.Id == optionId);
                if (option == null)
                {
                    _logger.LogWarning($"Không tìm thấy đáp án ID: {optionId} trong câu hỏi ID: {questionId}");
                    return NotFound(new { message = "Không tìm thấy đáp án" });
                }

                // Kiểm tra quyền - chỉ Admin hoặc người tạo ra câu hỏi mới có thể xóa
                int currentUserId;
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out currentUserId) || currentUserId <= 0)
                {
                    _logger.LogWarning("Không xác định được người dùng hiện tại từ token");
                    return StatusCode(500, new { message = "Không xác định được người dùng hiện tại" });
                }

                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = question.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền xóa đáp án của câu hỏi ID: {questionId}");
                    return StatusCode(403, new { message = "Bạn không có quyền xóa đáp án của câu hỏi này" });
                }

                // Kiểm tra điều kiện không được xóa nếu chỉ còn 1 đáp án
                if (question.Options.Count <= 1)
                {
                    return BadRequest(new { message = "Không thể xóa đáp án vì câu hỏi phải có ít nhất một đáp án" });
                }

                // Kiểm tra nếu là câu hỏi một đáp án và đang xóa đáp án đúng duy nhất
                if (question.QuestionType == 1 && option.IsCorrect && question.Options.Count(o => o.IsCorrect) == 1)
                {
                    return BadRequest(new { message = "Không thể xóa đáp án đúng duy nhất trong câu hỏi một đáp án" });
                }

                // Xóa đáp án
                _context.QuestionOptions.Remove(option);
                question.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã xóa đáp án ID: {optionId} khỏi câu hỏi ID: {questionId}");

                return Ok(new { message = "Đã xóa đáp án thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa đáp án ID: {optionId} khỏi câu hỏi ID: {questionId}, Error: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa đáp án" });
            }
        }

        /// <summary>
        /// Xóa một câu hỏi
        /// </summary>
        /// <param name="id">ID của câu hỏi cần xóa</param>
        /// <returns>Thông báo kết quả xóa</returns>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            try
            {
                _logger.LogInformation($"Xóa câu hỏi ID: {id}");

                // Kiểm tra câu hỏi tồn tại
                var question = await _context.Questions
                    .Include(q => q.ExamQuestions)
                    .Include(q => q.Options)
                    .FirstOrDefaultAsync(q => q.Id == id);

                if (question == null)
                {
                    _logger.LogWarning($"Không tìm thấy câu hỏi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy câu hỏi" });
                }

                // Kiểm tra quyền - chỉ Admin hoặc người tạo ra câu hỏi mới có thể xóa
                int currentUserId;
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out currentUserId) || currentUserId <= 0)
                {
                    _logger.LogWarning("Không xác định được người dùng hiện tại từ token");
                    return StatusCode(500, new { message = "Không xác định được người dùng hiện tại" });
                }

                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = question.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền xóa câu hỏi ID: {id}");
                    return StatusCode(403, new { message = "Bạn không có quyền xóa câu hỏi này" });
                }

                // Kiểm tra xem câu hỏi đã được sử dụng trong bài thi chưa
                if (question.ExamQuestions.Any())
                {
                    if (!isAdmin) // Chỉ admin mới có thể xóa câu hỏi đã được sử dụng
                    {
                        return BadRequest(new { message = "Không thể xóa câu hỏi đã được sử dụng trong bài thi. Vui lòng liên hệ quản trị viên." });
                    }
                }

                // Bắt đầu transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Xóa các đáp án liên quan
                    _context.QuestionOptions.RemoveRange(question.Options);

                    // Xóa các liên kết với bài thi (nếu là admin)
                    if (isAdmin && question.ExamQuestions.Any())
                    {
                        _context.ExamQuestions.RemoveRange(question.ExamQuestions);
                    }

                    // Xóa câu hỏi
                    _context.Questions.Remove(question);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    _logger.LogInformation($"Đã xóa câu hỏi ID: {id}");

                    return Ok(new { message = "Đã xóa câu hỏi thành công" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi khi xóa câu hỏi ID: {id}, Error: {ex.Message}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa câu hỏi ID: {id}, Error: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa câu hỏi" });
            }
        }

        // <summary>
        /// Nhập câu hỏi từ file Excel
        /// </summary>
        /// <remarks>
        /// API này cho phép nhập dữ liệu câu hỏi từ file Excel với các tùy chọn:
        /// - SubjectId: ID của môn học (bắt buộc)
        /// - CategoryId: ID của chương (tùy chọn)
        /// - LevelId: ID của cấp độ câu hỏi (tùy chọn)
        /// - OverrideExisting: Cập nhật câu hỏi đã tồn tại (mặc định: false)
        /// - ValidateOnly: Chỉ kiểm tra dữ liệu mà không lưu (mặc định: false)
        /// - ContinueOnError: Tiếp tục khi gặp lỗi (mặc định: true)
        /// </remarks>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("import")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ImportQuestions(
            [Required] IFormFile file,
            [Required] int subjectId,
            int? chapterId = null,
            int? levelId = null,
            bool overrideExisting = true,
            bool validateOnly = false,
            bool continueOnError = true,
            int batchSize = 50)
        {
            try
            {
                _logger.LogInformation($"Bắt đầu nhập câu hỏi từ Excel: {file.FileName}, SubjectId={subjectId}");
                var stopwatch = Stopwatch.StartNew(); // Theo dõi thời gian xử lý

                // Kiểm tra file
                if (file == null || file.Length == 0)
                    return BadRequest(new { Success = false, Error = "Không tìm thấy file" });

                // Kiểm tra định dạng file
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".xlsx" && extension != ".xls")
                    return BadRequest(new { Success = false, Error = "Định dạng file không được hỗ trợ. Vui lòng sử dụng file Excel (.xlsx hoặc .xls)" });

                // Kiểm tra kích thước file (tối đa 10MB)
                if (file.Length > 10 * 1024 * 1024)
                    return BadRequest(new { Success = false, Error = "Kích thước file không được vượt quá 10MB" });

                // Pre-load tất cả dữ liệu tham chiếu để tránh nhiều truy vấn database
                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null)
                    return BadRequest(new { Success = false, Error = "Môn học không tồn tại" });

                // Lấy danh sách mức độ câu hỏi
                var allLevels = await _context.QuestionLevels.ToListAsync();
                var defaultLevel = allLevels.FirstOrDefault();

                QuestionLevel selectedLevel = null;
                if (levelId.HasValue)
                {
                    selectedLevel = allLevels.FirstOrDefault(l => l.Id == levelId.Value);
                    if (selectedLevel == null)
                        return BadRequest(new { Success = false, Error = "Mức độ câu hỏi không tồn tại" });
                }

                // Lấy danh sách chương
                var chaptersList = await _context.Chapters.Where(c => c.SubjectId == subjectId).ToListAsync();
                var defaultChapter = chaptersList.FirstOrDefault();

                Chapter selectedChapter = null;
                if (chapterId.HasValue)
                {
                    // First find the chapter
                    selectedChapter = await _context.Chapters.FindAsync(chapterId.Value);

                    if (selectedChapter == null)
                    {
                        return BadRequest(new { Success = false, Error = $"chương với ID {chapterId} không tồn tại" });
                    }

                    // Check if it belongs to the specified subject
                    if (selectedChapter.SubjectId != subjectId)
                    {
                        return BadRequest(new { Success = false, Error = $"chương với ID {chapterId} không thuộc môn học với ID {subjectId}" });
                    }
                }

                // Lấy userId từ token
                int currentUserId;
                var userIdClaim = User.FindFirst("userId") ??
                                  User.FindFirst("UserId") ??
                                  User.FindFirst("userid");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out currentUserId))
                {
                    return StatusCode(500, new { Success = false, Error = "Không xác định được người dùng" });
                }

                // Lấy thông tin người dùng hiện tại
                var currentUser = await _context.Users.FindAsync(currentUserId);
                if (currentUser == null)
                {
                    return StatusCode(500, new { Success = false, Error = "Không tìm thấy thông tin người dùng" });
                }

                // Đọc file Excel
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);

                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets[0]; // Lấy sheet đầu tiên

                // Khởi tạo biến thống kê
                var totalProcessed = 0;
                var successCount = 0;
                var failedCount = 0;
                var newQuestions = 0;
                var updatedQuestions = 0;
                var errors = new List<object>();
                var warnings = new List<object>();
                var questionsToAdd = new List<Question>(); // Danh sách câu hỏi cần thêm mới
                var questionsToUpdate = new List<Question>(); // Danh sách câu hỏi cần cập nhật

                // Sử dụng Dictionary để lưu options cho mỗi câu hỏi mới
                var questionOptionsMap = new Dictionary<Question, List<QuestionOption>>();
                var existingQuestionOptionsMap = new Dictionary<int, List<QuestionOption>>();

                // Cache các câu hỏi đã tồn tại để tránh truy vấn lặp đi lặp lại
                var existingQuestionContents = new HashSet<string>(
                    await _context.Questions
                        .Where(q => q.SubjectId == subjectId)
                        .Select(q => q.Content)
                        .ToListAsync()
                );

                // Lấy số dòng có dữ liệu
                var rowCount = worksheet.Dimension?.Rows ?? 0;
                if (rowCount < 2) // Chỉ có header
                {
                    return BadRequest(new { Success = false, Error = "File không có dữ liệu" });
                }

                // Tìm các cột dữ liệu
                var contentCol = FindColumnByHeader(worksheet, "Content") ?? 2; // Mặc định là cột B
                var questionTypeCol = FindColumnByHeader(worksheet, "QuestionType") ?? 3;
                var levelCol = FindColumnByHeader(worksheet, "Level") ?? 4;
                var difficultyCol = FindColumnByHeader(worksheet, "Difficulty") ?? 5;
                var optionsCol = FindColumnByHeader(worksheet, "Options") ?? 6;
                var explanationCol = FindColumnByHeader(worksheet, "Explanation") ?? 7;
                var topicCol = FindColumnByHeader(worksheet, "Topic") ?? 8;

                // Bắt đầu transaction cho việc lưu dữ liệu nếu không chỉ validate
                using var transaction = validateOnly ? null : await _context.Database.BeginTransactionAsync();
                DateTime now = DateTime.UtcNow;

                try
                {
                    // Xử lý từng dòng dữ liệu (bắt đầu từ dòng 2, bỏ qua header)
                    for (int row = 2; row <= rowCount; row++)
                    {
                        totalProcessed++;

                        try
                        {
                            // Đọc dữ liệu từ file
                            var content = worksheet.Cells[row, contentCol].Text.Trim();
                            if (string.IsNullOrEmpty(content))
                            {
                                errors.Add(new { Row = row, Error = "Thiếu nội dung câu hỏi" });
                                failedCount++;
                                continue;
                            }

                            // Đọc và kiểm tra loại câu hỏi
                            var questionTypeText = worksheet.Cells[row, questionTypeCol].Text.Trim();
                            if (!int.TryParse(questionTypeText, out int questionType) || questionType < 1 || questionType > 3)
                            {
                                errors.Add(new { Row = row, Error = "Loại câu hỏi không hợp lệ (phải là 1, 2 hoặc 3)" });
                                failedCount++;
                                continue;
                            }
                            string scoringConfig = "{\"1_correct\": 0.10, \"2_correct\": 0.25, \"3_correct\": 0.50, \"4_correct\": 1.00}";
                            string shortAnswerConfig = "{\"case_sensitive\": false, \"exact_match\": false, \"partial_credit\": true, \"partial_credit_percent\": 50, \"allow_similar\": true, \"similarity_threshold\": 80}";
                            // Đọc mức độ câu hỏi
                            var levelText = worksheet.Cells[row, levelCol].Text.Trim();
                            int questionLevelId = selectedLevel?.Id ?? 0;

                            if (!string.IsNullOrEmpty(levelText) && questionLevelId == 0)
                            {
                                if (int.TryParse(levelText, out int parsedLevelId))
                                {
                                    var level = allLevels.FirstOrDefault(l => l.Id == parsedLevelId);
                                    if (level != null)
                                    {
                                        questionLevelId = level.Id;
                                    }
                                }
                                else
                                {
                                    // Tìm theo tên
                                    var level = allLevels.FirstOrDefault(l =>
                                        l.Name.Equals(levelText, StringComparison.OrdinalIgnoreCase));
                                    if (level != null)
                                    {
                                        questionLevelId = level.Id;
                                    }
                                }
                            }

                            // Kiểm tra nếu không tìm thấy level
                            if (questionLevelId == 0)
                            {
                                if (defaultLevel != null)
                                {
                                    questionLevelId = defaultLevel.Id;
                                    warnings.Add(new { Row = row, Message = $"Không tìm thấy mức độ câu hỏi '{levelText}', sử dụng mức độ mặc định '{defaultLevel.Name}'" });
                                }
                                else
                                {
                                    errors.Add(new { Row = row, Error = "Không tìm thấy mức độ câu hỏi và không có mức độ mặc định" });
                                    failedCount++;
                                    continue;
                                }
                            }

                            // Đọc độ khó (nếu áp dụng trong model)
                            int questionDifficulty = 1; // Mặc định là 1
                            var difficultyText = worksheet.Cells[row, difficultyCol].Text.Trim();
                            if (!string.IsNullOrEmpty(difficultyText) && int.TryParse(difficultyText, out int parsedDifficulty))
                            {
                                if (parsedDifficulty >= 1 && parsedDifficulty <= 5)
                                {
                                    questionDifficulty = parsedDifficulty;
                                }
                            }
                            // Add these variables after reading the question type

                            // Đọc các lựa chọn
                            var optionsText = worksheet.Cells[row, optionsCol].Text.Trim();
                            List<QuestionOption> rowOptions = new List<QuestionOption>();

                            if (string.IsNullOrEmpty(optionsText))
                            {
                                errors.Add(new { Row = row, Error = "Thiếu thông tin lựa chọn" });
                                failedCount++;
                                continue;
                            }

                            try
                            {
                                var jsonOptions = new JsonSerializerOptions
                                {
                                    PropertyNameCaseInsensitive = true,
                                    AllowTrailingCommas = true
                                };

                                var optionsData = JsonSerializer.Deserialize<List<OptionImportDTO>>(optionsText, jsonOptions);

                                // Add debug logging to see what's being parsed
                                _logger.LogDebug($"Row {row}: Parsed {optionsData.Count} options, correct answers: {optionsData.Count(o => o.IsCorrect)}");

                                // Show the first few options for debugging
                                foreach (var opt in optionsData.Take(2))
                                {
                                    _logger.LogDebug($"Option: {opt.Content}, IsCorrect: {opt.IsCorrect}, Label: {opt.Label}");
                                }

                                // Rest of your validation code
                                // Kiểm tra lựa chọn theo loại câu hỏi
                                if (questionType == 1) // Trắc nghiệm một đáp án
                                {
                                    if (optionsData.Count < 2)
                                    {
                                        errors.Add(new { Row = row, Error = "Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn" });
                                        failedCount++;
                                        continue;
                                    }

                                    if (optionsData.Count(o => o.IsCorrect) != 1)
                                    {
                                        errors.Add(new { Row = row, Error = "Câu hỏi trắc nghiệm phải có đúng 1 đáp án đúng" });
                                        failedCount++;
                                        continue;
                                    }
                                }
                                else if (questionType == 2) // Đúng/sai nhiều ý
                                {
                                    // Thêm validation cho câu hỏi loại 2
                                    if (optionsData.Count < 1)
                                    {
                                        errors.Add(new { Row = row, Error = "Câu hỏi đúng/sai phải có ít nhất 1 ý" });
                                        failedCount++;
                                        continue;
                                    }

                                    // Đảm bảo mỗi option có groupId khác nhau
                                    var groupIds = optionsData.Select(o => o.GroupId).Where(g => g.HasValue).Select(g => g.Value).ToList();
                                    if (groupIds.Count > 0 && groupIds.Count != groupIds.Distinct().Count())
                                    {
                                        errors.Add(new { Row = row, Error = "Mỗi ý trong câu hỏi đúng/sai phải có GroupId riêng biệt" });
                                        failedCount++;
                                        continue;
                                    }
                                }
                                else if (questionType == 3) // Trả lời ngắn
                                {
                                    if (!optionsData.Any(o => o.IsCorrect))
                                    {
                                        errors.Add(new { Row = row, Error = "Câu hỏi trả lời ngắn phải có ít nhất 1 đáp án đúng" });
                                        failedCount++;
                                        continue;
                                    }
                                }

                                // Chuyển đổi sang QuestionOption
                                for (int i = 0; i < optionsData.Count; i++)
                                {
                                    var option = optionsData[i];
                                    rowOptions.Add(new QuestionOption
                                    {
                                        Content = option.Content,
                                        IsCorrect = option.IsCorrect,
                                        OrderIndex = i + 1,
                                        Label = option.Label ?? GenerateOptionLabel(i),
                                        ImagePath = "",
                                        Explanation = "", // Không có property Explanation trong OptionImportDTO
                                        MatchingValue = "",
                                        IsPartOfTrueFalseGroup = questionType == 2,
                                        GroupId = option.GroupId ?? i + 1,
                                        ScorePercentage = option.ScorePercentage ?? (option.IsCorrect ? 100 : 0)
                                    });
                                }
                            }
                            catch (JsonException ex)
                            {
                                errors.Add(new { Row = row, Error = $"Định dạng JSON của Options không hợp lệ: {ex.Message}" });
                                failedCount++;
                                continue;
                            }

                            // Đọc giải thích
                            var explanation = worksheet.Cells[row, explanationCol].Text.Trim();

                            // Đọc chủ đề/tags
                            var topic = worksheet.Cells[row, topicCol].Text.Trim();

                            // Kiểm tra nếu câu hỏi đã tồn tại (sử dụng cached data)
                            bool questionExists = existingQuestionContents.Contains(content);
                            Question existingQuestion = null;

                            if (questionExists)
                            {
                                if (!validateOnly && overrideExisting)
                                {
                                    // Chỉ query DB khi thực sự cần cập nhật
                                    existingQuestion = await _context.Questions
                                        .FirstOrDefaultAsync(q => q.Content.Equals(content) && q.SubjectId == subjectId);
                                }
                                else
                                {
                                    warnings.Add(new { Row = row, Message = $"Câu hỏi tương tự đã tồn tại" });
                                    if (validateOnly || !overrideExisting)
                                    {
                                        successCount++; // Vẫn tính là thành công trong chế độ validate
                                        continue;
                                    }
                                }
                            }

                            // Lấy chapter (category)
                            int chapterIdValue = selectedChapter?.Id ?? chapterId ?? 0;
                            if (chapterIdValue == 0 && defaultChapter != null)
                            {
                                chapterIdValue = defaultChapter.Id;
                            }

                            Chapter chapter = selectedChapter ?? defaultChapter;

                            // Nếu chỉ validate thì không tạo đối tượng
                            if (validateOnly)
                            {
                                successCount++;
                                continue;
                            }

                            // Tạo câu hỏi mới hoặc cập nhật câu hỏi cũ
                            if (existingQuestion != null && overrideExisting)
                            {
                                // Cập nhật câu hỏi hiện có
                                existingQuestion.Content = content;
                                existingQuestion.Explanation = explanation;
                                existingQuestion.QuestionType = questionType;
                                existingQuestion.QuestionLevelId = questionLevelId;
                                existingQuestion.Tags = topic;
                                existingQuestion.UpdatedAt = now;
                                existingQuestion.ScoringConfig = scoringConfig;
                                existingQuestion.ShortAnswerConfig = shortAnswerConfig;

                                // Thêm vào danh sách cập nhật
                                questionsToUpdate.Add(existingQuestion);
                                updatedQuestions++;

                                // Lưu options để xử lý sau
                                existingQuestionOptionsMap[existingQuestion.Id] = rowOptions;
                            }
                            else
                            {
                                // Tạo câu hỏi mới
                                var newQuestion = new Question
                                {
                                    Content = content,
                                    Explanation = explanation ?? "",
                                    SubjectId = subjectId,
                                    ChapterId = chapterIdValue,
                                    QuestionLevelId = questionLevelId,
                                    QuestionType = questionType,
                                    Tags = topic ?? "",
                                    SuggestedTime = 60, // Giá trị mặc định
                                    DefaultScore = 1, // Giá trị mặc định
                                    IsActive = true,
                                    ImagePath = "",
                                    CreatorId = currentUserId,
                                    CreatedAt = now,
                                    UpdatedAt = now,
                                    ScoringConfig = scoringConfig,
                                    ShortAnswerConfig = shortAnswerConfig,
                                    // Fix: Gán các required properties
                                    Subject = subject,
                                    Chapter = chapter,
                                    Creator = currentUser,
                                    Options = new List<QuestionOption>(), // Khởi tạo danh sách trống
                                    ExamQuestions = new List<ExamQuestion>() // Khởi tạo danh sách trống
                                };

                                // Thêm vào danh sách để xử lý theo batch
                                questionsToAdd.Add(newQuestion);
                                questionOptionsMap[newQuestion] = rowOptions;
                                newQuestions++;
                            }

                            // Xử lý theo batch nếu đạt đến số lượng
                            if ((questionsToAdd.Count + questionsToUpdate.Count) >= batchSize)
                            {
                                // Lưu các câu hỏi mới
                                if (questionsToAdd.Any())
                                {
                                    _context.Questions.AddRange(questionsToAdd);
                                }

                                // Cập nhật các câu hỏi
                                if (questionsToUpdate.Any())
                                {
                                    _context.Questions.UpdateRange(questionsToUpdate);
                                }

                                await _context.SaveChangesAsync();

                                // Xử lý options cho câu hỏi mới
                                foreach (var pair in questionOptionsMap)
                                {
                                    var q = pair.Key;
                                    var qOptions = pair.Value;

                                    foreach (var option in qOptions)
                                    {
                                        option.QuestionId = q.Id;
                                        _context.QuestionOptions.Add(option);
                                    }
                                }

                                // Xử lý options cho câu hỏi cập nhật
                                foreach (var pair in existingQuestionOptionsMap)
                                {
                                    var questionId = pair.Key;
                                    var qOptions = pair.Value;

                                    // Xóa options cũ
                                    var oldOptions = await _context.QuestionOptions
                                        .Where(o => o.QuestionId == questionId)
                                        .ToListAsync();

                                    if (oldOptions.Any())
                                    {
                                        _context.QuestionOptions.RemoveRange(oldOptions);
                                    }

                                    // Thêm options mới
                                    foreach (var option in qOptions)
                                    {
                                        option.QuestionId = questionId;
                                        _context.QuestionOptions.Add(option);
                                    }
                                }

                                await _context.SaveChangesAsync();

                                // Xóa dữ liệu batch đã xử lý
                                questionsToAdd.Clear();
                                questionsToUpdate.Clear();
                                questionOptionsMap.Clear();
                                existingQuestionOptionsMap.Clear();
                            }

                            successCount++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Lỗi khi xử lý dòng {row}");
                            errors.Add(new { Row = row, Error = $"Lỗi khi xử lý: {ex.Message}" });
                            failedCount++;

                            if (!continueOnError)
                            {
                                // Dừng xử lý nếu không tiếp tục khi gặp lỗi
                                throw;
                            }
                        }
                    }
                    // Inside your batch processing code (around line 1562)
                    if (questionsToAdd.Any())
                    {
                        // Before adding to the database, ensure ALL required fields have values
                        foreach (var q in questionsToAdd)
                        {
                            // Check for null values in required fields
                            if (string.IsNullOrEmpty(q.ScoringConfig))
                                q.ScoringConfig = "{\"1_correct\": 0.10, \"2_correct\": 0.25, \"3_correct\": 0.50, \"4_correct\": 1.00}";

                            if (string.IsNullOrEmpty(q.ShortAnswerConfig))
                                q.ShortAnswerConfig = "{\"case_sensitive\": false, \"exact_match\": false, \"partial_credit\": true, \"partial_credit_percent\": 50, \"allow_similar\": true, \"similarity_threshold\": 80}";

                            // Ensure navigation properties are correctly set
                            if (q.Subject == null && q.SubjectId > 0)
                                q.Subject = _context.Subjects.Find(q.SubjectId);

                            if (q.Chapter == null && q.ChapterId > 0)
                                q.Chapter = _context.Chapters.Find(q.ChapterId);

                            if (q.Creator == null && q.CreatorId > 0)
                                q.Creator = _context.Users.Find(q.CreatorId);

                            // Initialize collections if null
                            q.Options ??= new List<QuestionOption>();
                            q.ExamQuestions ??= new List<ExamQuestion>();

                            // Ensure dates are set
                            if (q.CreatedAt == default)
                                q.CreatedAt = DateTime.UtcNow;

                            if (q.UpdatedAt == null)
                                q.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                    // Xử lý các câu hỏi còn lại trong batch cuối cùng
                    if ((questionsToAdd.Count > 0 || questionsToUpdate.Count > 0) && !validateOnly)
                    {
                        // Lưu các câu hỏi mới
                        // Inside your batch processing code
                        if (questionsToAdd.Any())
                        {
                            // Before adding to the database, ensure none have null configuration
                            foreach (var q in questionsToAdd)
                            {
                                // Ensure ScoringConfig is not null
                                if (string.IsNullOrEmpty(q.ScoringConfig))
                                {
                                    q.ScoringConfig = "{\"1_correct\": 0.10, \"2_correct\": 0.25, \"3_correct\": 0.50, \"4_correct\": 1.00}";
                                }

                                // Ensure ShortAnswerConfig is not null
                                if (string.IsNullOrEmpty(q.ShortAnswerConfig))
                                {
                                    q.ShortAnswerConfig = "{\"case_sensitive\": false, \"exact_match\": false, \"partial_credit\": true, \"partial_credit_percent\": 50, \"allow_similar\": true, \"similarity_threshold\": 80}";
                                }
                            }

                            _context.Questions.AddRange(questionsToAdd);
                        }

                        if (questionsToUpdate.Any())
                        {
                            // Same check for updated questions
                            foreach (var q in questionsToUpdate)
                            {
                                // Ensure ScoringConfig is not null
                                if (string.IsNullOrEmpty(q.ScoringConfig))
                                    q.ScoringConfig = "{\"1_correct\": 0.10, \"2_correct\": 0.25, \"3_correct\": 0.50, \"4_correct\": 1.00}";

                                if (string.IsNullOrEmpty(q.ShortAnswerConfig))
                                    q.ShortAnswerConfig = "{\"case_sensitive\": false, \"exact_match\": false, \"partial_credit\": true, \"partial_credit_percent\": 50, \"allow_similar\": true, \"similarity_threshold\": 80}";

                                // Make sure UpdatedAt is set
                                q.UpdatedAt = DateTime.UtcNow;
                            }

                            _context.Questions.UpdateRange(questionsToUpdate);
                        }

                        try
                        {
                            await _context.SaveChangesAsync();
                        }
                        catch (DbUpdateException ex)
                        {
                            var innerMsg = ex.InnerException?.Message ?? "Unknown inner exception";
                            _logger.LogError($"Database error saving questions: {ex.Message}. Inner: {innerMsg}");

                            // Check for specific values that might be causing issues
                            foreach (var entry in _context.ChangeTracker.Entries<Question>())
                            {
                                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                                {
                                    var entity = entry.Entity;
                                    _logger.LogWarning($"Problem entity - ID: {entity.Id}, Content: {entity.Content?.Substring(0, 20)}..., " +
                                    $"SubjectId: {entity.SubjectId}, ChapterId: {entity.ChapterId}, " +
                                                    $"ScoringConfig: {entity.ScoringConfig?.Length ?? 0}, " +
                                                    $"ShortAnswerConfig: {entity.ShortAnswerConfig?.Length ?? 0}");
                                }
                            }

                            throw;
                        }

                        // Xử lý options cho câu hỏi mới
                        foreach (var pair in questionOptionsMap)
                        {
                            var q = pair.Key;
                            var qOptions = pair.Value;

                            foreach (var option in qOptions)
                            {
                                option.QuestionId = q.Id;
                                _context.QuestionOptions.Add(option);
                            }
                        }

                        // Xử lý options cho câu hỏi cập nhật
                        foreach (var pair in existingQuestionOptionsMap)
                        {
                            var questionId = pair.Key;
                            var qOptions = pair.Value;

                            // Xóa options cũ
                            var oldOptions = await _context.QuestionOptions
                                .Where(o => o.QuestionId == questionId)
                                .ToListAsync();

                            if (oldOptions.Any())
                            {
                                _context.QuestionOptions.RemoveRange(oldOptions);
                            }

                            // Thêm options mới
                            foreach (var option in qOptions)
                            {
                                option.QuestionId = questionId;
                                _context.QuestionOptions.Add(option);
                            }
                        }

                        await _context.SaveChangesAsync();
                    }

                    // Commit transaction nếu không phải validate only mode
                    if (!validateOnly && transaction != null)
                    {
                        await transaction.CommitAsync();
                        _logger.LogInformation($"Đã commit transaction, thời gian xử lý: {stopwatch.ElapsedMilliseconds}ms");
                    }

                    // Trả về kết quả
                    return Ok(new
                    {
                        Success = true,
                        Message = validateOnly
                            ? $"Kiểm tra thành công {successCount}/{totalProcessed} câu hỏi"
                            : $"Nhập thành công {successCount}/{totalProcessed} câu hỏi",
                        ProcessingTime = stopwatch.ElapsedMilliseconds,
                        Data = new
                        {
                            TotalProcessed = totalProcessed,
                            SuccessCount = successCount,
                            FailedCount = failedCount,
                            NewQuestions = newQuestions,
                            UpdatedQuestions = updatedQuestions,
                            Errors = errors.Take(100).ToList(), // Giới hạn số lỗi trả về
                            ErrorCount = errors.Count,
                            Warnings = warnings.Take(100).ToList(), // Giới hạn số cảnh báo trả về
                            WarningCount = warnings.Count
                        }
                    });
                }
                catch (Exception ex)
                {
                    // Rollback transaction nếu có lỗi và không phải validate only
                    if (!validateOnly && transaction != null)
                    {
                        await transaction.RollbackAsync();
                        _logger.LogWarning("Transaction đã được rollback do lỗi");
                    }

                    _logger.LogError(ex, "Lỗi khi nhập câu hỏi từ Excel");
                    return StatusCode(StatusCodes.Status500InternalServerError, new
                    {
                        Success = false,
                        Error = "Lỗi khi nhập câu hỏi từ Excel",
                        Message = ex.Message,
                        StackTrace = ex.StackTrace,
                        Code = "IMPORT_ERROR"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi nhập câu hỏi từ Excel");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Success = false,
                    Error = "Lỗi máy chủ",
                    Message = ex.Message,
                    Code = "SERVER_ERROR"
                });
            }
        }
        public class FileUploadOperationFilter : IOperationFilter
        {
            public void Apply(OpenApiOperation operation, OperationFilterContext context)
            {
                // Kiểm tra xem API này có tham số IFormFile không
                var fileParameters = context.MethodInfo.GetParameters()
                    .Where(p => p.ParameterType == typeof(IFormFile))
                    .ToList();

                if (!fileParameters.Any()) return;

                // Đã có RequestBody schema, không cần thêm
                if (operation.RequestBody?.Content?.ContainsKey("multipart/form-data") == true)
                    return;

                // Tạo mới RequestBody schema
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, OpenApiSchema>()
                            }
                        }
                    }
                };

                // Thêm các tham số từ API method vào schema
                var properties = operation.RequestBody.Content["multipart/form-data"].Schema.Properties;

                foreach (var parameter in context.MethodInfo.GetParameters())
                {
                    var fromFormAttribute = parameter.GetCustomAttribute<FromFormAttribute>();
                    if (fromFormAttribute == null) continue;

                    if (parameter.ParameterType == typeof(IFormFile))
                    {
                        properties[parameter.Name] = new OpenApiSchema
                        {
                            Type = "string",
                            Format = "binary",
                            Description = $"{parameter.Name} file"
                        };
                    }
                    else
                    {
                        var schemaType = GetOpenApiSchemaType(parameter.ParameterType);
                        properties[parameter.Name] = new OpenApiSchema
                        {
                            Type = schemaType.Item1,
                            Format = schemaType.Item2,
                            Description = parameter.Name,
                            Nullable = parameter.ParameterType.IsGenericType &&
                                      parameter.ParameterType.GetGenericTypeDefinition() == typeof(Nullable<>)
                        };
                    }
                }
            }

            private (string, string) GetOpenApiSchemaType(Type type)
            {
                var nullableType = Nullable.GetUnderlyingType(type);
                type = nullableType ?? type;

                if (type == typeof(int)) return ("integer", "int32");
                if (type == typeof(long)) return ("integer", "int64");
                if (type == typeof(bool)) return ("boolean", null);
                if (type == typeof(double) || type == typeof(float) || type == typeof(decimal))
                    return ("number", null);

                return ("string", null);
            }
        }
        /// <summary>
        /// Xuất câu hỏi ra file Excel
        /// </summary>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("export")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ExportQuestions([FromBody] ExportQuestionsDTO model)
        {
            try
            {
                _logger.LogInformation("Bắt đầu xuất câu hỏi ra Excel");
                var stopwatch = Stopwatch.StartNew();

                // Kiểm tra parameters
                if (model == null)
                    return BadRequest(new { Success = false, Error = "Các tham số không hợp lệ" });

                // Xác định số lượng câu hỏi tối đa
                int limitRows = model.LimitRows ?? 1000;
                if (limitRows > 5000)
                    limitRows = 5000;

                // Tối ưu query bằng cách chỉ select các trường cần thiết
                var queryBuilder = _context.Questions.AsNoTracking();

                // Áp dụng các filter cơ bản trước
                if (model.SubjectId.HasValue)
                    queryBuilder = queryBuilder.Where(q => q.SubjectId == model.SubjectId);

                if (model.ChapterId.HasValue)
                    queryBuilder = queryBuilder.Where(q => q.ChapterId == model.ChapterId);

                if (model.LevelId.HasValue)
                    queryBuilder = queryBuilder.Where(q => q.QuestionLevelId == model.LevelId);

                if (model.QuestionType.HasValue)
                    queryBuilder = queryBuilder.Where(q => q.QuestionType == model.QuestionType);

                // Filter theo topic và search query
                if (!string.IsNullOrEmpty(model.Topic))
                    queryBuilder = queryBuilder.Where(q => q.Tags.Contains(model.Topic));

                if (!string.IsNullOrEmpty(model.Search))
                    queryBuilder = queryBuilder.Where(q => q.Content.Contains(model.Search));

                // Filter theo danh sách ID
                if (model.QuestionIds != null && model.QuestionIds.Any())
                    queryBuilder = queryBuilder.Where(q => model.QuestionIds.Contains(q.Id));

                // Đếm tổng số câu hỏi phù hợp filter (chỉ đếm khi cần thiết)
                int totalCount = await queryBuilder.CountAsync();

                // Bao gồm các thông tin khác chỉ khi cần thiết để tối ưu hoá query
                var query = queryBuilder.OrderByDescending(q => q.CreatedAt);

                // Sử dụng Select để chỉ lấy những trường cần thiết
                var questionsQuery = query
                    .Select(q => new
                    {
                        q.Id,
                        q.Content,
                        q.QuestionType,
                        Level = q.Level.Name,
                        q.Explanation,
                        q.Tags,
                        q.CreatedAt,
                        Creator = model.IncludeMetadata == true ? q.Creator.FullName : null,
                        CreatorUsername = model.IncludeMetadata == true ? q.Creator.Username : null,
                        Options = model.IncludeOptions != false ? q.Options.Select(o => new
                        {
                            o.Content,
                            o.IsCorrect,
                            o.Label,
                            o.GroupId,
                            o.ScorePercentage
                        }) : null,
                        UsageCount = model.IncludeMetadata == true ? q.ExamQuestions.Count : 0
                    })
                    .Take(limitRows);

                // Lấy danh sách câu hỏi
                var questions = await questionsQuery.ToListAsync();

                if (!questions.Any())
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Error = "Không tìm thấy câu hỏi nào phù hợp với tiêu chí lọc"
                    });
                }

                // Tạo file Excel
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Questions");

                // Thêm tiêu đề
                worksheet.Cells["A1"].Value = "STT";
                worksheet.Cells["B1"].Value = "ID";
                worksheet.Cells["C1"].Value = "Content";
                worksheet.Cells["D1"].Value = "QuestionType";
                worksheet.Cells["E1"].Value = "Level";
                worksheet.Cells["F1"].Value = "Difficulty";
                worksheet.Cells["G1"].Value = "Options";
                worksheet.Cells["H1"].Value = "Explanation";
                worksheet.Cells["I1"].Value = "Topic";

                // Thêm metadata nếu yêu cầu
                if (model.IncludeMetadata == true)
                {
                    worksheet.Cells["J1"].Value = "CreatedAt";
                    worksheet.Cells["K1"].Value = "CreatedBy";
                    worksheet.Cells["L1"].Value = "UsageCount";
                }

                // Định dạng header
                using (var range = worksheet.Cells["A1:L1"])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                }

                // Điền dữ liệu - sử dụng LoadFromCollection để tối ưu hiệu suất với dữ liệu lớn
                for (int i = 0; i < questions.Count; i++)
                {
                    var question = questions[i];
                    int row = i + 2; // Bắt đầu từ dòng 2

                    worksheet.Cells[row, 1].Value = i + 1; // STT
                    worksheet.Cells[row, 2].Value = question.Id;
                    worksheet.Cells[row, 3].Value = question.Content;
                    worksheet.Cells[row, 4].Value = question.QuestionType;
                    worksheet.Cells[row, 5].Value = question.Level;
                    worksheet.Cells[row, 6].Value = 1; // Default difficulty

                    // Xử lý options
                    if (model.IncludeOptions != false && question.Options != null)
                    {
                        var options = question.Options.Select(o => new OptionExportDTO
                        {
                            Content = o.Content,
                            IsCorrect = o.IsCorrect,
                            Label = o.Label,
                            GroupId = (int)o.GroupId,
                            ScorePercentage = o.ScorePercentage
                        }).ToList();

                        var jsonOptions = new JsonSerializerOptions
                        {
                            WriteIndented = false,
                            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                        };

                        worksheet.Cells[row, 7].Value = JsonSerializer.Serialize(options, jsonOptions);
                    }

                    // Giải thích
                    if (model.IncludeExplanation != false)
                    {
                        worksheet.Cells[row, 8].Value = question.Explanation;
                    }

                    // Chủ đề/Tags
                    worksheet.Cells[row, 9].Value = question.Tags;

                    // Metadata
                    if (model.IncludeMetadata == true)
                    {
                        worksheet.Cells[row, 10].Value = question.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
                        worksheet.Cells[row, 11].Value = !string.IsNullOrEmpty(question.Creator)
                            ? question.Creator
                            : question.CreatorUsername;
                        worksheet.Cells[row, 12].Value = question.UsageCount;
                    }
                }

                // Điều chỉnh kích thước cột tự động
                worksheet.Cells.AutoFitColumns();

                // Thêm sheet thông tin (metadata)
                var infoSheet = package.Workbook.Worksheets.Add("Info");
                infoSheet.Cells["A1"].Value = "Thông tin xuất dữ liệu";
                infoSheet.Cells["A1:B1"].Merge = true;
                infoSheet.Cells["A1:B1"].Style.Font.Bold = true;

                infoSheet.Cells["A2"].Value = "Ngày xuất:";
                infoSheet.Cells["B2"].Value = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

                infoSheet.Cells["A3"].Value = "Tổng số câu hỏi:";
                infoSheet.Cells["B3"].Value = questions.Count;

                infoSheet.Cells["A4"].Value = "Tổng số câu hỏi phù hợp:";
                infoSheet.Cells["B4"].Value = totalCount;

                infoSheet.Cells["A5"].Value = "Filter:";
                infoSheet.Cells["B5"].Value = JsonSerializer.Serialize(new
                {
                    model.SubjectId,
                    model.ChapterId,
                    model.LevelId,
                    model.QuestionType,
                    model.Topic,
                    model.Search,
                    HasIds = model.QuestionIds != null && model.QuestionIds.Any()
                });

                infoSheet.Cells["A:B"].AutoFitColumns();

                // Chuyển file thành byte array
                var fileBytes = package.GetAsByteArray();

                // Tạo tên file
                string fileName = $"questions_export_{DateTime.UtcNow:yyyyMMddHHmmss}.{(model.Format?.ToLower() == "xls" ? "xls" : "xlsx")}";

                // Trả về file Excel
                return File(
                    fileBytes,
                    model.Format?.ToLower() == "xls"
                        ? "application/vnd.ms-excel"
                        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất câu hỏi ra Excel");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Success = false,
                    Error = "Lỗi máy chủ",
                    Message = "Đã xảy ra lỗi khi tạo file Excel: " + ex.Message,
                    Code = "EXPORT_ERROR"
                });
            }
        }

        /// <summary>
        /// Tải xuống mẫu file Excel để nhập câu hỏi
        /// </summary>
        [HttpGet("import-template")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult DownloadImportTemplate()
        {
            try
            {
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Questions");

                // Tạo tiêu đề
                worksheet.Cells["A1"].Value = "STT";
                worksheet.Cells["B1"].Value = "Content";
                worksheet.Cells["C1"].Value = "QuestionType";
                worksheet.Cells["D1"].Value = "Level";
                worksheet.Cells["E1"].Value = "Difficulty";
                worksheet.Cells["F1"].Value = "Options";
                worksheet.Cells["G1"].Value = "Explanation";
                worksheet.Cells["H1"].Value = "Topic";

                // Định dạng header
                using (var range = worksheet.Cells["A1:H1"])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                }

                // Thêm hướng dẫn
                worksheet.Cells["A2"].Value = "1";
                worksheet.Cells["B2"].Value = "Tìm x biết 2x + 5 = 15";
                worksheet.Cells["C2"].Value = "1";
                worksheet.Cells["D2"].Value = "Cơ bản";
                worksheet.Cells["E2"].Value = "2";
                worksheet.Cells["F2"].Value = @"[{""content"":""5"",""isCorrect"":true,""label"":""A""},{""content"":""6"",""isCorrect"":false,""label"":""B""},{""content"":""7"",""isCorrect"":false,""label"":""C""},{""content"":""8"",""isCorrect"":false,""label"":""D""}]";
                worksheet.Cells["G2"].Value = "Thay x = 5 vào pt: 2*5 + 5 = 15 (Đúng)";
                worksheet.Cells["H2"].Value = "Phương trình";

                // Ví dụ câu hỏi loại 2
                worksheet.Cells["A3"].Value = "2";
                worksheet.Cells["B3"].Value = "Đâu là đặc điểm của nước?";
                worksheet.Cells["C3"].Value = "2";
                worksheet.Cells["D3"].Value = "Cơ bản";
                worksheet.Cells["E3"].Value = "1";
                worksheet.Cells["F3"].Value = @"[{""content"":""Nước sôi ở 100°C"",""isCorrect"":true,""groupId"":1},{""content"":""Nước đông ở -10°C"",""isCorrect"":false,""groupId"":2},{""content"":""Trái đất hình cầu"",""isCorrect"":true,""groupId"":3}]";
                worksheet.Cells["G3"].Value = "Nước đông ở 0°C, không phải -10°C";
                worksheet.Cells["H3"].Value = "Vật lý";

                // Ví dụ câu hỏi loại 3
                worksheet.Cells["A4"].Value = "3";
                worksheet.Cells["B4"].Value = "Thủ đô của Việt Nam là?";
                worksheet.Cells["C4"].Value = "3";
                worksheet.Cells["D4"].Value = "Cơ bản";
                worksheet.Cells["E4"].Value = "1";
                worksheet.Cells["F4"].Value = @"[{""content"":""Hà Nội"",""isCorrect"":true,""scorePercentage"":100},{""content"":""Ha Noi"",""isCorrect"":true,""scorePercentage"":100}]";
                worksheet.Cells["G4"].Value = "Thủ đô của Việt Nam là Hà Nội";
                worksheet.Cells["H4"].Value = "Địa lý";

                // Thêm chú thích
                worksheet.Cells["A6"].Value = "Chú thích:";
                worksheet.Cells["A7"].Value = "QuestionType: 1 = Trắc nghiệm một đáp án, 2 = Đúng/sai nhiều ý, 3 = Trả lời ngắn";
                worksheet.Cells["A8"].Value = "Difficulty: Từ 1 đến 5 (1 = Dễ nhất, 5 = Khó nhất)";

                worksheet.Cells.AutoFitColumns();

                // Chuyển file thành byte array
                var fileBytes = package.GetAsByteArray();

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "questions_import_template.xlsx"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo mẫu file Excel");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Success = false,
                    Error = "Lỗi khi tạo mẫu file Excel",
                    Message = ex.Message
                });
            }
        }

        #region Helper Methods

        /// <summary>
        /// Tìm vị trí cột dựa vào tiêu đề
        /// </summary>
        private int? FindColumnByHeader(ExcelWorksheet worksheet, string headerName)
        {
            // Kiểm tra số cột trong sheet
            if (worksheet.Dimension == null)
                return null;

            for (int col = 1; col <= worksheet.Dimension.Columns; col++)
            {
                var cellValue = worksheet.Cells[1, col].Text.Trim();
                if (cellValue.Equals(headerName, StringComparison.OrdinalIgnoreCase))
                    return col;
            }
            return null;
        }

        /// <summary>
        /// Tạo nhãn tùy chọn theo thứ tự (A, B, C, ...)
        /// </summary>
        private string GenerateOptionLabel(int index)
        {
            return ((char)('A' + index)).ToString();
        }

        #endregion
        /// <summary>
        /// Lấy câu hỏi ngẫu nhiên theo các tiêu chí
        /// </summary>
        /// <param name="subjectId">ID của môn học</param>
        /// <param name="chapterId">ID của chương</param>
        /// <param name="levelId">ID của mức độ câu hỏi</param>
        /// <param name="questionType">Loại câu hỏi (1: Một đáp án, 2: Đúng-sai nhiều ý, 3: Trả lời ngắn)</param>
        /// <param name="topic">Tìm kiếm theo chủ đề/tag</param>
        /// <param name="count">Số lượng câu hỏi cần lấy</param>
        /// <param name="excludeIds">Danh sách ID câu hỏi cần loại trừ, phân cách bởi dấu phẩy</param>
        /// <returns>Danh sách câu hỏi ngẫu nhiên theo tiêu chí</returns>
        [HttpGet("random")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRandomQuestions(
            [FromQuery] int? subjectId = null,
            [FromQuery] int? chapterId = null,
            [FromQuery] int? levelId = null,
            [FromQuery] int? questionType = null,
            [FromQuery] string topic = null,
            [FromQuery] int count = 10,
            [FromQuery] string excludeIds = null)
        {
            try
            {
                _logger.LogInformation($"Lấy câu hỏi ngẫu nhiên: SubjectId={subjectId}, ChapterId={chapterId}, " +
                    $"LevelId={levelId}, QuestionType={questionType}, Topic={topic}, Count={count}");

                // Validate đầu vào
                if (count <= 0 || count > 100)
                {
                    return BadRequest(new { Success = false, Message = "Số lượng câu hỏi phải nằm trong khoảng 1-100" });
                }

                if (!subjectId.HasValue)
                {
                    return BadRequest(new { Success = false, Message = "Vui lòng chọn môn học" });
                }

                // Tạo query cơ bản
                var query = _context.Questions
                    .Include(q => q.Subject)
                    .Include(q => q.Chapter)
                    .Include(q => q.Level)
                    .Include(q => q.Options)
                    .Where(q => q.IsActive);

                // Áp dụng các bộ lọc
                if (subjectId.HasValue && subjectId > 0)
                {
                    query = query.Where(q => q.SubjectId == subjectId.Value);
                }

                if (chapterId.HasValue && chapterId > 0)
                {
                    query = query.Where(q => q.ChapterId == chapterId.Value);
                }

                if (levelId.HasValue && levelId > 0)
                {
                    query = query.Where(q => q.QuestionLevelId == levelId.Value);
                }

                if (questionType.HasValue && (questionType == 1 || questionType == 2 || questionType == 3))
                {
                    query = query.Where(q => q.QuestionType == questionType.Value);
                }

                if (!string.IsNullOrEmpty(topic))
                {
                    query = query.Where(q => q.Tags.Contains(topic));
                }

                // Xử lý loại trừ câu hỏi theo ID
                List<int> idsToExclude = new List<int>();
                if (!string.IsNullOrEmpty(excludeIds))
                {
                    idsToExclude = excludeIds.Split(',')
                        .Where(id => !string.IsNullOrWhiteSpace(id))
                        .Select(id => int.TryParse(id.Trim(), out int parsedId) ? parsedId : -1)
                        .Where(id => id > 0)
                        .ToList();

                    if (idsToExclude.Any())
                    {
                        query = query.Where(q => !idsToExclude.Contains(q.Id));
                    }
                }

                // Lấy hết dữ liệu vào bộ nhớ và shuffle
                var availableQuestions = await query.ToListAsync();

                // Đếm tổng số câu hỏi phù hợp
                var totalAvailable = availableQuestions.Count;

                if (totalAvailable == 0)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy câu hỏi nào phù hợp với tiêu chí"
                    });
                }

                // Lấy số lượng câu hỏi thực tế (không vượt quá số lượng có sẵn)
                int actualCount = Math.Min(count, totalAvailable);

                // Shuffle bằng Fisher-Yates algorithm
                var random = new Random();
                int n = availableQuestions.Count;
                while (n > 1)
                {
                    n--;
                    int k = random.Next(n + 1);
                    var value = availableQuestions[k];
                    availableQuestions[k] = availableQuestions[n];
                    availableQuestions[n] = value;
                }

                // Lấy số lượng cần thiết
                var questions = availableQuestions.Take(actualCount).ToList();

                // Chuyển sang DTO
                var questionDTOs = questions.Select(q => new QuestionListDTO
                {
                    Id = q.Id,
                    Content = q.Content,
                    QuestionType = q.QuestionTypeName ?? GetQuestionTypeName(q.QuestionType),
                    Level = q.Level?.Name,
                    DefaultScore = q.DefaultScore,
                    Subject = new SubjectBasicDTO
                    {
                        Id = q.Subject.Id,
                        Name = q.Subject.Name,
                        Code = q.Subject.Code
                    },
                    Chapter = q.Chapter != null ? new ChapterBasicDTO
                    {
                        Id = q.Chapter.Id,
                        Name = q.Chapter.Name
                    } : null,
                    Tags = q.Tags,
                    OptionsCount = q.Options.Count,
                    IsActive = q.IsActive,
                    CreatedAt = q.CreatedAt
                }).ToList();

                return Ok(new
                {
                    Success = true,
                    TotalAvailable = totalAvailable,
                    RequestedCount = count,
                    ActualCount = actualCount,
                    Data = questionDTOs,
                    // Trả về danh sách ID dưới dạng chuỗi phân cách bằng dấu phẩy để hỗ trợ excludeIds
                    IdList = string.Join(",", questionDTOs.Select(q => q.Id))
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy câu hỏi ngẫu nhiên: {ex.Message}");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi lấy câu hỏi ngẫu nhiên",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy tên loại câu hỏi từ mã số
        /// </summary>
        private string GetQuestionTypeName(int questionType)
        {
            return questionType switch
            {
                1 => "Trắc nghiệm một đáp án",
                2 => "Đúng-sai nhiều ý",
                3 => "Trả lời ngắn",
                _ => "Không xác định",
            };
        }
        /// <summary>
        /// Trộn câu hỏi ngẫu nhiên cho đề thi từ nhiều nguồn khác nhau
        /// </summary>
        /// <param name="request">Thông tin yêu cầu trộn câu hỏi</param>
        /// <returns>Danh sách câu hỏi đã trộn</returns>
        [HttpPost("mix")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> MixQuestions([FromBody] QuestionMixRequestDTO request)
        {
            try
            {
                _logger.LogInformation("Bắt đầu trộn câu hỏi ngẫu nhiên theo yêu cầu");

                if (request == null || request.Sources == null || !request.Sources.Any())
                {
                    return BadRequest(new { Success = false, Message = "Cần cung cấp ít nhất một nguồn câu hỏi" });
                }

                // Khởi tạo kết quả
                var result = new QuestionMixResultDTO
                {
                    RequestedCount = request.Sources.Sum(s => s.Count),
                    ActualCount = 0,
                    TotalScore = 0,
                    TypeStats = new List<QuestionTypeStatDTO>(),
                    SubjectStats = new List<SubjectStatDTO>(),
                    Questions = new List<QuestionDetailDTO>()
                };

                // Danh sách câu hỏi đã lấy (để tránh trùng lặp)
                var selectedQuestionIds = new HashSet<int>();

                // Xử lý từng nguồn câu hỏi
                foreach (var source in request.Sources)
                {
                    try
                    {
                        // Kiểm tra yêu cầu hợp lệ
                        if (source.Count <= 0 || source.Count > 100)
                        {
                            _logger.LogWarning($"Số lượng câu hỏi không hợp lệ: {source.Count}, phải trong khoảng 1-100");
                            continue;
                        }

                        if (source.SubjectId <= 0)
                        {
                            _logger.LogWarning($"ID môn học không hợp lệ: {source.SubjectId}");
                            continue;
                        }

                        // Kiểm tra môn học tồn tại
                        var subject = await _context.Subjects.FindAsync(source.SubjectId);
                        if (subject == null)
                        {
                            _logger.LogWarning($"Không tìm thấy môn học với ID: {source.SubjectId}");
                            continue;
                        }

                        // Tạo query lấy câu hỏi
                        var query = _context.Questions
                            .Include(q => q.Subject)
                            .Include(q => q.Chapter)
                            .Include(q => q.Level)
                            .Include(q => q.Options)
                            .Where(q => q.SubjectId == source.SubjectId && q.IsActive);

                        // Áp dụng các bộ lọc
                        if (source.ChapterId.HasValue && source.ChapterId > 0)
                        {
                            query = query.Where(q => q.ChapterId == source.ChapterId.Value);
                        }

                        if (source.LevelId.HasValue && source.LevelId > 0)
                        {
                            query = query.Where(q => q.QuestionLevelId == source.LevelId.Value);
                        }

                        if (source.QuestionType.HasValue && (source.QuestionType == 1 || source.QuestionType == 2 || source.QuestionType == 3))
                        {
                            query = query.Where(q => q.QuestionType == source.QuestionType.Value);
                        }

                        if (!string.IsNullOrEmpty(source.Topic))
                        {
                            query = query.Where(q => q.Tags.Contains(source.Topic));
                        }

                        // Loại bỏ các câu hỏi đã chọn trước đó
                        if (selectedQuestionIds.Any())
                        {
                            query = query.Where(q => !selectedQuestionIds.Contains(q.Id));
                        }

                        // Loại bỏ các câu hỏi cần exclude
                        if (source.ExcludeIds != null && source.ExcludeIds.Any())
                        {
                            query = query.Where(q => !source.ExcludeIds.Contains(q.Id));
                        }

                        // Chọn phương thức chọn câu hỏi
                        IQueryable<Question> orderedQuery;
                        string method = (source.SelectionMethod ?? "random").ToLower();
                        switch (method)
                        {
                            case "newest":
                                orderedQuery = query.OrderByDescending(q => q.CreatedAt);
                                break;
                            case "oldest":
                                orderedQuery = query.OrderBy(q => q.CreatedAt);
                                break;
                            case "random":
                            default:
                                // Lấy tất cả câu hỏi vào bộ nhớ để xáo trộn
                                var questions = await query.ToListAsync();

                                // Shuffle bằng Fisher-Yates algorithm
                                var random = new Random();
                                int n = questions.Count;
                                while (n > 1)
                                {
                                    n--;
                                    int k = random.Next(n + 1);
                                    var value = questions[k];
                                    questions[k] = questions[n];
                                    questions[n] = value;
                                }

                                // Lấy số lượng cần thiết
                                var availableCount = Math.Min(source.Count, questions.Count);
                                var selectedQuestions = questions.Take(availableCount).ToList();

                                // Cập nhật danh sách ID để tránh trùng lặp
                                foreach (var question in selectedQuestions)
                                {
                                    selectedQuestionIds.Add(question.Id);

                                    // Tính điểm
                                    decimal score = source.ScorePerQuestion ?? question.DefaultScore;

                                    // Lưu trữ tên loại câu hỏi để dùng trong thống kê
                                    string questionTypeName = GetQuestionTypeName(question.QuestionType);

                                    // Chuyển đổi sang DTO
                                    var questionDto = new QuestionDetailDTO
                                    {
                                        Id = question.Id,
                                        Content = question.Content,
                                        QuestionType = question.QuestionType,
                                        // Không gán QuestionTypeName vì thuộc tính không tồn tại
                                        DefaultScore = score,
                                        SubjectId = question.SubjectId,
                                        ChapterId = question.ChapterId,
                                        QuestionLevelId = question.QuestionLevelId,
                                        Tags = question.Tags,
                                        HasImage = !string.IsNullOrEmpty(question.ImagePath),
                                        ImagePath = question.ImagePath,
                                        Subject = new SubjectBasicDTO
                                        {
                                            Id = question.Subject.Id,
                                            Name = question.Subject.Name,
                                            Code = question.Subject.Code
                                        },
                                        Chapter = question.Chapter != null ? new ChapterBasicDTO
                                        {
                                            Id = question.Chapter.Id,
                                            Name = question.Chapter.Name
                                        } : null,
                                        Level = question.Level != null ? new QuestionLevelDTO
                                        {
                                            Id = question.Level.Id,
                                            Name = question.Level.Name,
                                            Value = question.Level.Value,
                                            Description = question.Level.Description
                                        } : null
                                    };

                                    // Thêm đáp án nếu yêu cầu
                                    if (request.Settings?.IncludeAnswers == true)
                                    {
                                        questionDto.Options = question.Options.Select(o => new QuestionOptionDTO
                                        {
                                            Id = o.Id,
                                            Content = o.Content,
                                            IsCorrect = o.IsCorrect,
                                            OrderIndex = o.OrderIndex,
                                            Label = o.Label,
                                            ImagePath = o.ImagePath,
                                            IsPartOfTrueFalseGroup = o.IsPartOfTrueFalseGroup,
                                            GroupId = o.GroupId,
                                            ScorePercentage = o.ScorePercentage,
                                            // Không bao gồm matching value và explanation nếu không yêu cầu
                                            MatchingValue = request.Settings?.IncludeAnswers == true ? o.MatchingValue : null,
                                            Explanation = request.Settings?.IncludeExplanations == true ? o.Explanation : null
                                        }).OrderBy(o => o.OrderIndex).ToList();
                                    }

                                    // Thêm giải thích nếu yêu cầu
                                    if (request.Settings?.IncludeExplanations == true)
                                    {
                                        questionDto.Explanation = question.Explanation;
                                    }

                                    // Thêm vào danh sách kết quả
                                    result.Questions.Add(questionDto);
                                    result.ActualCount++;
                                    result.TotalScore += score;

                                    // Cập nhật thống kê theo loại câu hỏi
                                    var typeStat = result.TypeStats.FirstOrDefault(t => t.Type == question.QuestionType);
                                    if (typeStat == null)
                                    {
                                        result.TypeStats.Add(new QuestionTypeStatDTO
                                        {
                                            Type = question.QuestionType,
                                            TypeName = questionTypeName,
                                            Count = 1,
                                            TotalScore = score
                                        });
                                    }
                                    else
                                    {
                                        typeStat.Count++;
                                        typeStat.TotalScore += score;
                                    }

                                    // Cập nhật thống kê theo môn học
                                    var subjectStat = result.SubjectStats.FirstOrDefault(s => s.SubjectId == question.SubjectId);
                                    if (subjectStat == null)
                                    {
                                        result.SubjectStats.Add(new SubjectStatDTO
                                        {
                                            SubjectId = question.SubjectId,
                                            SubjectName = question.Subject.Name,
                                            Count = 1,
                                            TotalScore = score
                                        });
                                    }
                                    else
                                    {
                                        subjectStat.Count++;
                                        subjectStat.TotalScore += score;
                                    }
                                }

                                // Chuyển sang thực hiện nguồn tiếp theo
                                continue;
                        }

                        // Đối với phương thức newest và oldest, lấy dữ liệu từ database
                        var dbQuestions = await orderedQuery.Take(source.Count).ToListAsync();

                        // Thêm các câu hỏi vào danh sách kết quả
                        foreach (var question in dbQuestions)
                        {
                            selectedQuestionIds.Add(question.Id);

                            // Tính điểm
                            decimal score = source.ScorePerQuestion ?? question.DefaultScore;

                            // Lưu trữ tên loại câu hỏi để dùng trong thống kê
                            string questionTypeName = GetQuestionTypeName(question.QuestionType);

                            // Chuyển đổi sang DTO
                            var questionDto = new QuestionDetailDTO
                            {
                                Id = question.Id,
                                Content = question.Content,
                                QuestionType = question.QuestionType,
                                // Không gán QuestionTypeName vì thuộc tính không tồn tại
                                DefaultScore = score,
                                SubjectId = question.SubjectId,
                                ChapterId = question.ChapterId,
                                QuestionLevelId = question.QuestionLevelId,
                                Tags = question.Tags,
                                HasImage = !string.IsNullOrEmpty(question.ImagePath),
                                ImagePath = question.ImagePath,
                                Subject = new SubjectBasicDTO
                                {
                                    Id = question.Subject.Id,
                                    Name = question.Subject.Name,
                                    Code = question.Subject.Code
                                },
                                Chapter = question.Chapter != null ? new ChapterBasicDTO
                                {
                                    Id = question.Chapter.Id,
                                    Name = question.Chapter.Name
                                } : null,
                                Level = question.Level != null ? new QuestionLevelDTO
                                {
                                    Id = question.Level.Id,
                                    Name = question.Level.Name,
                                    Value = question.Level.Value,
                                    Description = question.Level.Description
                                } : null
                            };

                            // Thêm đáp án nếu yêu cầu
                            if (request.Settings?.IncludeAnswers == true)
                            {
                                questionDto.Options = question.Options.Select(o => new QuestionOptionDTO
                                {
                                    Id = o.Id,
                                    Content = o.Content,
                                    IsCorrect = o.IsCorrect,
                                    OrderIndex = o.OrderIndex,
                                    Label = o.Label,
                                    ImagePath = o.ImagePath,
                                    IsPartOfTrueFalseGroup = o.IsPartOfTrueFalseGroup,
                                    GroupId = o.GroupId,
                                    ScorePercentage = o.ScorePercentage,
                                    // Không bao gồm matching value và explanation nếu không yêu cầu
                                    MatchingValue = request.Settings?.IncludeAnswers == true ? o.MatchingValue : null,
                                    Explanation = request.Settings?.IncludeExplanations == true ? o.Explanation : null
                                }).OrderBy(o => o.OrderIndex).ToList();
                            }

                            // Thêm giải thích nếu yêu cầu
                            if (request.Settings?.IncludeExplanations == true)
                            {
                                questionDto.Explanation = question.Explanation;
                            }

                            // Thêm vào danh sách kết quả
                            result.Questions.Add(questionDto);
                            result.ActualCount++;
                            result.TotalScore += score;

                            // Cập nhật thống kê theo loại câu hỏi
                            var typeStat = result.TypeStats.FirstOrDefault(t => t.Type == question.QuestionType);
                            if (typeStat == null)
                            {
                                result.TypeStats.Add(new QuestionTypeStatDTO
                                {
                                    Type = question.QuestionType,
                                    TypeName = questionTypeName,
                                    Count = 1,
                                    TotalScore = score
                                });
                            }
                            else
                            {
                                typeStat.Count++;
                                typeStat.TotalScore += score;
                            }

                            // Cập nhật thống kê theo môn học
                            var subjectStat = result.SubjectStats.FirstOrDefault(s => s.SubjectId == question.SubjectId);
                            if (subjectStat == null)
                            {
                                result.SubjectStats.Add(new SubjectStatDTO
                                {
                                    SubjectId = question.SubjectId,
                                    SubjectName = question.Subject.Name,
                                    Count = 1,
                                    TotalScore = score
                                });
                            }
                            else
                            {
                                subjectStat.Count++;
                                subjectStat.TotalScore += score;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Lỗi khi xử lý nguồn câu hỏi: SubjectId={source.SubjectId}");
                        // Tiếp tục với nguồn tiếp theo
                    }
                }

                // Tính toán tỷ lệ phần trăm
                foreach (var typeStat in result.TypeStats)
                {
                    typeStat.Percentage = result.ActualCount > 0 ? Math.Round((double)typeStat.Count * 100 / result.ActualCount, 2) : 0;
                }

                foreach (var subjectStat in result.SubjectStats)
                {
                    subjectStat.Percentage = result.ActualCount > 0 ? Math.Round((double)subjectStat.Count * 100 / result.ActualCount, 2) : 0;
                }

                // Xáo trộn kết quả nếu được yêu cầu
                if (request.Settings?.Shuffle == true)
                {
                    var random = new Random();
                    result.Questions = result.Questions.OrderBy(q => random.Next()).ToList();
                }

                // Trả về kết quả
                return Ok(new
                {
                    Success = true,
                    Message = $"Đã trộn {result.ActualCount} câu hỏi từ {result.RequestedCount} yêu cầu",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi trộn câu hỏi ngẫu nhiên");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi trộn câu hỏi ngẫu nhiên",
                    Error = ex.Message
                });
            }
        }
    }
}