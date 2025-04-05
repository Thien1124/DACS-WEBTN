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