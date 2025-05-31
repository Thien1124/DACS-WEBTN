using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cho dữ liệu Dashboard của học sinh
    /// </summary>
    public class DashboardResponseDTO
    {
        public required UserStatsDTO Stats { get; set; }
        public required List<RecentExamDTO> RecentExams { get; set; }
        public required List<CompletedExamDTO> CompletedExams { get; set; }
        public required List<ActivityDTO> Activities { get; set; }
        public required List<EventDTO> Events { get; set; }
    }

    /// <summary>
    /// Thống kê tổng quan của người dùng
    /// </summary>
    public class UserStatsDTO
    {
        public int TestsCompleted { get; set; }
        public double TestsCompletedChange { get; set; }
        public decimal AverageScore { get; set; }
        public double AverageScoreChange { get; set; }
        public int StudyTime { get; set; } // Tính bằng phút
        public double StudyTimeChange { get; set; }
        public string Strengths { get; set; } = string.Empty;
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
    }

    /// <summary>
    /// Bài thi gần đây
    /// </summary>
    public class RecentExamDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public int Progress { get; set; } // 0-100%
        public int Questions { get; set; }
        public int Completed { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? StartedAt { get; set; }
    }

    /// <summary>
    /// Bài thi đã hoàn thành
    /// </summary>
    public class CompletedExamDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public decimal TotalScore { get; set; }
        public decimal PercentageScore { get; set; }
        public bool IsPassed { get; set; }
        public DateTime CompletedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>
    /// Hoạt động của người dùng
    /// </summary>
    public class ActivityDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // 'test', 'achievement', 'course', 'streak'
        public string Color { get; set; } = string.Empty; // RGB format
        public string Description { get; set; } = string.Empty;
    }

    /// <summary>
    /// Sự kiện hệ thống
    /// </summary>
    public class EventDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Type { get; set; } = string.Empty;
        public bool IsImportant { get; set; }
    }
}