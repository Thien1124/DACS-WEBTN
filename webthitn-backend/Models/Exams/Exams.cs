using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho bài thi trong hệ thống
    /// </summary>
    public class Exam
    {
        /// <summary>
        /// ID của bài thi
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề bài thi
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        /// <summary>
        /// Mô tả bài thi
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// ID của môn học
        /// </summary>
        public int SubjectId { get; set; }

        /// <summary>
        /// ID của loại bài thi
        /// </summary>
        public int ExamTypeId { get; set; }

        /// <summary>
        /// Thời gian làm bài (phút)
        /// </summary>
        [Required]
        public int Duration { get; set; }

        /// <summary>
        /// Điểm tối đa của bài thi
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal TotalScore { get; set; }

        /// <summary>
        /// Điểm đạt của bài thi
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal? PassScore { get; set; }

        /// <summary>
        /// Số lần được làm bài (null là không giới hạn)
        /// </summary>
        public int? MaxAttempts { get; set; }

        /// <summary>
        /// Thời gian bắt đầu mở bài thi
        /// </summary>
        public DateTime? StartTime { get; set; }

        /// <summary>
        /// Thời gian kết thúc đóng bài thi
        /// </summary>
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Cài đặt hiển thị kết quả sau khi làm bài
        /// </summary>
        public bool ShowResult { get; set; } = true;

        /// <summary>
        /// Cài đặt hiển thị đáp án đúng sau khi làm bài
        /// </summary>
        public bool ShowAnswers { get; set; } = false;

        /// <summary>
        /// Trộn câu hỏi khi hiển thị
        /// </summary>
        public bool ShuffleQuestions { get; set; } = true;

        /// <summary>
        /// Trộn đáp án khi hiển thị (áp dụng cho câu hỏi trắc nghiệm một đáp án)
        /// </summary>
        public bool ShuffleOptions { get; set; } = true;

        /// <summary>
        /// Cài đặt chấm tự động câu hỏi trả lời ngắn
        /// </summary>
        public bool AutoGradeShortAnswer { get; set; } = true;

        /// <summary>
        /// Cài đặt mức điểm đạt (%) cho câu hỏi đúng-sai nhiều ý nếu trả lời đúng một phần
        /// </summary>
        public bool AllowPartialGrading { get; set; } = true;

        /// <summary>
        /// Mã truy cập bài thi (nếu được bảo vệ)
        /// </summary>
        public string AccessCode { get; set; }

        /// <summary>
        /// Ngày giờ tạo bài thi
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Ngày giờ cập nhật gần nhất
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// ID người tạo bài thi
        /// </summary>
        public int CreatorId { get; set; }

        /// <summary>
        /// Cài đặt kiểu tính điểm cho bài thi (JSON)
        /// {
        ///   "grading_method": "sum", // sum hoặc average
        ///   "partial_credit_method": "proportional", // proportional hoặc all_or_nothing
        ///   "penalty_for_wrong_answer": 0 // điểm trừ cho câu trả lời sai (0 = không trừ điểm)
        /// }
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Quan hệ với môn học
        /// </summary>
        public virtual Subject Subject { get; set; }

        /// <summary>
        /// Quan hệ với loại bài thi
        /// </summary>
        public virtual ExamType ExamType { get; set; }

        /// <summary>
        /// Người tạo bài thi
        /// </summary>
        public virtual User Creator { get; set; }

        /// <summary>
        /// Danh sách câu hỏi trong bài thi
        /// </summary>
        public virtual ICollection<ExamQuestion> ExamQuestions { get; set; }

        /// <summary>
        /// Danh sách kết quả làm bài
        /// </summary>
        public virtual ICollection<ExamResult> ExamResults { get; set; }

        #region Additional properties and methods

        /// <summary>
        /// Cấu hình tính điểm của bài thi
        /// </summary>
        [NotMapped]
        public ScoringConfiguration ScoringConfiguration
        {
            get
            {
                try
                {
                    if (!string.IsNullOrEmpty(ScoringConfig))
                    {
                        return System.Text.Json.JsonSerializer.Deserialize<ScoringConfiguration>(ScoringConfig)
                               ?? new ScoringConfiguration();
                    }
                }
                catch
                {
                    // Ignore parsing errors and return default config
                }

                return new ScoringConfiguration();
            }
            set
            {
                ScoringConfig = System.Text.Json.JsonSerializer.Serialize(value ?? new ScoringConfiguration());
            }
        }

        /// <summary>
        /// Kiểm tra xem bài thi có đang mở không
        /// </summary>
        [NotMapped]
        public bool IsOpen
        {
            get
            {
                if (!IsActive)
                    return false;

                var now = DateTime.UtcNow;

                if (StartTime.HasValue && now < StartTime.Value)
                    return false;

                if (EndTime.HasValue && now > EndTime.Value)
                    return false;

                return true;
            }
        }

        /// <summary>
        /// Tính điểm cho bài thi dựa trên câu trả lời của học sinh
        /// </summary>
        public decimal CalculateScore(ICollection<StudentAnswer> studentAnswers)
        {
            if (studentAnswers == null || !studentAnswers.Any())
                return 0;

            var scoringConfig = ScoringConfiguration;
            decimal totalScore = 0;

            foreach (var answer in studentAnswers)
            {
                // Nếu có điểm chấm tay, sử dụng điểm chấm tay
                if (answer.ManualScore.HasValue)
                {
                    totalScore += answer.ManualScore.Value;
                }
                else
                {
                    // Nếu không, sử dụng điểm tự động
                    totalScore += answer.Score;

                    // Áp dụng điểm trừ nếu có cấu hình
                    if (!answer.IsCorrect && !answer.IsPartiallyCorrect && scoringConfig.PenaltyForWrongAnswer > 0)
                    {
                        totalScore -= answer.MaxScore * (scoringConfig.PenaltyForWrongAnswer / 100m);
                    }
                }
            }

            // Đảm bảo điểm không âm
            totalScore = Math.Max(0, totalScore);

            return totalScore;
        }

        #endregion

        #region Navigation Properties

        #endregion
    }

    /// <summary>
    /// Cấu hình tính điểm cho bài thi
    /// </summary>
    public class ScoringConfiguration
    {
        /// <summary>
        /// Phương thức tính điểm ("sum": cộng điểm, "average": lấy trung bình)
        /// </summary>
        public string GradingMethod { get; set; } = "sum";

        /// <summary>
        /// Phương thức tính điểm một phần ("proportional": tính theo tỷ lệ, "all_or_nothing": đúng hết hoặc không điểm)
        /// </summary>
        public string PartialCreditMethod { get; set; } = "proportional";

        /// <summary>
        /// Phần trăm điểm trừ cho câu trả lời sai (0-100)
        /// </summary>
        public decimal PenaltyForWrongAnswer { get; set; } = 0;
    }

}