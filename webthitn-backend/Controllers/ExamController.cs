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

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// API để quản lý và truy xuất thông tin bài thi
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ExamController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExamController> _logger;

        /// <summary>
        /// Khởi tạo controller với các dependency
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="logger">Logger service</param>
        public ExamController(ApplicationDbContext context, ILogger<ExamController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách bài thi với các bộ lọc và phân trang
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy danh sách bài thi với nhiều tùy chọn lọc khác nhau.
        /// Có thể lọc theo môn học, loại bài thi, trạng thái, từ khóa và phân trang kết quả.
        /// 
        /// Sample request:
        ///
        ///     GET /api/Exam?SubjectId=1&amp;ExamTypeId=3&amp;Page=1&amp;PageSize=10&amp;ActiveOnly=true&amp;IsOpen=true
        ///
        /// </remarks>
        /// <param name="filter">Các tham số lọc</param>
        /// <returns>Danh sách bài thi được phân trang và lọc</returns>
        /// <response code="200">Trả về danh sách bài thi</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetExams([FromQuery] ExamFilterDTO filter)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách bài thi với filter: SubjectId={filter.SubjectId}, " +
                    $"ExamTypeId={filter.ExamTypeId}, Page={filter.Page}, PageSize={filter.PageSize}, " +
                    $"ActiveOnly={filter.ActiveOnly}, IsOpen={filter.IsOpen}");

                var query = _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.Creator)
                    .Include(e => e.ExamType)
                    .AsQueryable();

                // Lọc theo môn học nếu có
                if (filter.SubjectId.HasValue && filter.SubjectId.Value > 0)
                {
                    query = query.Where(e => e.SubjectId == filter.SubjectId.Value);
                }

                // Lọc theo loại bài thi nếu có
                // Sửa: Kiểm tra ExamTypeId > 0 trực tiếp thay vì dùng HasValue và Value
                if (filter.ExamTypeId > 0)
                {
                    query = query.Where(e => e.ExamTypeId == filter.ExamTypeId);
                }

                // Lọc theo trạng thái active
                if (filter.ActiveOnly)
                {
                    query = query.Where(e => e.IsActive);
                }

                // Lọc theo trạng thái mở/đóng
                if (filter.IsOpen.HasValue)
                {
                    var now = DateTime.UtcNow;
                    if (filter.IsOpen.Value)
                    {
                        // Bài thi đang mở: đã đến thời gian bắt đầu và chưa hết thời gian kết thúc
                        query = query.Where(e =>
                            (e.StartTime == null || e.StartTime <= now) &&
                            (e.EndTime == null || e.EndTime >= now));
                    }
                    else
                    {
                        // Bài thi đã đóng: chưa đến thời gian bắt đầu hoặc đã hết thời gian kết thúc
                        query = query.Where(e =>
                            (e.StartTime != null && e.StartTime > now) ||
                            (e.EndTime != null && e.EndTime < now));
                    }
                }

                // Lọc theo từ khóa tìm kiếm
                if (!string.IsNullOrEmpty(filter.SearchTerm))
                {
                    var searchTerm = filter.SearchTerm.Trim().ToLower();
                    query = query.Where(e =>
                        e.Title.ToLower().Contains(searchTerm) ||
                        (e.Description != null && e.Description.ToLower().Contains(searchTerm)));
                }

                // Đếm tổng số bản ghi
                var totalCount = await query.CountAsync();

                // Phân trang và sắp xếp
                var exams = await query
                    .OrderByDescending(e => e.CreatedAt)
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                var examDTOs = exams.Select(e => {
                    // Đếm số lượng câu hỏi cho mỗi loại
                    var questionTypeStats = GetQuestionTypeStatistics(e.Id);

                    return new ExamListDTO
                    {
                        Id = e.Id,
                        Title = e.Title,
                        Type = e.ExamType.Name,
                        Description = e.Description,
                        Duration = e.Duration,
                        QuestionCount = _context.ExamQuestions.Count(eq => eq.ExamId == e.Id),
                        TotalScore = e.TotalScore,
                        PassScore = e.PassScore,
                        MaxAttempts = e.MaxAttempts,
                        StartTime = e.StartTime,
                        EndTime = e.EndTime,
                        Status = GetExamStatus(e),
                        IsActive = e.IsActive,
                        ShowResult = e.ShowResult,
                        ShowAnswers = e.ShowAnswers,
                        ShuffleQuestions = e.ShuffleQuestions,
                        ShuffleOptions = e.ShuffleOptions,
                        AutoGradeShortAnswer = e.AutoGradeShortAnswer,
                        AllowPartialGrading = e.AllowPartialGrading,
                        CreatedAt = e.CreatedAt,
                        Subject = e.Subject != null ? new SubjectBasicDTO
                        {
                            Id = e.Subject.Id,
                            Name = e.Subject.Name,
                            Code = e.Subject.Code
                        } : null,
                        Creator = e.Creator != null ? new UserBasicDTO
                        {
                            Id = e.Creator.Id,
                            Username = e.Creator.Username,
                            FullName = e.Creator.FullName
                        } : null,
                        QuestionTypeCounts = questionTypeStats
                    };
                }).ToList();

                // Trả về kết quả với thông tin phân trang
                return Ok(new
                {
                    totalCount,
                    page = filter.Page,
                    pageSize = filter.PageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize),
                    data = examDTOs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách bài thi: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách bài thi" });
            }
        }

        /// <summary>
        /// Lấy danh sách bài thi theo môn học
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy danh sách bài thi thuộc một môn học cụ thể.
        /// 
        /// Sample request:
        ///
        ///     GET /api/Exam/BySubject/1?Page=1&amp;PageSize=10&amp;ActiveOnly=true&amp;IsOpen=true
        ///
        /// </remarks>
        /// <param name="subjectId">ID của môn học</param>
        /// <param name="examTypeId">ID của loại bài thi (không bắt buộc)</param>
        /// <param name="page">Trang hiện tại (mặc định: 1)</param>
        /// <param name="pageSize">Số lượng mỗi trang (mặc định: 10)</param>
        /// <param name="activeOnly">Chỉ lấy bài thi đang hoạt động (mặc định: true)</param>
        /// <param name="isOpen">Lọc theo trạng thái mở/đóng (null: tất cả)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm</param>
        /// <returns>Danh sách bài thi thuộc môn học</returns>
        /// <response code="200">Trả về danh sách bài thi</response>
        /// <response code="404">Không tìm thấy môn học</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpGet("BySubject/{subjectId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetExamsBySubject(
            int subjectId,
            [FromQuery] int? examTypeId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool activeOnly = true,
            [FromQuery] bool? isOpen = null,
            [FromQuery] string searchTerm = null)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách bài thi theo môn học ID: {subjectId}");

                // Kiểm tra môn học tồn tại
                var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == subjectId);
                if (!subjectExists)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {subjectId}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Tạo bộ lọc
                var filter = new ExamFilterDTO
                {
                    SubjectId = subjectId,
                    // Gán giá trị examTypeId nếu có, nếu không thì gán giá trị mặc định (0)
                    ExamTypeId = examTypeId ?? 0,
                    Page = page,
                    PageSize = pageSize,
                    ActiveOnly = activeOnly,
                    IsOpen = isOpen,
                    SearchTerm = searchTerm
                };

                // Gọi lại phương thức GetExams với bộ lọc
                return await GetExams(filter);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách bài thi theo môn học (ID: {subjectId}): {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách bài thi" });
            }
        }

        /// <summary>
        /// Lấy danh sách bài thi cho học sinh
        /// </summary>
        /// <remarks>
        /// API này cho phép học sinh xem danh sách bài thi đang mở của một môn học.
        /// Chỉ hiển thị bài thi đang hoạt động và trong thời gian mở.
        /// 
        /// Sample request:
        ///
        ///     GET /api/Exam/ForStudents/1
        ///
        /// </remarks>
        /// <param name="subjectId">ID của môn học</param>
        /// <param name="page">Trang hiện tại (mặc định: 1)</param>
        /// <param name="pageSize">Số lượng mỗi trang (mặc định: 10)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm</param>
        /// <returns>Danh sách bài thi đang mở cho học sinh</returns>
        /// <response code="200">Trả về danh sách bài thi</response>
        /// <response code="404">Không tìm thấy môn học</response>
        /// <response code="500">Lỗi máy chủ</response>
        [Authorize(Roles = "Student,Teacher,Admin")]
        [HttpGet("ForStudents/{subjectId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetExamsForStudents(
            int subjectId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string searchTerm = null)
        {
            try
            {
                _logger.LogInformation($"Lấy danh sách bài thi cho học sinh, môn học ID: {subjectId}");

                // Kiểm tra môn học tồn tại
                var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == subjectId);
                if (!subjectExists)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {subjectId}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Tạo bộ lọc với tham số cố định cho học sinh
                // - Chỉ lấy bài thi đang hoạt động
                // - Chỉ lấy bài thi đang mở (trong thời gian làm bài)
                var filter = new ExamFilterDTO
                {
                    SubjectId = subjectId,
                    // Sử dụng giá trị mặc định 0 cho ExamTypeId (tất cả loại bài thi)
                    ExamTypeId = 0,
                    Page = page,
                    PageSize = pageSize,
                    ActiveOnly = true,
                    IsOpen = true,
                    SearchTerm = searchTerm
                };

                // Gọi lại phương thức GetExams với bộ lọc
                return await GetExams(filter);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách bài thi cho học sinh, môn học (ID: {subjectId}): {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách bài thi" });
            }
        }

        /// <summary>
        /// Thêm bài thi mới vào hệ thống
        /// </summary>
        /// <remarks>
        /// API này cho phép giáo viên hoặc admin tạo một bài thi mới.
        /// 
        /// Sample request:
        ///
        ///     POST /api/Exam
        ///     {
        ///         "title": "Kiểm tra cuối kỳ Toán 12",
        ///         "description": "Bài kiểm tra kiến thức cuối kỳ Toán 12",
        ///         "subjectId": 1,
        ///         "examTypeId": 2,
        ///         "duration": 90,
        ///         "totalScore": 10,
        ///         "passScore": 5,
        ///         "maxAttempts": 1,
        ///         "startTime": "2025-04-20T08:00:00Z",
        ///         "endTime": "2025-04-30T23:59:59Z",
        ///         "isActive": true,
        ///         "showResult": true,
        ///         "showAnswers": false,
        ///         "shuffleQuestions": true,
        ///         "shuffleOptions": true,
        ///         "autoGradeShortAnswer": true,
        ///         "allowPartialGrading": true,
        ///         "accessCode": "math12final",
        ///         "scoringConfig": "{\"gradingMethod\":\"sum\",\"partialCreditMethod\":\"proportional\",\"penaltyForWrongAnswer\":0}",
        ///         "questions": [
        ///             {
        ///                 "questionId": 42,
        ///                 "order": 1,
        ///                 "score": 1
        ///             },
        ///             {
        ///                 "questionId": 56,
        ///                 "order": 2,
        ///                 "score": 2
        ///             }
        ///         ]
        ///     }
        ///
        /// </remarks>
        /// <param name="model">Thông tin bài thi cần tạo</param>
        /// <returns>Thông tin bài thi đã tạo</returns>
        /// <response code="201">Trả về thông tin bài thi đã tạo</response>
        /// <response code="400">Dữ liệu đầu vào không hợp lệ</response>
        /// <response code="404">Không tìm thấy môn học hoặc loại bài thi</response>
        /// <response code="500">Lỗi máy chủ</response>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateExam([FromBody] CreateExamDTO model)
        {
            try
            {
                _logger.LogInformation($"Tạo bài thi mới: {model.Title}, Môn học ID: {model.SubjectId}");

                // Validate dữ liệu đầu vào
                if (string.IsNullOrEmpty(model.Title))
                {
                    return BadRequest(new { message = "Tiêu đề bài thi không được để trống" });
                }

                if (model.Duration <= 0)
                {
                    return BadRequest(new { message = "Thời gian làm bài phải lớn hơn 0" });
                }

                if (model.TotalScore <= 0)
                {
                    return BadRequest(new { message = "Điểm tối đa phải lớn hơn 0" });
                }

                // Kiểm tra môn học tồn tại
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {model.SubjectId}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Kiểm tra loại bài thi tồn tại
                var examType = await _context.ExamTypes.FindAsync(model.ExamTypeId);
                if (examType == null)
                {
                    _logger.LogWarning($"Không tìm thấy loại bài thi ID: {model.ExamTypeId}");
                    return NotFound(new { message = "Không tìm thấy loại bài thi" });
                }

                // Kiểm tra danh sách câu hỏi
                if (model.Questions == null || !model.Questions.Any())
                {
                    return BadRequest(new { message = "Bài thi phải có ít nhất một câu hỏi" });
                }

                // Kiểm tra các câu hỏi tồn tại - CÁCH MỚI
                var questionIds = model.Questions.Select(q => q.QuestionId).Distinct().ToList();
                bool allQuestionsExist = true;
                List<int> missingQuestionIds = new List<int>();

                foreach (var questionId in questionIds)
                {
                    var exists = await _context.Questions.AnyAsync(q => q.Id == questionId);
                    if (!exists)
                    {
                        allQuestionsExist = false;
                        missingQuestionIds.Add(questionId);
                    }
                }

                if (!allQuestionsExist)
                {
                    _logger.LogWarning($"Không tìm thấy các câu hỏi với ID: {string.Join(", ", missingQuestionIds)}");
                    return BadRequest(new { message = $"Không tìm thấy các câu hỏi với ID: {string.Join(", ", missingQuestionIds)}" });
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
                    currentUserId = 2; // Fallback to Thien1124's ID
                    _logger.LogInformation($"Sử dụng ID mặc định: {currentUserId}");
                }

                // Xử lý ScoringConfig
                string scoringConfig = model.ScoringConfig;
                if (model.ScoringConfig == "string" || string.IsNullOrEmpty(model.ScoringConfig))
                {
                    // Tạo cấu hình mặc định
                    scoringConfig = "{\"gradingMethod\":\"sum\",\"partialCreditMethod\":\"proportional\",\"penaltyForWrongAnswer\":0}";
                }

                // Tạo đối tượng Exam mới
                var exam = new Exam
                {
                    Title = model.Title.Trim(),
                    Description = model.Description?.Trim() ?? "",
                    SubjectId = model.SubjectId,
                    ExamTypeId = model.ExamTypeId,
                    Duration = model.Duration,
                    TotalScore = model.TotalScore,
                    PassScore = model.PassScore,
                    MaxAttempts = model.MaxAttempts,
                    StartTime = model.StartTime,
                    EndTime = model.EndTime,
                    IsActive = model.IsActive,
                    ShowResult = model.ShowResult,
                    ShowAnswers = model.ShowAnswers,
                    ShuffleQuestions = model.ShuffleQuestions,
                    ShuffleOptions = model.ShuffleOptions,
                    AutoGradeShortAnswer = model.AutoGradeShortAnswer,
                    AllowPartialGrading = model.AllowPartialGrading,
                    AccessCode = model.AccessCode?.Trim(),
                    CreatorId = currentUserId,
                    CreatedAt = DateTime.UtcNow,
                    ScoringConfig = scoringConfig
                };

                // Bắt đầu transaction để đảm bảo tất cả dữ liệu được lưu nhất quán
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Lưu bài thi
                    _context.Exams.Add(exam);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã lưu bài thi, ID: {exam.Id}");

                    // Lưu danh sách câu hỏi trong bài thi
                    foreach (var questionDTO in model.Questions)
                    {
                        var examQuestion = new ExamQuestion
                        {
                            ExamId = exam.Id,
                            QuestionId = questionDTO.QuestionId,
                            OrderIndex = questionDTO.Order,
                            Score = questionDTO.Score
                        };

                        _context.ExamQuestions.Add(examQuestion);
                    }

                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã lưu {model.Questions.Count} câu hỏi trong bài thi");

                    await transaction.CommitAsync();
                    _logger.LogInformation($"Đã commit transaction");

                    // Tải lại bài thi để lấy thông tin chi tiết
                    var freshExam = await _context.Exams
                        .Include(e => e.Subject)
                        .Include(e => e.ExamType)
                        .FirstOrDefaultAsync(e => e.Id == exam.Id);

                    // Lấy thông tin chi tiết bài thi để trả về
                    var questionTypeStats = GetQuestionTypeStatistics(exam.Id);

                    var examDTO = new ExamListDTO
                    {
                        Id = exam.Id,
                        Title = exam.Title,
                        Type = freshExam.ExamType.Name,
                        Description = exam.Description,
                        Duration = exam.Duration,
                        QuestionCount = model.Questions.Count,
                        TotalScore = exam.TotalScore,
                        PassScore = exam.PassScore,
                        MaxAttempts = exam.MaxAttempts,
                        StartTime = exam.StartTime,
                        EndTime = exam.EndTime,
                        Status = GetExamStatus(exam),
                        IsActive = exam.IsActive,
                        ShowResult = exam.ShowResult,
                        ShowAnswers = exam.ShowAnswers,
                        ShuffleQuestions = exam.ShuffleQuestions,
                        ShuffleOptions = exam.ShuffleOptions,
                        AutoGradeShortAnswer = exam.AutoGradeShortAnswer,
                        AllowPartialGrading = exam.AllowPartialGrading,
                        CreatedAt = exam.CreatedAt,
                        Subject = new SubjectBasicDTO
                        {
                            Id = freshExam.Subject.Id,
                            Name = freshExam.Subject.Name,
                            Code = freshExam.Subject.Code
                        },
                        Creator = new UserBasicDTO
                        {
                            Id = currentUserId,
                            Username = User.Identity.Name ?? "unknown",
                            FullName = User.FindFirst("FullName")?.Value ?? User.Identity.Name ?? "Unknown User"
                        },
                        QuestionTypeCounts = questionTypeStats
                    };

                    // Trả về kết quả với status code 201 Created
                    return CreatedAtAction(nameof(GetExam), new { id = exam.Id }, examDTO);
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
                _logger.LogError($"Lỗi khi tạo bài thi: {ex.Message}, Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo bài thi", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết của một bài thi
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy thông tin chi tiết của một bài thi cụ thể theo ID.
        /// 
        /// Sample request:
        ///
        ///     GET /api/Exam/5
        ///
        /// </remarks>
        /// <param name="id">ID của bài thi</param>
        /// <returns>Thông tin chi tiết của bài thi</returns>
        /// <response code="200">Trả về thông tin chi tiết bài thi</response>
        /// <response code="404">Không tìm thấy bài thi</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetExam(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin chi tiết bài thi ID: {id}");

                var exam = await _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.Creator)
                    .Include(e => e.ExamType)
                    .Include(e => e.ExamQuestions)
                        .ThenInclude(eq => eq.Question)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy bài thi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy bài thi" });
                }

                var questionTypeStats = GetQuestionTypeStatistics(id);

                var examDTO = new ExamListDTO
                {
                    Id = exam.Id,
                    Title = exam.Title,
                    Type = exam.ExamType.Name,
                    Description = exam.Description,
                    Duration = exam.Duration,
                    QuestionCount = exam.ExamQuestions.Count,
                    TotalScore = exam.TotalScore,
                    PassScore = exam.PassScore,
                    MaxAttempts = exam.MaxAttempts,
                    StartTime = exam.StartTime,
                    EndTime = exam.EndTime,
                    Status = GetExamStatus(exam),
                    IsActive = exam.IsActive,
                    ShowResult = exam.ShowResult,
                    ShowAnswers = exam.ShowAnswers,
                    ShuffleQuestions = exam.ShuffleQuestions,
                    ShuffleOptions = exam.ShuffleOptions,
                    AutoGradeShortAnswer = exam.AutoGradeShortAnswer,
                    AllowPartialGrading = exam.AllowPartialGrading,
                    CreatedAt = exam.CreatedAt,
                    Subject = new SubjectBasicDTO
                    {
                        Id = exam.Subject.Id,
                        Name = exam.Subject.Name,
                        Code = exam.Subject.Code
                    },
                    Creator = exam.Creator != null ? new UserBasicDTO
                    {
                        Id = exam.Creator.Id,
                        Username = exam.Creator.Username,
                        FullName = exam.Creator.FullName
                    } : null,
                    QuestionTypeCounts = questionTypeStats
                };

                return Ok(examDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy thông tin chi tiết bài thi (ID: {id}): {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin bài thi" });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết của một bài thi kèm danh sách câu hỏi đầy đủ
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy thông tin chi tiết của một bài thi cụ thể theo ID cùng với danh sách câu hỏi đầy đủ.
        /// 
        /// Sample request:
        ///
        ///     GET /api/Exam/WithQuestions/5
        ///
        /// </remarks>
        /// <param name="id">ID của bài thi</param>
        /// <returns>Thông tin chi tiết của bài thi và danh sách câu hỏi</returns>
        /// <response code="200">Trả về thông tin chi tiết bài thi và câu hỏi</response>
        /// <response code="404">Không tìm thấy bài thi</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpGet("WithQuestions/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetExamWithQuestions(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin chi tiết bài thi kèm câu hỏi, ID: {id}");

                // Lấy thông tin bài thi kèm theo các thông tin liên quan
                var exam = await _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.Creator)
                    .Include(e => e.ExamType)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy bài thi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy bài thi" });
                }

                // Lấy danh sách câu hỏi trong bài thi theo thứ tự
                var examQuestions = await _context.ExamQuestions
                    .Where(eq => eq.ExamId == id)
                    .OrderBy(eq => eq.OrderIndex)
                    .Select(eq => new
                    {
                        ExamQuestionId = eq.Id,
                        QuestionId = eq.QuestionId,
                        OrderIndex = eq.OrderIndex,
                        Score = eq.Score,
                        Question = eq.Question
                    })
                    .ToListAsync();

                // Tạo danh sách đầy đủ câu hỏi với thông tin chi tiết
                var questionDetailDTOs = new List<ExamQuestionDetailDTO>(); // Thay đổi kiểu dữ liệu

                // Xác định người dùng hiện tại có quyền xem đáp án không
                bool canViewCorrectAnswers = User.IsInRole("Teacher") || User.IsInRole("Admin");
                bool showAnswers = canViewCorrectAnswers ||
                                 (exam.ShowAnswers && exam.EndTime.HasValue && DateTime.UtcNow > exam.EndTime.Value);

                foreach (var eq in examQuestions)
                {
                    if (eq.Question == null)
                        continue;

                    // Lấy các tùy chọn cho câu hỏi
                    var options = await _context.QuestionOptions
                        .Where(o => o.QuestionId == eq.QuestionId)
                        .OrderBy(o => o.OrderIndex)
                        .Select(o => new QuestionOptionDTO
                        {
                            Id = o.Id,
                            Content = o.Content,
                            IsCorrect = showAnswers ? o.IsCorrect : false, // Chỉ hiển thị đáp án khi được phép
                            OrderIndex = o.OrderIndex
                        })
                        .ToListAsync();

                    var questionDetail = new ExamQuestionDetailDTO // Thay đổi kiểu dữ liệu
                    {
                        Id = eq.QuestionId,
                        ExamQuestionId = eq.ExamQuestionId,
                        Content = eq.Question.Content,
                        QuestionType = eq.Question.QuestionType,
                        Explanation = showAnswers ? eq.Question.Explanation : null, // Chỉ hiển thị giải thích khi được phép
                        OrderIndex = eq.OrderIndex,
                        Score = eq.Score,
                        Options = options
                    };

                    questionDetailDTOs.Add(questionDetail);
                }

                // Áp dụng trộn câu hỏi nếu cần
                if (exam.ShuffleQuestions)
                {
                    Random rng = new Random(Guid.NewGuid().GetHashCode());
                    questionDetailDTOs = questionDetailDTOs.OrderBy(q => rng.Next()).ToList();

                    // Cập nhật lại thứ tự hiển thị
                    for (int i = 0; i < questionDetailDTOs.Count; i++)
                    {
                        questionDetailDTOs[i].OrderIndex = i + 1;
                    }
                }

                // Trộn các lựa chọn cho từng câu hỏi nếu cần
                if (exam.ShuffleOptions)
                {
                    Random rng = new Random(Guid.NewGuid().GetHashCode());
                    foreach (var question in questionDetailDTOs.Where(q => q.QuestionType == 1)) // Chỉ trộn lựa chọn cho câu hỏi trắc nghiệm
                    {
                        question.Options = question.Options.OrderBy(o => rng.Next()).ToList();

                        // Cập nhật lại thứ tự hiển thị
                        for (int i = 0; i < question.Options.Count; i++) // Đảm bảo Count là thuộc tính
                        {
                            question.Options[i].OrderIndex = i + 1;
                        }
                    }
                }

                var questionTypeStats = GetQuestionTypeStatistics(id);

                // Tạo DTO cho bài thi với danh sách câu hỏi chi tiết
                var examWithQuestionsDTO = new ExamDetailDTO
                {
                    Id = exam.Id,
                    Title = exam.Title,
                    Type = exam.ExamType.Name,
                    Description = exam.Description,
                    Duration = exam.Duration,
                    QuestionCount = examQuestions.Count,
                    TotalScore = exam.TotalScore,
                    PassScore = exam.PassScore,
                    MaxAttempts = exam.MaxAttempts,
                    StartTime = exam.StartTime,
                    EndTime = exam.EndTime,
                    Status = GetExamStatus(exam),
                    IsActive = exam.IsActive,
                    ShowResult = exam.ShowResult,
                    ShowAnswers = exam.ShowAnswers,
                    ShuffleQuestions = exam.ShuffleQuestions,
                    ShuffleOptions = exam.ShuffleOptions,
                    AutoGradeShortAnswer = exam.AutoGradeShortAnswer,
                    AllowPartialGrading = exam.AllowPartialGrading,
                    ScoringConfig = exam.ScoringConfig,
                    CreatedAt = exam.CreatedAt,
                    Subject = new SubjectBasicDTO
                    {
                        Id = exam.Subject.Id,
                        Name = exam.Subject.Name,
                        Code = exam.Subject.Code
                    },
                    Creator = exam.Creator != null ? new UserBasicDTO
                    {
                        Id = exam.Creator.Id,
                        Username = exam.Creator.Username,
                        FullName = exam.Creator.FullName
                    } : null,
                    QuestionTypeCounts = questionTypeStats,
                    Questions = questionDetailDTOs
                };

                return Ok(examWithQuestionsDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy chi tiết bài thi kèm câu hỏi (ID: {id}): {ex.Message}, Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin chi tiết bài thi" });
            }
        }
        /// <summary>
        /// Cập nhật thông tin đề thi
        /// </summary>
        /// <remarks>
        /// API này cho phép giáo viên hoặc admin cập nhật thông tin của một đề thi đã tồn tại.
        /// 
        /// Sample request:
        ///
        ///     PUT /api/Exam/5
        ///     {
        ///         "title": "Kiểm tra cuối kỳ Toán 12 (Đã cập nhật)",
        ///         "description": "Bài kiểm tra kiến thức cuối kỳ Toán 12 - Phiên bản mới",
        ///         "subjectId": 1,
        ///         "examTypeId": 2,
        ///         "duration": 90,
        ///         "totalScore": 10,
        ///         "passScore": 6,
        ///         "maxAttempts": 2,
        ///         "startTime": "2025-04-20T08:00:00Z",
        ///         "endTime": "2025-04-30T23:59:59Z",
        ///         "isActive": true,
        ///         "showResult": true,
        ///         "showAnswers": false,
        ///         "shuffleQuestions": true,
        ///         "shuffleOptions": true,
        ///         "autoGradeShortAnswer": true,
        ///         "allowPartialGrading": true,
        ///         "accessCode": "math12final",
        ///         "scoringConfig": "{\"gradingMethod\":\"sum\",\"partialCreditMethod\":\"proportional\",\"penaltyForWrongAnswer\":0}",
        ///         "questions": [
        ///             {
        ///                 "questionId": 42,
        ///                 "order": 1,
        ///                 "score": 1.5
        ///             },
        ///             {
        ///                 "questionId": 56,
        ///                 "order": 2,
        ///                 "score": 2.5
        ///             }
        ///         ]
        ///     }
        ///
        /// </remarks>
        /// <param name="id">ID của đề thi cần cập nhật</param>
        /// <param name="model">Thông tin cập nhật đề thi</param>
        /// <returns>Thông tin đề thi sau khi cập nhật</returns>
        /// <response code="200">Trả về thông tin đề thi đã cập nhật thành công</response>
        /// <response code="400">Dữ liệu đầu vào không hợp lệ</response>
        /// <response code="403">Không có quyền cập nhật đề thi này</response>
        /// <response code="404">Không tìm thấy đề thi, môn học hoặc loại đề thi</response>
        /// <response code="500">Lỗi máy chủ</response>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateExam(int id, [FromBody] CreateExamDTO model)
        {
            try
            {
                _logger.LogInformation($"Cập nhật đề thi ID: {id}, Tiêu đề mới: {model.Title}");

                // Validate dữ liệu đầu vào
                if (string.IsNullOrEmpty(model.Title))
                {
                    return BadRequest(new { message = "Tiêu đề đề thi không được để trống" });
                }

                if (model.Duration <= 0)
                {
                    return BadRequest(new { message = "Thời gian làm bài phải lớn hơn 0" });
                }

                if (model.TotalScore <= 0)
                {
                    return BadRequest(new { message = "Điểm tối đa phải lớn hơn 0" });
                }

                // Kiểm tra đề thi tồn tại
                var existingExam = await _context.Exams
                    .Include(e => e.Creator)
                    .Include(e => e.ExamQuestions)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (existingExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy đề thi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy đề thi" });
                }

                // Kiểm tra quyền - chỉ Admin hoặc người tạo ra đề thi mới có thể sửa
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

                // Kiểm tra quyền cập nhật - Admin hoặc người tạo
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = existingExam.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền cập nhật đề thi ID: {id}");
                    return StatusCode(403, new { message = "Bạn không có quyền cập nhật đề thi này" });
                }

                // Kiểm tra môn học tồn tại
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {model.SubjectId}");
                    return NotFound(new { message = "Không tìm thấy môn học" });
                }

                // Kiểm tra loại đề thi tồn tại
                var examType = await _context.ExamTypes.FindAsync(model.ExamTypeId);
                if (examType == null)
                {
                    _logger.LogWarning($"Không tìm thấy loại đề thi ID: {model.ExamTypeId}");
                    return NotFound(new { message = "Không tìm thấy loại đề thi" });
                }

                // Kiểm tra danh sách câu hỏi
                if (model.Questions == null || !model.Questions.Any())
                {
                    return BadRequest(new { message = "Đề thi phải có ít nhất một câu hỏi" });
                }

                // Kiểm tra các câu hỏi tồn tại
                var questionIds = model.Questions.Select(q => q.QuestionId).Distinct().ToList();
                bool allQuestionsExist = true;
                List<int> missingQuestionIds = new List<int>();

                foreach (var questionId in questionIds)
                {
                    var exists = await _context.Questions.AnyAsync(q => q.Id == questionId);
                    if (!exists)
                    {
                        allQuestionsExist = false;
                        missingQuestionIds.Add(questionId);
                    }
                }

                if (!allQuestionsExist)
                {
                    _logger.LogWarning($"Không tìm thấy các câu hỏi với ID: {string.Join(", ", missingQuestionIds)}");
                    return BadRequest(new { message = $"Không tìm thấy các câu hỏi với ID: {string.Join(", ", missingQuestionIds)}" });
                }

                // Xử lý ScoringConfig
                string scoringConfig = model.ScoringConfig;
                if (model.ScoringConfig == "string" || string.IsNullOrEmpty(model.ScoringConfig))
                {
                    // Giữ nguyên cấu hình cũ nếu không có cập nhật
                    scoringConfig = existingExam.ScoringConfig;
                }

                // Bắt đầu transaction để đảm bảo tất cả dữ liệu được lưu nhất quán
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Cập nhật thông tin đề thi
                    existingExam.Title = model.Title.Trim();
                    existingExam.Description = model.Description?.Trim() ?? "";
                    existingExam.SubjectId = model.SubjectId;
                    existingExam.ExamTypeId = model.ExamTypeId;
                    existingExam.Duration = model.Duration;
                    existingExam.TotalScore = model.TotalScore;
                    existingExam.PassScore = model.PassScore;
                    existingExam.MaxAttempts = model.MaxAttempts;
                    existingExam.StartTime = model.StartTime;
                    existingExam.EndTime = model.EndTime;
                    existingExam.IsActive = model.IsActive;
                    existingExam.ShowResult = model.ShowResult;
                    existingExam.ShowAnswers = model.ShowAnswers;
                    existingExam.ShuffleQuestions = model.ShuffleQuestions;
                    existingExam.ShuffleOptions = model.ShuffleOptions;
                    existingExam.AutoGradeShortAnswer = model.AutoGradeShortAnswer;
                    existingExam.AllowPartialGrading = model.AllowPartialGrading;
                    existingExam.AccessCode = model.AccessCode?.Trim();
                    existingExam.ScoringConfig = scoringConfig;

                    // Cập nhật thời gian sửa đổi
                    existingExam.UpdatedAt = DateTime.UtcNow;

                    // Cập nhật đề thi trong database
                    _context.Exams.Update(existingExam);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã cập nhật thông tin đề thi ID: {id}");

                    // Xóa danh sách câu hỏi cũ
                    var oldExamQuestions = await _context.ExamQuestions
                        .Where(eq => eq.ExamId == id)
                        .ToListAsync();

                    _context.ExamQuestions.RemoveRange(oldExamQuestions);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã xóa {oldExamQuestions.Count} câu hỏi cũ của đề thi ID: {id}");

                    // Thêm danh sách câu hỏi mới
                    foreach (var questionDTO in model.Questions)
                    {
                        var examQuestion = new ExamQuestion
                        {
                            ExamId = id,
                            QuestionId = questionDTO.QuestionId,
                            OrderIndex = questionDTO.Order,
                            Score = questionDTO.Score
                        };

                        _context.ExamQuestions.Add(examQuestion);
                    }

                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã thêm {model.Questions.Count} câu hỏi mới vào đề thi ID: {id}");

                    await transaction.CommitAsync();
                    _logger.LogInformation($"Đã commit transaction cập nhật đề thi ID: {id}");

                    // Tải lại đề thi để lấy thông tin chi tiết
                    var freshExam = await _context.Exams
                        .Include(e => e.Subject)
                        .Include(e => e.ExamType)
                        .Include(e => e.Creator)
                        .FirstOrDefaultAsync(e => e.Id == id);

                    // Lấy thống kê câu hỏi theo loại
                    var questionTypeStats = GetQuestionTypeStatistics(id);

                    // Tạo đối tượng DTO để trả về
                    var examDTO = new ExamListDTO
                    {
                        Id = freshExam.Id,
                        Title = freshExam.Title,
                        Type = freshExam.ExamType.Name,
                        Description = freshExam.Description,
                        Duration = freshExam.Duration,
                        QuestionCount = model.Questions.Count,
                        TotalScore = freshExam.TotalScore,
                        PassScore = freshExam.PassScore,
                        MaxAttempts = freshExam.MaxAttempts,
                        StartTime = freshExam.StartTime,
                        EndTime = freshExam.EndTime,
                        Status = GetExamStatus(freshExam),
                        IsActive = freshExam.IsActive,
                        ShowResult = freshExam.ShowResult,
                        ShowAnswers = freshExam.ShowAnswers,
                        ShuffleQuestions = freshExam.ShuffleQuestions,
                        ShuffleOptions = freshExam.ShuffleOptions,
                        AutoGradeShortAnswer = freshExam.AutoGradeShortAnswer,
                        AllowPartialGrading = freshExam.AllowPartialGrading,
                        CreatedAt = freshExam.CreatedAt,
                        Subject = new SubjectBasicDTO
                        {
                            Id = freshExam.Subject.Id,
                            Name = freshExam.Subject.Name,
                            Code = freshExam.Subject.Code
                        },
                        Creator = freshExam.Creator != null ? new UserBasicDTO
                        {
                            Id = freshExam.Creator.Id,
                            Username = freshExam.Creator.Username,
                            FullName = freshExam.Creator.FullName
                        } : null,
                        QuestionTypeCounts = questionTypeStats
                    };

                    return Ok(examDTO);
                }
                catch (Exception ex)
                {
                    // Nếu có lỗi, rollback transaction
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi khi cập nhật đề thi ID: {id}, Lỗi: {ex.Message}, Stack trace: {ex.StackTrace}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật đề thi ID: {id}, Lỗi: {ex.Message}, Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật đề thi", error = ex.Message });
            }
        }
        // Thêm API endpoint thay thế để hỗ trợ đường dẫn /api/Exam/:id/WithQuestions
        [HttpGet("{id}/WithQuestions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetExamWithQuestionsAlternative(int id)
        {
            return await GetExamWithQuestions(id);
        }

        /// <summary>
        /// Xóa một đề thi khỏi hệ thống
        /// </summary>
        /// <remarks>
        /// API này cho phép giáo viên hoặc admin xóa một đề thi đã tồn tại.
        /// Lưu ý: Đề thi sẽ bị xóa vĩnh viễn cùng với tất cả các câu hỏi liên quan.
        /// 
        /// Sample request:
        ///
        ///     DELETE /api/Exam/5
        ///
        /// </remarks>
        /// <param name="id">ID của đề thi cần xóa</param>
        /// <returns>Thông báo kết quả xóa đề thi</returns>
        /// <response code="200">Đề thi đã được xóa thành công</response>
        /// <response code="403">Không có quyền xóa đề thi này</response>
        /// <response code="404">Không tìm thấy đề thi</response>
        /// <response code="500">Lỗi máy chủ</response>
        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteExam(int id)
        {
            try
            {
                _logger.LogInformation($"Yêu cầu xóa đề thi ID: {id}");

                // Kiểm tra đề thi tồn tại
                var exam = await _context.Exams
                    .Include(e => e.Creator)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy đề thi ID: {id}");
                    return NotFound(new { message = "Không tìm thấy đề thi" });
                }

                // Kiểm tra quyền - chỉ Admin hoặc người tạo ra đề thi mới có thể xóa
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

                // Kiểm tra quyền xóa - Admin hoặc người tạo
                bool isAdmin = User.IsInRole("Admin");
                bool isCreator = exam.CreatorId == currentUserId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning($"Người dùng {currentUserId} không có quyền xóa đề thi ID: {id}");
                    return StatusCode(403, new { message = "Bạn không có quyền xóa đề thi này" });
                }

                // Kiểm tra xem đề thi đã được sử dụng chưa (đã có bài làm hay chưa)
                bool hasResults = await _context.ExamResults
                    .AnyAsync(er => er.ExamId == id);

                if (hasResults && !isAdmin)
                {
                    _logger.LogWarning($"Đề thi ID: {id} đã có kết quả bài làm, không thể xóa bởi giáo viên");
                    return StatusCode(403, new
                    {
                        message = "Đề thi này đã có kết quả bài làm và chỉ có thể được xóa bởi admin. Vui lòng liên hệ quản trị viên nếu bạn muốn xóa."
                    });
                }

                // Bắt đầu transaction để đảm bảo tất cả dữ liệu được xóa nhất quán
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // 1. Xóa các câu trả lời của học sinh liên quan đến đề thi này
                    if (hasResults)
                    {
                        // Lấy danh sách kết quả bài thi
                        var examResults = await _context.ExamResults
                            .Where(er => er.ExamId == id)
                            .ToListAsync();

                        var examResultIds = examResults.Select(er => er.Id).ToList();

                        // Xóa tất cả câu trả lời của học sinh
                        var studentAnswers = await _context.StudentAnswers
                            .Where(sa => examResultIds.Contains(sa.ExamResultId))
                            .ToListAsync();

                        _context.StudentAnswers.RemoveRange(studentAnswers);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation($"Đã xóa {studentAnswers.Count} câu trả lời của học sinh cho đề thi ID: {id}");

                        // Xóa các kết quả bài thi
                        _context.ExamResults.RemoveRange(examResults);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation($"Đã xóa {examResults.Count} kết quả bài thi cho đề thi ID: {id}");
                    }

                    // 2. Xóa các câu hỏi trong đề thi
                    var examQuestions = await _context.ExamQuestions
                        .Where(eq => eq.ExamId == id)
                        .ToListAsync();

                    _context.ExamQuestions.RemoveRange(examQuestions);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã xóa {examQuestions.Count} câu hỏi trong đề thi ID: {id}");

                    // 3. Cuối cùng xóa đề thi
                    _context.Exams.Remove(exam);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã xóa đề thi ID: {id}");

                    // Commit transaction
                    await transaction.CommitAsync();
                    _logger.LogInformation($"Hoàn thành xóa đề thi ID: {id}");

                    return Ok(new
                    {
                        message = "Đề thi đã được xóa thành công",
                        examId = id,
                        title = exam.Title
                    });
                }
                catch (Exception ex)
                {
                    // Nếu có lỗi, rollback transaction
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi khi xóa đề thi ID: {id}, Lỗi: {ex.Message}, Stack trace: {ex.StackTrace}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa đề thi ID: {id}, Lỗi: {ex.Message}, Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa đề thi", error = ex.Message });
            }
        }
        // Phương thức helper để xác định trạng thái bài thi
        private string GetExamStatus(Exam exam)
        {
            if (!exam.IsActive)
                return "Không hoạt động";

            var now = DateTime.UtcNow;

            if (exam.StartTime.HasValue && now < exam.StartTime.Value)
                return "Chưa mở";

            if (exam.EndTime.HasValue && now > exam.EndTime.Value)
                return "Đã đóng";

            return "Đang mở";
        }

        // Phương thức helper để đếm số lượng câu hỏi theo loại
        private QuestionTypeCountDTO GetQuestionTypeStatistics(int examId)
        {
            var stats = new QuestionTypeCountDTO();

            var examQuestions = _context.ExamQuestions
                .Include(eq => eq.Question)
                .Where(eq => eq.ExamId == examId)
                .ToList();

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
                    case 5: // Đúng-sai nhiều ý
                        stats.TrueFalseCount++;
                        break;
                }
            }

            return stats;
        }
    }
}