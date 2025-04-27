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
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TestController> _logger;

        public TestController(ApplicationDbContext context, ILogger<TestController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Tạo đề thi theo cấu trúc độ khó
        /// </summary>
        /// <remarks>
        /// API này cho phép tạo đề thi dựa trên cấu trúc độ khó, phân bổ câu hỏi theo tỷ lệ người dùng cung cấp
        /// </remarks>
        [HttpPost("structured")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateStructuredTest([FromBody] CreateStructuredTestDTO model)
        {
            try
            {
                _logger.LogInformation("Bắt đầu tạo đề thi theo cấu trúc");

                if (model == null)
                {
                    return BadRequest(new { Success = false, Message = "Dữ liệu không hợp lệ" });
                }

                // Validate dữ liệu đầu vào
                if (string.IsNullOrWhiteSpace(model.Title))
                {
                    return BadRequest(new { Success = false, Message = "Tiêu đề đề thi không được để trống" });
                }

                if (model.SubjectId <= 0)
                {
                    return BadRequest(new { Success = false, Message = "ID môn học không hợp lệ" });
                }

                if (model.ExamTypeId <= 0)
                {
                    return BadRequest(new { Success = false, Message = "ID loại đề thi không hợp lệ" });
                }

                if (model.Duration <= 0)
                {
                    return BadRequest(new { Success = false, Message = "Thời gian làm bài phải lớn hơn 0" });
                }

                if (model.TotalScore <= 0)
                {
                    return BadRequest(new { Success = false, Message = "Tổng điểm phải lớn hơn 0" });
                }

                if (model.Criteria == null || model.Criteria.Count == 0)
                {
                    return BadRequest(new { Success = false, Message = "Cần ít nhất một tiêu chí phân bổ câu hỏi" });
                }

                // Kiểm tra tiêu chí phân bổ
                var totalCount = model.Criteria.Sum(c => c.Count);
                var totalDifficulty = model.Criteria.Sum(c => c.Count * c.Score);

                if (totalDifficulty != model.TotalScore)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Tổng điểm từ các tiêu chí ({totalDifficulty}) không bằng tổng điểm đề thi ({model.TotalScore})"
                    });
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

                // Kiểm tra môn học tồn tại không
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy môn học với ID {model.SubjectId}" });
                }

                // Kiểm tra loại đề thi tồn tại không
                var examType = await _context.ExamTypes.FindAsync(model.ExamTypeId);
                if (examType == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy loại đề thi với ID {model.ExamTypeId}" });
                }

                // Bắt đầu transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Tạo đề thi
                    var exam = new Exam
                    {
                        Title = model.Title,
                        Description = model.Description ?? "",
                        SubjectId = model.SubjectId,
                        ExamTypeId = model.ExamTypeId,
                        CreatorId = userId,
                        Duration = model.Duration,
                        TotalScore = model.TotalScore,
                        PassScore = model.PassScore,
                        // IsPublic = model.IsPublic, // Removed as Exam doesn't have IsPublic
                        ShuffleQuestions = model.ShuffleQuestions,
                        ShowResult = model.ShowResult ?? true,
                        ShowAnswers = model.ShowAnswers ?? false,
                        AutoGradeShortAnswer = model.AutoGradeShortAnswer ?? true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Exams.Add(exam);
                    await _context.SaveChangesAsync();

                    var warnings = new List<string>();
                    var selectedQuestions = new List<Question>();

                    // Chọn câu hỏi theo từng tiêu chí
                    foreach (var criterion in model.Criteria)
                    {
                        // Tìm các câu hỏi thỏa mãn tiêu chí
                        var query = _context.Questions
                            .Where(q => q.SubjectId == model.SubjectId && q.IsActive);

                        // Lọc theo mức độ nếu có
                        if (criterion.LevelId > 0)
                        {
                            query = query.Where(q => q.QuestionLevelId == criterion.LevelId);
                        }

                        // Lọc theo loại câu hỏi nếu có
                        if (criterion.QuestionType > 0)
                        {
                            query = query.Where(q => q.QuestionType == criterion.QuestionType);
                        }

                        // Lọc theo chương nếu có
                        if (criterion.ChapterId > 0)
                        {
                            query = query.Where(q => q.ChapterId == criterion.ChapterId);
                        }

                        // Lọc theo chủ đề nếu có
                        if (!string.IsNullOrWhiteSpace(criterion.Topic))
                        {
                            query = query.Where(q => q.Tags.Contains(criterion.Topic));
                        }

                        // Loại bỏ câu hỏi đã được chọn trước đó
                        var existingIds = selectedQuestions.Select(sq => sq.Id).ToList();
                        if (existingIds.Any())
                        {
                            query = query.Where(q => !existingIds.Contains(q.Id));
                        }

                        // Lấy câu hỏi ngẫu nhiên theo số lượng yêu cầu
                        var availableQuestions = await query.ToListAsync();

                        // Xáo trộn danh sách câu hỏi
                        var random = new Random();
                        var shuffledQuestions = availableQuestions
                            .OrderBy(q => random.Next())
                            .Take(criterion.Count)
                            .ToList();

                        // Kiểm tra nếu không đủ câu hỏi theo yêu cầu
                        if (shuffledQuestions.Count < criterion.Count)
                        {
                            warnings.Add($"Chỉ tìm thấy {shuffledQuestions.Count}/{criterion.Count} câu hỏi phù hợp với tiêu chí: " +
                                $"Cấp độ {criterion.LevelId}, Loại {criterion.QuestionType}, Chủ đề {criterion.Topic ?? "không chỉ định"}");
                        }

                        // Thêm vào danh sách câu hỏi đã chọn
                        selectedQuestions.AddRange(shuffledQuestions);
                    }

                    // Thêm các câu hỏi vào đề thi
                    int orderIndex = 1;
                    foreach (var question in selectedQuestions)
                    {
                        // Tìm tiêu chí tương ứng với câu hỏi này
                        var criterion = model.Criteria.FirstOrDefault(c =>
                            (c.LevelId <= 0 || c.LevelId == question.QuestionLevelId) &&
                            (c.QuestionType <= 0 || c.QuestionType == question.QuestionType) &&
                            (c.ChapterId <= 0 || c.ChapterId == question.ChapterId) &&
                            (string.IsNullOrWhiteSpace(c.Topic) || question.Tags.Contains(c.Topic))
                        );

                        // Sử dụng điểm mặc định nếu không tìm thấy tiêu chí
                        decimal score = criterion?.Score ?? question.DefaultScore;

                        // Tạo ExamQuestion
                        var examQuestion = new ExamQuestion
                        {
                            ExamId = exam.Id,
                            QuestionId = question.Id,
                            Score = score,
                            OrderIndex = orderIndex++
                            // IsActive = true, // Removed as ExamQuestion doesn't have IsActive
                        };

                        _context.ExamQuestions.Add(examQuestion);
                    }

                    // Cập nhật lại tổng điểm thực tế
                    var actualTotalScore = selectedQuestions.Sum(q => {
                        var criterion = model.Criteria.FirstOrDefault(c =>
                            (c.LevelId <= 0 || c.LevelId == q.QuestionLevelId) &&
                            (c.QuestionType <= 0 || c.QuestionType == q.QuestionType) &&
                            (c.ChapterId <= 0 || c.ChapterId == q.ChapterId) &&
                            (string.IsNullOrWhiteSpace(c.Topic) || q.Tags.Contains(c.Topic))
                        );
                        return criterion?.Score ?? q.DefaultScore;
                    });

                    exam.TotalScore = actualTotalScore;

                    // Cập nhật đề thi
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Tạo kết quả trả về
                    var result = new
                    {
                        Success = true,
                        Message = "Tạo đề thi thành công",
                        Data = new
                        {
                            ExamId = exam.Id,
                            Title = exam.Title,
                            QuestionCount = selectedQuestions.Count,
                            TotalScore = exam.TotalScore,
                            SelectedQuestions = selectedQuestions.Select(q => new
                            {
                                Id = q.Id,
                                Content = q.Content,
                                QuestionType = q.QuestionType,
                                Level = q.Level?.Name,
                                Score = model.Criteria.FirstOrDefault(c =>
                                    (c.LevelId <= 0 || c.LevelId == q.QuestionLevelId) &&
                                    (c.QuestionType <= 0 || c.QuestionType == q.QuestionType) &&
                                    (c.ChapterId <= 0 || c.ChapterId == q.ChapterId) &&
                                    (string.IsNullOrWhiteSpace(c.Topic) || q.Tags.Contains(c.Topic))
                                )?.Score ?? q.DefaultScore
                            }).ToList(),
                            Warnings = warnings
                        }
                    };

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Lỗi khi tạo đề thi theo cấu trúc");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đề thi theo cấu trúc");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi tạo đề thi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy đề thi theo chủ đề
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy các đề thi theo chủ đề cụ thể
        /// </remarks>
        [HttpGet("topic/{topic}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTestsByTopic(string topic, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation($"Lấy đề thi theo chủ đề: {topic}");

                // Validate
                if (string.IsNullOrWhiteSpace(topic))
                {
                    return BadRequest(new { Success = false, Message = "Chủ đề không được để trống" });
                }

                // Chuẩn hóa page và pageSize
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;
                if (pageSize > 50) pageSize = 50;

                // Tìm tất cả các câu hỏi có tag chứa chủ đề
                var questionsWithTopic = await _context.Questions
                    .Where(q => q.Tags.Contains(topic))
                    .Select(q => q.Id)
                    .ToListAsync();

                // Tìm các đề thi có câu hỏi thuộc chủ đề này
                var query = _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.ExamType)
                    .Include(e => e.Creator)
                    .Include(e => e.ExamQuestions)
                    .Where(e => e.ExamQuestions.Any(eq => questionsWithTopic.Contains(eq.QuestionId)))
                    // .Where(e => e.IsPublic) // Removed as Exam doesn't have IsPublic
                    .OrderByDescending(e => e.CreatedAt)
                    .AsQueryable();

                // Đếm tổng số đề thi
                var totalCount = await query.CountAsync();

                // Phân trang
                var exams = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (!exams.Any())
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy đề thi nào với chủ đề '{topic}'" });
                }

                // Tính toán thông tin thêm
                var result = exams.Select(e => new
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    Subject = new { Id = e.Subject.Id, Name = e.Subject.Name, Code = e.Subject.Code },
                    ExamType = new { Id = e.ExamType.Id, Name = e.ExamType.Name },
                    Creator = new { Id = e.Creator.Id, Username = e.Creator.Username, FullName = e.Creator.FullName },
                    Duration = e.Duration,
                    TotalScore = e.TotalScore,
                    PassScore = e.PassScore,
                    QuestionCount = e.ExamQuestions.Count,
                    CreatedAt = e.CreatedAt,
                    TopicRelevance = e.ExamQuestions.Count(eq => questionsWithTopic.Contains(eq.QuestionId)) * 100.0 / e.ExamQuestions.Count
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
                _logger.LogError(ex, $"Lỗi khi lấy đề thi theo chủ đề: {topic}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy đề thi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Tạo đề ôn tập tùy chọn
        /// </summary>
        /// <remarks>
        /// API này cho phép tạo đề ôn tập theo các tùy chọn của người dùng
        /// </remarks>
        [HttpPost("practice")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreatePracticeTest([FromBody] CreatePracticeTestDTO model)
        {
            try
            {
                _logger.LogInformation("Bắt đầu tạo đề ôn tập tùy chọn");

                if (model == null)
                {
                    return BadRequest(new { Success = false, Message = "Dữ liệu không hợp lệ" });
                }

                // Validate dữ liệu đầu vào
                if (model.SubjectId <= 0)
                {
                    return BadRequest(new { Success = false, Message = "ID môn học không hợp lệ" });
                }

                if (model.QuestionCount <= 0 || model.QuestionCount > 100)
                {
                    return BadRequest(new { Success = false, Message = "Số lượng câu hỏi phải nằm trong khoảng 1-100" });
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

                // Kiểm tra môn học tồn tại không
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy môn học với ID {model.SubjectId}" });
                }

                // Xây dựng query câu hỏi dựa trên điều kiện lọc
                var query = _context.Questions
                    .Where(q => q.SubjectId == model.SubjectId && q.IsActive);

                // Lọc theo mức độ nếu có
                if (model.LevelId > 0)
                {
                    query = query.Where(q => q.QuestionLevelId == model.LevelId);
                }

                // Lọc theo loại câu hỏi
                if (model.QuestionTypes != null && model.QuestionTypes.Any())
                {
                    query = query.Where(q => model.QuestionTypes.Contains(q.QuestionType));
                }

                // Lọc theo chương
                if (model.ChapterIds != null && model.ChapterIds.Any())
                {
                    query = query.Where(q => model.ChapterIds.Contains((int)q.ChapterId));
                }

                // Lọc theo chủ đề
                if (!string.IsNullOrWhiteSpace(model.Topic))
                {
                    query = query.Where(q => q.Tags.Contains(model.Topic));
                }

                // Tìm những câu hỏi phù hợp
                var availableQuestions = await query.ToListAsync();

                // Kiểm tra nếu không có đủ câu hỏi
                if (!availableQuestions.Any())
                {
                    return NotFound(new { Success = false, Message = "Không tìm thấy câu hỏi phù hợp với tiêu chí đã chọn" });
                }

                if (availableQuestions.Count < model.QuestionCount)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Chỉ có {availableQuestions.Count} câu hỏi khả dụng, không đủ số lượng yêu cầu ({model.QuestionCount})"
                    });
                }

                // Chọn ngẫu nhiên câu hỏi
                var random = new Random();
                var selectedQuestions = availableQuestions
                    .OrderBy(q => random.Next())
                    .Take(model.QuestionCount)
                    .ToList();

                // Tạo đề ôn tập
                var practiceExam = new PracticeExam
                {
                    SubjectId = model.SubjectId,
                    UserId = userId,
                    QuestionCount = selectedQuestions.Count,
                    LevelId = model.LevelId > 0 ? model.LevelId : (int?)null, // Fix: Proper nullable conversion
                    Topic = model.Topic,
                    CreatedAt = DateTime.UtcNow,
                    Questions = string.Join(",", selectedQuestions.Select(q => q.Id)),
                    IsCompleted = false
                };

                _context.PracticeExams.Add(practiceExam);
                await _context.SaveChangesAsync();

                // Tính điểm tối đa
                decimal totalScore = selectedQuestions.Sum(q => q.DefaultScore);

                // Tạo kết quả trả về
                var result = new
                {
                    Success = true,
                    Message = "Tạo đề ôn tập thành công",
                    Data = new
                    {
                        PracticeId = practiceExam.Id,
                        Subject = new { Id = subject.Id, Name = subject.Name, Code = subject.Code },
                        QuestionCount = selectedQuestions.Count,
                        TotalScore = totalScore,
                        QuestionTypes = selectedQuestions.GroupBy(q => q.QuestionType)
                            .Select(g => new
                            {
                                Type = g.Key,
                                TypeName = GetQuestionTypeName(g.Key),
                                Count = g.Count()
                            }),
                        Questions = selectedQuestions.Select(q => new
                        {
                            Id = q.Id,
                            Content = q.Content,
                            QuestionType = q.QuestionType,
                            TypeName = GetQuestionTypeName(q.QuestionType),
                            Level = q.Level?.Name,
                            Score = q.DefaultScore
                        }).ToList()
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đề ôn tập tùy chọn");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi tạo đề ôn tập", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy lịch sử luyện đề ôn tập của người dùng
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy lịch sử luyện đề ôn tập của một người dùng cụ thể
        /// </remarks>
        [HttpGet("history/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPracticeHistory(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation($"Lấy lịch sử luyện đề ôn tập của người dùng: {userId}");

                // Lấy user id từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Kiểm tra quyền truy cập - chỉ được xem lịch sử của chính mình hoặc admin
                if (currentUserId != userId && !User.IsInRole("Admin"))
                {
                    return StatusCode(403, new { Success = false, Message = "Bạn không có quyền xem lịch sử của người dùng khác" });
                }

                // Chuẩn hóa page và pageSize
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;
                if (pageSize > 50) pageSize = 50;

                // Kiểm tra người dùng tồn tại
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy người dùng với ID {userId}" });
                }

                // Lấy lịch sử ôn tập
                var query = _context.PracticeExams
                    .Include(p => p.Subject)
                    .Include(p => p.Level)
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.CreatedAt);

                // Đếm tổng số bản ghi
                var totalCount = await query.CountAsync();

                // Phân trang
                var practices = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (!practices.Any())
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Không có lịch sử luyện đề ôn tập nào",
                        TotalCount = 0,
                        Page = page,
                        PageSize = pageSize,
                        TotalPages = 0,
                        Data = new List<object>()
                    });
                }

                // Tính tỷ lệ hoàn thành và các thống kê khác
                var results = new List<object>();

                foreach (var practice in practices)
                {
                    // Lấy danh sách ID câu hỏi
                    var questionIds = practice.Questions.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(id => int.Parse(id))
                        .ToList();

                    // Lấy thông tin bài làm nếu đã hoàn thành
                    PracticeResult practiceResult = null;
                    if (practice.IsCompleted)
                    {
                        practiceResult = await _context.PracticeResults
                            .FirstOrDefaultAsync(r => r.PracticeExamId == practice.Id);
                    }

                    results.Add(new
                    {
                        Id = practice.Id,
                        Subject = new { Id = practice.Subject.Id, Name = practice.Subject.Name, Code = practice.Subject.Code },
                        Level = practice.Level != null ? new { Id = practice.Level.Id, Name = practice.Level.Name } : null,
                        QuestionCount = practice.QuestionCount,
                        Topic = practice.Topic,
                        CreatedAt = practice.CreatedAt,
                        IsCompleted = practice.IsCompleted,
                        CompletionStats = practiceResult != null ? new
                        {
                            Score = practiceResult.Score,
                            MaxScore = practiceResult.MaxScore,
                            CorrectAnswers = practiceResult.CorrectAnswers,
                            CompletedAt = practiceResult.CompletedAt,
                            CompletionTime = practiceResult.CompletionTime,
                            PercentageScore = practiceResult.MaxScore > 0
                                ? Math.Round(practiceResult.Score * 100 / practiceResult.MaxScore, 2)
                                : 0
                        } : null
                    });
                }

                // Tạo kết quả trả về
                var result = new
                {
                    Success = true,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Data = results
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy lịch sử luyện đề ôn tập của người dùng: {userId}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy lịch sử luyện đề ôn tập", Error = ex.Message });
            }
        }

        #region Helper Methods

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

        #endregion
    }
}