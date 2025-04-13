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
        /// 1. Trắc nghiệm một đáp án (QuestionType=1)
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
                    case 1: // Một đáp án
                        if (model.Options.Count(o => o.IsCorrect) != 1)
                        {
                            return BadRequest(new { message = "Câu hỏi trắc nghiệm một đáp án phải có duy nhất một đáp án đúng" });
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
                        break;
                    case 3: // Trả lời ngắn
                        if (!model.Options.Any(o => o.IsCorrect))
                        {
                            return BadRequest(new { message = "Câu hỏi trả lời ngắn phải có ít nhất một đáp án đúng" });
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
                string scoringConfig = model.ScoringConfig;
                string shortAnswerConfig = model.ShortAnswerConfig;

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
                        ExamQuestions = new List<ExamQuestion>() // Required field
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
                            GroupId = optionDTO.GroupId,
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
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo câu hỏi", error = ex.Message });
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
                                    option.IsPartOfTrueFalseGroup = optionDTO.IsPartOfTrueFalseGroup;
                                    option.GroupId = optionDTO.GroupId;
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
                                    IsPartOfTrueFalseGroup = optionDTO.IsPartOfTrueFalseGroup,
                                    GroupId = optionDTO.GroupId,
                                    Question = question
                                };

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
    }
}
