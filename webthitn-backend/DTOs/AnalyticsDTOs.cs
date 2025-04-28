using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cho thống kê câu hỏi trong đề thi
    /// </summary>
    public class QuestionAnalyticsDTO
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        public string QuestionContent { get; set; }

        /// <summary>
        /// Số lượt trả lời câu hỏi
        /// </summary>
        public int AttemptCount { get; set; }

        /// <summary>
        /// Số lượt trả lời đúng
        /// </summary>
        public int CorrectCount { get; set; }

        /// <summary>
        /// Số lượt trả lời sai
        /// </summary>
        public int IncorrectCount { get; set; }

        /// <summary>
        /// Tổng thời gian làm câu hỏi (giây)
        /// </summary>
        public int TotalTimeSpent { get; set; }

        /// <summary>
        /// Thời gian trung bình làm câu hỏi (giây)
        /// </summary>
        public int AverageTimeSpent { get; set; }

        /// <summary>
        /// Tỷ lệ trả lời đúng (%)
        /// </summary>
        public double CorrectRate { get; set; }
    }

    /// <summary>
    /// DTO cho phân phối điểm
    /// </summary>
    public class ScoreDistributionDTO
    {
        /// <summary>
        /// Khoảng điểm
        /// </summary>
        public string Range { get; set; }

        /// <summary>
        /// Số lượng bài thi trong khoảng điểm
        /// </summary>
        public int Count { get; set; }

        /// <summary>
        /// Phần trăm bài thi trong khoảng điểm
        /// </summary>
        public double Percentage { get; set; }
    }

    /// <summary>
    /// DTO cho thống kê học sinh theo môn học
    /// </summary>
    public class StudentSubjectStatsDTO
    {
        /// <summary>
        /// ID của môn học
        /// </summary>
        public int SubjectId { get; set; }

        /// <summary>
        /// Tên môn học
        /// </summary>
        public string SubjectName { get; set; }

        /// <summary>
        /// Số lượng bài thi đã làm
        /// </summary>
        public int ExamCount { get; set; }

        /// <summary>
        /// Điểm trung bình
        /// </summary>
        public double AverageScore { get; set; }

        /// <summary>
        /// Điểm cao nhất
        /// </summary>
        public decimal HighestScore { get; set; }

        /// <summary>
        /// Điểm thấp nhất
        /// </summary>
        public decimal LowestScore { get; set; }

        /// <summary>
        /// Số lượt đạt
        /// </summary>
        public int PassCount { get; set; }

        /// <summary>
        /// Tỷ lệ đạt (%)
        /// </summary>
        public double PassRate { get; set; }
    }

    /// <summary>
    /// DTO cho bài thi gần đây của học sinh
    /// </summary>
    public class StudentRecentExamDTO
    {
        /// <summary>
        /// ID của đề thi
        /// </summary>
        public int ExamId { get; set; }

        /// <summary>
        /// Tiêu đề đề thi
        /// </summary>
        public string ExamTitle { get; set; }

        /// <summary>
        /// Tên môn học
        /// </summary>
        public string SubjectName { get; set; }

        /// <summary>
        /// Điểm đạt được
        /// </summary>
        public decimal Score { get; set; }

        /// <summary>
        /// Điểm tối đa
        /// </summary>
        public decimal MaxScore { get; set; }

        /// <summary>
        /// Điểm đạt
        /// </summary>
        public decimal PassScore { get; set; }

        /// <summary>
        /// Có đạt hay không
        /// </summary>
        public bool IsPassed { get; set; }

        /// <summary>
        /// Thời gian hoàn thành
        /// </summary>
        public DateTime CompletedAt { get; set; }

        /// <summary>
        /// Thời gian làm bài (giây)
        /// </summary>
        public int CompletionTime { get; set; }
    }

    /// <summary>
    /// DTO cho xếp hạng học sinh
    /// </summary>
    public class StudentRankingDTO
    {
        /// <summary>
        /// ID của học sinh
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Tên đăng nhập
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Họ và tên
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// URL ảnh đại diện
        /// </summary>
        public string AvatarUrl { get; set; }

        /// <summary>
        /// Số lượng bài thi đã làm
        /// </summary>
        public int ExamCount { get; set; }

        /// <summary>
        /// Điểm trung bình
        /// </summary>
        public double AverageScore { get; set; }

        /// <summary>
        /// Điểm trung bình theo tỷ lệ (%)
        /// </summary>
        public double AveragePercentage { get; set; }

        /// <summary>
        /// Điểm cao nhất
        /// </summary>
        public double HighestScore { get; set; }

        /// <summary>
        /// Thứ hạng
        /// </summary>
        public int Rank { get; set; }
    }

    /// <summary>
    /// Cấu trúc dữ liệu câu trả lời trong bài thi
    /// </summary>
    public class AnswerData
    {
        /// <summary>
        /// ID câu hỏi
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// ID đáp án đã chọn
        /// </summary>
        public List<int> SelectedOptionIds { get; set; }

        /// <summary>
        /// Câu trả lời văn bản (cho câu hỏi tự luận)
        /// </summary>
        public string TextAnswer { get; set; }

        /// <summary>
        /// Đúng hay sai
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Điểm đạt được
        /// </summary>
        public decimal Score { get; set; }

        /// <summary>
        /// Thời gian làm câu hỏi (giây)
        /// </summary>
        public int TimeSpent { get; set; }
    }
}