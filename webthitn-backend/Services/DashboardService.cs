using Microsoft.EntityFrameworkCore;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(ApplicationDbContext context, ILogger<DashboardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ✅ CHỈ GIỮ LẠI METHOD NÀY
        public async Task<DashboardResponseDTO> GetStudentDashboardAsync(int userId)
        {
            try
            {
                _logger.LogInformation($"Getting dashboard data for student ID: {userId}");

                // Lấy thống kê của học sinh
                var stats = await GetStudentStatsAsync(userId);
                
                // Lấy bài thi gần đây
                var recentExams = await GetRecentExamsAsync(userId);
                
                // Lấy bài thi đã hoàn thành
                var completedExams = await GetCompletedExamsAsync(userId);
                
                // Lấy hoạt động gần đây
                var activities = await GetRecentActivitiesAsync(userId);
                
                // Lấy sự kiện
                var events = await GetUpcomingEventsAsync();

                return new DashboardResponseDTO
                {
                    Stats = stats,
                    RecentExams = recentExams,
                    CompletedExams = completedExams,
                    Activities = activities,
                    Events = events
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting student dashboard: {ex.Message}");
                throw;
            }
        }

        #region Private Methods for Student Dashboard

        private async Task<UserStatsDTO> GetStudentStatsAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var lastMonth = now.AddMonths(-1);

            // Lấy kết quả thi của học sinh
            var examResults = await _context.ExamResults
                .Where(er => er.StudentId == userId && er.IsCompleted)
                .Include(er => er.Exam)
                    .ThenInclude(e => e.Subject)
                .ToListAsync();

            var currentMonthResults = examResults.Where(er => er.CompletedAt >= lastMonth).ToList();
            var previousMonthResults = examResults.Where(er => er.CompletedAt < lastMonth && er.CompletedAt >= lastMonth.AddMonths(-1)).ToList();

            // Tính toán thống kê
            var testsCompleted = currentMonthResults.Count;
            var testsCompletedChange = CalculatePercentageChange(testsCompleted, previousMonthResults.Count);

            var averageScore = currentMonthResults.Any() ? currentMonthResults.Average(er => er.PercentageScore) : 0;
            var previousAverageScore = previousMonthResults.Any() ? previousMonthResults.Average(er => er.PercentageScore) : 0;
            var averageScoreChange = CalculatePercentageChange((double)averageScore, (double)previousAverageScore);

            // Tính thời gian học tập (dựa trên thời gian làm bài)
            var studyTime = currentMonthResults.Sum(er => er.Duration);
            var previousStudyTime = previousMonthResults.Sum(er => er.Duration);
            var studyTimeChange = CalculatePercentageChange(studyTime, previousStudyTime);

            // Tìm môn học mạnh nhất
            var subjectStats = examResults
                .Where(er => er.Exam?.Subject?.Name != null)
                .GroupBy(er => er.Exam.Subject.Name)
                .Select(g => new { Subject = g.Key, AvgScore = g.Average(er => er.PercentageScore) })
                .OrderByDescending(s => s.AvgScore)
                .FirstOrDefault();

            var strengths = subjectStats?.Subject ?? "Chưa có dữ liệu";

            // Tổng số câu hỏi và câu trả lời đúng
            var studentAnswers = await _context.StudentAnswers
                .Where(sa => sa.ExamResult.StudentId == userId)
                .ToListAsync();

            return new UserStatsDTO
            {
                TestsCompleted = testsCompleted,
                TestsCompletedChange = testsCompletedChange,
                AverageScore = averageScore,
                AverageScoreChange = averageScoreChange,
                StudyTime = studyTime,
                StudyTimeChange = studyTimeChange,
                Strengths = strengths,
                TotalQuestions = studentAnswers.Count,
                CorrectAnswers = studentAnswers.Count(sa => sa.IsCorrect)
            };
        }

        private async Task<List<RecentExamDTO>> GetRecentExamsAsync(int userId)
        {
            // ✅ SỬA: Tách query và mapping
            var recentExamsData = await _context.OfficialExamStudents
                .Where(oes => oes.StudentId == userId && !oes.HasTaken)
                .Include(oes => oes.OfficialExam)
                    .ThenInclude(oe => oe.Exam)
                        .ThenInclude(e => e.Subject)
                .Include(oes => oes.OfficialExam)
                    .ThenInclude(oe => oe.Exam)
                        .ThenInclude(e => e.ExamQuestions)
                .Where(oes => oes.OfficialExam.IsActive)
                .OrderByDescending(oes => oes.OfficialExam.StartTime ?? oes.OfficialExam.CreatedAt)
                .Take(5)
                .Select(oes => new
                {
                    Id = oes.OfficialExam.ExamId,
                    Title = oes.OfficialExam.Title ?? oes.OfficialExam.Exam.Title,
                    Subject = oes.OfficialExam.Exam.Subject.Name,
                    Duration = oes.OfficialExam.Exam.Duration, // ✅ Lấy raw data
                    Questions = oes.OfficialExam.Exam.ExamQuestions.Count,
                    StartedAt = oes.OfficialExam.CreatedAt
                })
                .ToListAsync();

            // ✅ SỬA: Map sau khi query xong
            return recentExamsData.Select(data => new RecentExamDTO
            {
                Id = data.Id,
                Title = data.Title,
                Subject = data.Subject,
                Duration = FormatDuration(data.Duration), // ✅ Gọi method sau khi query
                Progress = 0,
                Questions = data.Questions,
                Completed = 0,
                IsCompleted = false,
                StartedAt = data.StartedAt
            }).ToList();
        }

        private async Task<List<CompletedExamDTO>> GetCompletedExamsAsync(int userId)
        {
            return await _context.OfficialExamStudents
                .Where(oes => oes.StudentId == userId && oes.HasTaken && oes.ExamResult != null)
                .Include(oes => oes.ExamResult)
                .Include(oes => oes.OfficialExam)
                    .ThenInclude(oe => oe.Exam)
                        .ThenInclude(e => e.Subject)
                .OrderByDescending(oes => oes.ExamResult.CompletedAt)
                .Take(10)
                .Select(oes => new CompletedExamDTO
                {
                    Id = oes.ExamResult.Id,
                    Title = oes.OfficialExam.Title ?? oes.OfficialExam.Exam.Title,
                    Subject = oes.OfficialExam.Exam.Subject.Name,
                    Score = oes.ExamResult.Score,
                    TotalScore = oes.OfficialExam.Exam.TotalScore,
                    PercentageScore = oes.ExamResult.PercentageScore,
                    IsPassed = oes.ExamResult.IsPassed,
                    CompletedAt = oes.ExamResult.CompletedAt ?? DateTime.UtcNow,
                    Status = oes.ExamResult.IsPassed ? "Đạt" : "Không đạt"
                })
                .ToListAsync();
        }

        private async Task<List<ActivityDTO>> GetRecentActivitiesAsync(int userId)
        {
            // ✅ SỬA: Tách query và mapping
            var recentResultsData = await _context.OfficialExamStudents
                .Where(oes => oes.StudentId == userId && oes.HasTaken && oes.ExamResult != null)
                .Include(oes => oes.ExamResult)
                .Include(oes => oes.OfficialExam)
                    .ThenInclude(oe => oe.Exam)
                        .ThenInclude(e => e.Subject)
                .OrderByDescending(oes => oes.ExamResult.CompletedAt)
                .Take(5)
                .Select(oes => new
                {
                    Id = oes.ExamResult.Id,
                    Title = oes.OfficialExam.Title ?? oes.OfficialExam.Exam.Title,
                    CompletedAt = oes.ExamResult.CompletedAt ?? DateTime.UtcNow,
                    IsPassed = oes.ExamResult.IsPassed,
                    Score = oes.ExamResult.Score,
                    TotalScore = oes.OfficialExam.Exam.TotalScore,
                    PercentageScore = oes.ExamResult.PercentageScore
                })
                .ToListAsync();

            // ✅ SỬA: Map sau khi query xong
            return recentResultsData.Select(data => new ActivityDTO
            {
                Id = data.Id,
                Title = $"Hoàn thành bài thi: {data.Title}",
                Time = FormatRelativeTime(data.CompletedAt), // ✅ Gọi method sau khi query
                Type = "test",
                Color = data.IsPassed ? "40, 167, 69" : "220, 53, 69",
                Description = $"Điểm: {data.Score}/{data.TotalScore} ({data.PercentageScore:F1}%)"
            }).OrderByDescending(a => a.Id).ToList();
        }

        private async Task<List<EventDTO>> GetUpcomingEventsAsync()
        {
            var now = DateTime.UtcNow;
            
            // ✅ SỬA: Query đơn giản hơn
            return await _context.OfficialExams
                .Where(oe => oe.IsActive && oe.StartTime > now)
                .OrderBy(oe => oe.StartTime)
                .Take(5)
                .Select(oe => new EventDTO
                {
                    Id = oe.Id,
                    Title = oe.Title,
                    Description = oe.Description ?? "",
                    StartDate = oe.StartTime ?? DateTime.UtcNow,
                    EndDate = oe.EndTime,
                    Type = "official_exam",
                    IsImportant = true
                })
                .ToListAsync();
        }

        #endregion

        #region Helper Methods - ✅ THÊM STATIC để tránh memory leak

        private static double CalculatePercentageChange(double current, double previous)
        {
            if (previous == 0) return current > 0 ? 100 : 0;
            return Math.Round(((current - previous) / previous) * 100, 2);
        }

        private static double CalculatePercentageChange(int current, int previous)
        {
            if (previous == 0) return current > 0 ? 100 : 0;
            return Math.Round(((double)(current - previous) / previous) * 100, 2);
        }

        private static string FormatDuration(int minutes)
        {
            if (minutes < 60)
                return $"{minutes} phút";
            
            int hours = minutes / 60;
            int remainingMinutes = minutes % 60;
            
            if (remainingMinutes == 0)
                return $"{hours} giờ";
            
            return $"{hours}h {remainingMinutes}m";
        }

        private static string FormatRelativeTime(DateTime dateTime)
        {
            var now = DateTime.UtcNow;
            var timeSpan = now - dateTime;
            
            if (timeSpan.TotalMinutes < 1)
                return "Vừa xong";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} phút trước";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} giờ trước";
            if (timeSpan.TotalDays < 30)
                return $"{(int)timeSpan.TotalDays} ngày trước";
            
            return dateTime.ToString("dd/MM/yyyy");
        }

        #endregion
    }
}