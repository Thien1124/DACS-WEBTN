using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    [Route("api/analytics")]
    [ApiController]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(ApplicationDbContext context, ILogger<AnalyticsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Thống kê về đề thi: câu sai nhiều nhất, thời gian trung bình
        /// </summary>
        /// <param name="id">ID của đề thi</param>
        /// <returns>Thống kê về đề thi</returns>
        [HttpGet("test/{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetTestAnalytics(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thống kê cho đề thi ID: {id}");

                // Kiểm tra đề thi tồn tại
                var exam = await _context.Exams
                    .Include(e => e.Subject)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy đề thi ID: {id}");
                    return NotFound(new { Success = false, Message = "Không tìm thấy đề thi" });
                }

                // Lấy tất cả kết quả bài thi của đề thi này
                var examResults = await _context.ExamResults
                    .Where(er => er.ExamId == id && er.IsCompleted)
                    .Include(er => er.StudentAnswers)
                        .ThenInclude(sa => sa.Question)
                    .ToListAsync();

                if (!examResults.Any())
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Chưa có kết quả nào cho đề thi này",
                        Data = new
                        {
                            ExamInfo = new
                            {
                                Id = exam.Id,
                                Title = exam.Title,
                                SubjectName = exam.Subject?.Name,
                                TotalScore = exam.TotalScore,
                                PassScore = exam.PassScore
                            },
                            AttemptCount = 0,
                            AverageScore = 0.0,
                            AverageTime = 0,
                            PassRate = 0.0,
                            MostMissedQuestions = new List<object>(),
                            QuestionAnalytics = new List<object>(),
                            ScoreDistribution = new List<object>()
                        }
                    });
                }

                // Tính số lượt thi
                int attemptCount = examResults.Count;

                // Tính điểm trung bình
                double averageScore = examResults.Average(er => (double)er.Score);

                // Tính thời gian trung bình
                int averageTime = (int)examResults.Average(er => er.Duration);

                // Tính tỷ lệ đạt (điểm >= điểm đạt)
                double passRate = 0;
                if (exam.PassScore.HasValue)
                {
                    passRate = (double)examResults.Count(er => er.Score >= exam.PassScore.Value) * 100 / attemptCount;
                }

                // Phân tích câu trả lời
                var questionAnalytics = new Dictionary<int, QuestionAnalyticsDTO>();

                // Phân tích câu trả lời từ tất cả kết quả
                foreach (var result in examResults)
                {
                    if (result.StudentAnswers == null || !result.StudentAnswers.Any())
                        continue;

                    foreach (var answer in result.StudentAnswers)
                    {
                        if (answer.Question == null)
                            continue;

                        int questionId = answer.QuestionId;
                        bool isCorrect = answer.IsCorrect;

                        if (!questionAnalytics.ContainsKey(questionId))
                        {
                            questionAnalytics[questionId] = new QuestionAnalyticsDTO
                            {
                                QuestionId = questionId,
                                QuestionContent = answer.Question?.Content ?? "Câu hỏi không xác định",
                                AttemptCount = 0,
                                CorrectCount = 0,
                                IncorrectCount = 0,
                                AverageTimeSpent = 0,
                                CorrectRate = 0
                            };
                        }

                        questionAnalytics[questionId].AttemptCount++;

                        if (isCorrect)
                            questionAnalytics[questionId].CorrectCount++;
                        else
                            questionAnalytics[questionId].IncorrectCount++;

                        // Cập nhật thời gian trung bình nếu StudentAnswer có trường TimeSpent
                        if (answer.GetType().GetProperty("TimeSpent") != null)
                        {
                            var timeSpentProperty = answer.GetType().GetProperty("TimeSpent");
                            if (timeSpentProperty != null)
                            {
                                var timeSpent = (int)timeSpentProperty.GetValue(answer, null);
                                if (timeSpent > 0)
                                {
                                    var analytics = questionAnalytics[questionId];
                                    analytics.TotalTimeSpent += timeSpent;
                                    analytics.AverageTimeSpent = analytics.TotalTimeSpent / analytics.AttemptCount;
                                }
                            }
                        }
                    }
                }

                // Tính tỷ lệ đúng cho mỗi câu hỏi
                foreach (var analytics in questionAnalytics.Values)
                {
                    analytics.CorrectRate = analytics.AttemptCount > 0
                        ? (double)analytics.CorrectCount * 100 / analytics.AttemptCount
                        : 0;
                }

                // Lấy danh sách câu hỏi sai nhiều nhất
                var mostMissedQuestions = questionAnalytics.Values
                    .OrderByDescending(q => q.IncorrectCount)
                    .ThenByDescending(q => q.AttemptCount)
                    .Take(5)
                    .ToList();

                // Tính phân phối điểm (theo khoảng điểm)
                var scoreDistribution = new List<ScoreDistributionDTO>();

                // Chia thành 10 khoảng điểm
                decimal maxScore = exam.TotalScore;
                int segments = 10;
                decimal segmentSize = maxScore / segments;

                for (int i = 0; i < segments; i++)
                {
                    decimal minRange = i * segmentSize;
                    decimal maxRange = (i + 1) * segmentSize;

                    // Nếu là khoảng cuối cùng, bao gồm cả điểm tối đa
                    if (i == segments - 1)
                        maxRange = maxScore;

                    int count = examResults.Count(er => er.Score >= minRange && er.Score < maxRange);

                    scoreDistribution.Add(new ScoreDistributionDTO
                    {
                        Range = $"{minRange:F1} - {maxRange:F1}",
                        Count = count,
                        Percentage = attemptCount > 0 ? (double)count * 100 / attemptCount : 0
                    });
                }

                // Tạo response
                var response = new
                {
                    Success = true,
                    Data = new
                    {
                        ExamInfo = new
                        {
                            Id = exam.Id,
                            Title = exam.Title,
                            SubjectName = exam.Subject?.Name,
                            TotalScore = exam.TotalScore,
                            PassScore = exam.PassScore
                        },
                        AttemptCount = attemptCount,
                        AverageScore = Math.Round(averageScore, 2),
                        AverageTime = averageTime, // Giây
                        PassRate = Math.Round(passRate, 2),
                        MostMissedQuestions = mostMissedQuestions,
                        QuestionAnalytics = questionAnalytics.Values
                            .OrderBy(q => q.QuestionId)
                            .ToList(),
                        ScoreDistribution = scoreDistribution
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thống kê đề thi ID: {id}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy thống kê đề thi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Thống kê điểm trung bình theo môn cho một học sinh
        /// </summary>
        /// <param name="id">ID của học sinh</param>
        /// <returns>Thống kê điểm trung bình theo môn</returns>
        [HttpGet("student/{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetStudentAnalytics(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thống kê cho học sinh ID: {id}");

                // Kiểm tra học sinh tồn tại
                var student = await _context.Users.FindAsync(id);
                if (student == null)
                {
                    _logger.LogWarning($"Không tìm thấy học sinh ID: {id}");
                    return NotFound(new { Success = false, Message = "Không tìm thấy học sinh" });
                }

                // Kiểm tra vai trò người dùng (chỉ học sinh) - Điều chỉnh theo cấu trúc ứng dụng của bạn
                if (student.Role != "Student")
                {
                    return BadRequest(new { Success = false, Message = "Người dùng không phải là học sinh" });
                }

                // Lấy tất cả kết quả bài thi của học sinh này
                var examResults = await _context.ExamResults
                    .Where(er => er.StudentId == id && er.IsCompleted)
                    .Include(er => er.Exam)
                        .ThenInclude(e => e.Subject)
                    .ToListAsync();

                if (!examResults.Any())
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Học sinh này chưa tham gia bài thi nào",
                        Data = new
                        {
                            StudentInfo = new
                            {
                                Id = student.Id,
                                Username = student.Username,
                                FullName = student.FullName,
                                Email = student.Email
                            },
                            TotalExams = 0,
                            SubjectStats = new List<object>(),
                            RecentExams = new List<object>(),
                            ProgressOverTime = new List<object>()
                        }
                    });
                }

                // Thống kê theo môn học
                var subjectStats = examResults
                    .Where(er => er.Exam?.Subject != null)
                    .GroupBy(er => er.Exam.SubjectId)
                    .Select(group => new StudentSubjectStatsDTO
                    {
                        SubjectId = group.Key,
                        SubjectName = group.First().Exam.Subject.Name,
                        ExamCount = group.Count(),
                        AverageScore = Math.Round(group.Average(er => (double)er.Score), 2),
                        HighestScore = group.Max(er => er.Score),
                        LowestScore = group.Min(er => er.Score),
                        PassCount = group.Count(er =>
                            er.Exam.PassScore.HasValue ? er.Score >= er.Exam.PassScore.Value : er.IsPassed),
                        PassRate = Math.Round(group.Count(er =>
                            er.Exam.PassScore.HasValue ? er.Score >= er.Exam.PassScore.Value : er.IsPassed) * 100.0 / group.Count(), 2)
                    })
                    .ToList();

                // Lấy kết quả bài thi gần đây (10 bài mới nhất)
                var recentExams = examResults
                    .OrderByDescending(er => er.CompletedAt.HasValue ? er.CompletedAt.Value : DateTime.MinValue)
                    .Take(10)
                    .Select(er => new StudentRecentExamDTO
                    {
                        ExamId = er.ExamId,
                        ExamTitle = er.Exam.Title,
                        SubjectName = er.Exam.Subject?.Name,
                        Score = er.Score,
                        MaxScore = er.Exam.TotalScore,
                        PassScore = er.Exam.PassScore.HasValue ? er.Exam.PassScore.Value : 0, // Explicit conversion for nullable decimal
                        IsPassed = er.IsPassed, // Use the IsPassed field directly from the model
                        CompletedAt = er.CompletedAt.HasValue ? er.CompletedAt.Value : DateTime.MinValue,
                        CompletionTime = er.Duration
                    })
                    .ToList();

                // Theo dõi tiến độ theo thời gian
                var progressOverTime = examResults
                    .Where(er => er.CompletedAt.HasValue)
                    .OrderBy(er => er.CompletedAt)
                    .GroupBy(er => new {
                        Year = er.CompletedAt.Value.Year,
                        Month = er.CompletedAt.Value.Month
                    })
                    .Select(group => new
                    {
                        Period = string.Format("{0}-{1:D2}", group.Key.Year, group.Key.Month),
                        ExamCount = group.Count(),
                        AverageScore = Math.Round(group.Average(er => (double)er.Score), 2),
                        PassRate = group.Count(er => er.IsPassed) * 100.0 / group.Count()
                    })
                    .ToList();

                // Tạo response
                var response = new
                {
                    Success = true,
                    Data = new
                    {
                        StudentInfo = new
                        {
                            Id = student.Id,
                            Username = student.Username,
                            FullName = student.FullName,
                            Email = student.Email
                        },
                        TotalExams = examResults.Count,
                        AverageScore = Math.Round(examResults.Average(er => (double)er.Score), 2),
                        PassRate = Math.Round(examResults.Count(er => er.IsPassed) * 100.0 / examResults.Count, 2),
                        SubjectStats = subjectStats,
                        RecentExams = recentExams,
                        ProgressOverTime = progressOverTime
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thống kê học sinh ID: {id}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy thống kê học sinh", Error = ex.Message });
            }
        }

        /// <summary>
        /// Xếp hạng học sinh theo môn học
        /// </summary>
        /// <param name="subjectId">ID môn học cần xếp hạng</param>
        /// <param name="limit">Số lượng học sinh tối đa trong bảng xếp hạng</param>
        /// <returns>Bảng xếp hạng học sinh theo môn học</returns>
        [HttpGet("rank")]
        [Authorize(Roles = "Admin,Teacher,Student")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetStudentRanking([FromQuery] int subjectId, [FromQuery] int limit = 20)
        {
            try
            {
                _logger.LogInformation($"Lấy bảng xếp hạng học sinh cho môn học ID: {subjectId}");

                if (subjectId <= 0)
                {
                    return BadRequest(new { Success = false, Message = "ID môn học không hợp lệ" });
                }

                // Kiểm tra môn học tồn tại
                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null)
                {
                    _logger.LogWarning($"Không tìm thấy môn học ID: {subjectId}");
                    return BadRequest(new { Success = false, Message = "Không tìm thấy môn học" });
                }

                // Lấy tất cả học sinh có vai trò Student
                var studentIds = await _context.Users
                    .Where(u => u.Role == "Student")
                    .Select(u => u.Id)
                    .ToListAsync();

                if (!studentIds.Any())
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Không có học sinh nào trong hệ thống",
                        Data = new
                        {
                            Subject = new { Id = subject.Id, Name = subject.Name, Code = subject.Code },
                            Rankings = new List<object>()
                        }
                    });
                }

                // Lấy điểm trung bình của học sinh theo môn học
                var studentScores = await _context.ExamResults
                    .Where(er => studentIds.Contains(er.StudentId) && er.IsCompleted)
                    .Join(_context.Exams,
                        er => er.ExamId,
                        e => e.Id,
                        (er, e) => new { er.StudentId, er.Score, Subject = e.Subject, SubjectId = e.SubjectId, MaxScore = e.TotalScore })
                    .Where(x => x.SubjectId == subjectId)
                    .GroupBy(x => x.StudentId)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        ExamCount = g.Count(),
                        AverageScore = g.Average(x => (double)x.Score),
                        AveragePercentage = g.Average(x => x.MaxScore > 0 ? (double)x.Score * 100 / (double)x.MaxScore : 0),
                        HighestScore = g.Max(x => (double)x.Score),
                        LatestActivity = g.Max(x => x.Subject.UpdatedAt ?? DateTime.MinValue)
                    })
                    .ToListAsync();

                if (!studentScores.Any())
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = $"Không có kết quả thi nào cho môn học {subject.Name}",
                        Data = new
                        {
                            Subject = new { Id = subject.Id, Name = subject.Name, Code = subject.Code },
                            Rankings = new List<object>()
                        }
                    });
                }

                // Kết hợp với thông tin học sinh
                var userDictionary = await _context.Users
                    .Where(u => studentIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => new { u.Username, u.FullName, u.AvatarUrl });

                // Tạo bảng xếp hạng
                var rankings = studentScores
                    .Select(score => new StudentRankingDTO
                    {
                        UserId = score.UserId,
                        Username = userDictionary.ContainsKey(score.UserId) ? userDictionary[score.UserId].Username : "Unknown",
                        FullName = userDictionary.ContainsKey(score.UserId) ? userDictionary[score.UserId].FullName : "Unknown",
                        AvatarUrl = userDictionary.ContainsKey(score.UserId) ? userDictionary[score.UserId].AvatarUrl : null,
                        ExamCount = score.ExamCount,
                        AverageScore = Math.Round(score.AverageScore, 2),
                        AveragePercentage = Math.Round(score.AveragePercentage, 2),
                        HighestScore = Math.Round(score.HighestScore, 2),
                        Rank = 0 // Sẽ được gán sau
                    })
                    .OrderByDescending(r => r.AveragePercentage)
                    .ThenByDescending(r => r.ExamCount)
                    .ToList();

                // Gán thứ hạng
                int rank = 1;
                double lastScore = -1;
                int sameRankCount = 0;

                foreach (var student in rankings)
                {
                    if (Math.Abs(student.AveragePercentage - lastScore) > 0.01) // Nếu điểm khác với điểm trước đó
                    {
                        rank += sameRankCount;
                        sameRankCount = 1;
                        lastScore = student.AveragePercentage;
                    }
                    else
                    {
                        sameRankCount++;
                    }

                    student.Rank = rank;
                }

                // Giới hạn số lượng kết quả trả về
                var limitedRankings = rankings.Take(limit).ToList();

                // Lấy ID người dùng hiện tại
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    // Kiểm tra học sinh đăng nhập có trong bảng xếp hạng không
                    var currentStudentRanking = rankings.FirstOrDefault(r => r.UserId == currentUserId);

                    if (currentStudentRanking != null && !limitedRankings.Any(r => r.UserId == currentUserId))
                    {
                        // Nếu không nằm trong top, thêm vào cuối danh sách
                        limitedRankings.Add(currentStudentRanking);
                    }
                }

                // Tạo response
                var response = new
                {
                    Success = true,
                    Data = new
                    {
                        Subject = new { Id = subject.Id, Name = subject.Name, Code = subject.Code },
                        TotalStudents = rankings.Count,
                        Rankings = limitedRankings
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy bảng xếp hạng cho môn học ID: {subjectId}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy bảng xếp hạng học sinh", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy dữ liệu cho biểu đồ điểm và thời gian thi
        /// </summary>
        /// <param name="subjectId">ID môn học (tùy chọn)</param>
        /// <param name="period">Khoảng thời gian (week, month, year)</param>
        /// <returns>Dữ liệu biểu đồ</returns>
        [HttpGet("chart-data")]
        [Authorize(Roles = "Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetChartData([FromQuery] int? subjectId, [FromQuery] string period = "month")
        {
            try
            {
                _logger.LogInformation($"Lấy dữ liệu biểu đồ: SubjectId={subjectId}, Period={period}");

                // Xác định khoảng thời gian
                DateTime startDate;
                string chartPeriod;

                switch (period.ToLower())
                {
                    case "week":
                        startDate = DateTime.UtcNow.AddDays(-7);
                        chartPeriod = "Tuần";
                        break;
                    case "year":
                        startDate = DateTime.UtcNow.AddYears(-1);
                        chartPeriod = "Năm";
                        break;
                    case "month":
                    default:
                        startDate = DateTime.UtcNow.AddMonths(-1);
                        chartPeriod = "Tháng";
                        break;
                }

                // Xây dựng query ban đầu
                var query = _context.ExamResults
                    .Where(er => er.IsCompleted && er.CompletedAt >= startDate);

                // Lọc theo môn học nếu có
                if (subjectId.HasValue && subjectId.Value > 0)
                {
                    query = query
                        .Join(_context.Exams,
                            er => er.ExamId,
                            e => e.Id,
                            (er, e) => new { er, e })
                        .Where(x => x.e.SubjectId == subjectId.Value)
                        .Select(x => x.er);
                }

                // Lấy kết quả bài thi trong khoảng thời gian
                var examResults = await query.ToListAsync();

                if (!examResults.Any())
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Không có dữ liệu trong khoảng thời gian đã chọn",
                        Data = new
                        {
                            Period = chartPeriod,
                            ScoreChartData = new List<object>(),
                            TimeChartData = new List<object>(),
                            AttemptChartData = new List<object>()
                        }
                    });
                }

                // Dữ liệu biểu đồ điểm số - Nhóm theo ngày
                var scoreChartData = examResults
                    .Where(er => er.CompletedAt.HasValue)
                    .GroupBy(er => er.CompletedAt.Value.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        AverageScore = Math.Round(g.Average(er => (double)er.Score), 2),
                        Count = g.Count()
                    })
                    .ToList();

                // Dữ liệu biểu đồ thời gian làm bài
                var timeChartData = examResults
                    .Where(er => er.CompletedAt.HasValue)
                    .GroupBy(er => er.CompletedAt.Value.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        AverageTime = Math.Round(g.Average(er => er.Duration) / 60.0, 2), // Chuyển về phút
                        Count = g.Count()
                    })
                    .ToList();

                // Dữ liệu biểu đồ số lượt thi
                var attemptChartData = examResults
                    .Where(er => er.CompletedAt.HasValue)
                    .GroupBy(er => er.CompletedAt.Value.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        AttemptCount = g.Count()
                    })
                    .ToList();

                // Thống kê chung
                var overallStats = new
                {
                    TotalAttempts = examResults.Count,
                    AverageScore = Math.Round(examResults.Average(er => (double)er.Score), 2),
                    AverageTime = Math.Round(examResults.Average(er => er.Duration) / 60.0, 2), // Phút
                    PassCount = examResults.Count(er => er.IsCompleted && er.IsPassed),
                    PassRate = Math.Round(examResults.Count(er => er.IsCompleted && er.IsPassed) * 100.0 / examResults.Count, 2)
                };

                // Lấy tên môn học nếu có
                string subjectName = null;
                if (subjectId.HasValue && subjectId.Value > 0)
                {
                    var subject = await _context.Subjects.FindAsync(subjectId.Value);
                    if (subject != null)
                    {
                        subjectName = subject.Name;
                    }
                }

                // Tạo response
                var response = new
                {
                    Success = true,
                    Data = new
                    {
                        Period = chartPeriod,
                        SubjectId = subjectId,
                        SubjectName = subjectName,
                        OverallStats = overallStats,
                        ScoreChartData = scoreChartData,
                        TimeChartData = timeChartData,
                        AttemptChartData = attemptChartData
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu biểu đồ");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy dữ liệu biểu đồ", Error = ex.Message });
            }
        }
    }
}