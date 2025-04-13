using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho kết quả làm bài thi của học sinh
    /// </summary>
    public class ExamResult
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public ExamResult()
        {
            // Khởi tạo collection để tránh lỗi null reference
            StudentAnswers = new HashSet<StudentAnswer>();
        }

        /// <summary>
        /// ID của kết quả bài thi
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID của bài thi
        /// </summary>
        public int ExamId { get; set; }

        /// <summary>
        /// ID của học sinh
        /// </summary>
        public required int StudentId { get; set; }
        public int? ClassId { get; set; }
        /// <summary>
        /// Số điểm đạt được
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Score { get; set; }

        /// <summary>
        /// Thời gian làm bài thực tế (giây)
        /// </summary>
        public required int Duration { get; set; }

        /// <summary>
        /// Thứ tự lần làm bài (nếu học sinh làm nhiều lần)
        /// </summary>
        public required int AttemptNumber { get; set; }

        /// <summary>
        /// Số câu trả lời đúng hoàn toàn
        /// </summary>
        public required int CorrectAnswers { get; set; }

        /// <summary>
        /// Số câu trả lời đúng một phần
        /// </summary>
        public int PartiallyCorrectAnswers { get; set; }

        /// <summary>
        /// Tổng số câu hỏi trong bài thi
        /// </summary>
        public required int TotalQuestions { get; set; }

        /// <summary>
        /// Số câu đã làm
        /// </summary>
        public required int AnsweredQuestions { get; set; }

        /// <summary>
        /// Trạng thái hoàn thành bài thi
        /// </summary>
        /// <remarks>
        /// True: Đã hoàn thành/đã nộp bài
        /// False: Đang làm/chưa hoàn thành
        /// </remarks>
        public required bool IsCompleted { get; set; }

        /// <summary>
        /// Điểm phần trăm (0-100)
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal PercentageScore { get; set; }

        /// <summary>
        /// Đã đạt yêu cầu hay chưa
        /// </summary>
        public required bool IsPassed { get; set; }

        /// <summary>
        /// Nhận xét của giáo viên
        /// </summary>
        public string TeacherComment { get; set; } = string.Empty;

        /// <summary>
        /// ID của giáo viên chấm bài (nếu có chấm thủ công)
        /// </summary>
        public int? GradedById { get; set; }

        /// <summary>
        /// Trạng thái chấm bài
        /// </summary>
        /// <remarks>
        /// 0: Đang chờ chấm
        /// 1: Đã chấm tự động
        /// 2: Đã chấm thủ công
        /// 3: Đã chấm kết hợp (tự động + thủ công)
        /// 4: Đang chờ chấm tay cho câu hỏi trả lời ngắn
        /// </remarks>
        public required int GradingStatus { get; set; }

        /// <summary>
        /// Số câu hỏi cần chấm thủ công (trả lời ngắn)
        /// </summary>
        public int PendingManualGradeCount { get; set; }

        /// <summary>
        /// IP của thiết bị làm bài
        /// </summary>
        [MaxLength(50)]
        public string IPAddress { get; set; } = string.Empty;

        /// <summary>
        /// Thông tin thiết bị làm bài (user agent)
        /// </summary>
        public string DeviceInfo { get; set; } = string.Empty;

        /// <summary>
        /// Thời điểm bắt đầu làm bài
        /// </summary>
        public required DateTime StartedAt { get; set; }

        /// <summary>
        /// Thời điểm nộp bài
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Thời điểm chấm bài
        /// </summary>
        public DateTime? GradedAt { get; set; }

        /// <summary>
        /// Bài thi được hoàn thành hay bị hết thời gian
        /// </summary>
        /// <remarks>
        /// True: Người dùng chủ động nộp bài
        /// False: Hết thời gian làm bài và hệ thống tự động nộp
        /// </remarks>
        public required bool IsSubmittedManually { get; set; }

        /// <summary>
        /// Thống kê chi tiết theo loại câu hỏi (JSON)
        /// </summary>
        public string QuestionTypeStatistics { get; set; }
        public int? SessionId { get; set; }
        
        #region Navigation Properties

        /// <summary>
        /// Bài thi
        /// </summary>
        public virtual Exam Exam { get; set; }

        /// <summary>
        /// Học sinh
        /// </summary>
        public virtual User Student { get; set; }

        /// <summary>
        /// Giáo viên chấm bài
        /// </summary>
        [ForeignKey("GradedById")]
        public virtual User GradedBy { get; set; }

        /// <summary>
        /// Danh sách câu trả lời của học sinh
        /// </summary>
        public virtual ICollection<StudentAnswer> StudentAnswers { get; set; }
        /// <summary>
        /// Phiên làm bài tạo ra kết quả này
        /// </summary>
        [ForeignKey("SessionId")]

        /// <summary>
        /// Lịch sử hoạt động liên quan đến kết quả này
        /// </summary>
        #endregion

        #region Navigation Properties

        // Các bài thi đã tạo (chỉ áp dụng cho Teacher và Admin)
        public virtual ICollection<Exam> CreatedExams { get; set; }

        // Các câu hỏi đã tạo (chỉ áp dụng cho Teacher và Admin)
        public virtual ICollection<Question> CreatedQuestions { get; set; }

        // Kết quả các bài thi đã làm (chỉ áp dụng cho Student)
        [InverseProperty("Student")]
        public virtual ICollection<ExamResult> ExamResults { get; set; }

        // Kết quả bài thi đã chấm (chỉ áp dụng cho Teacher và Admin)
        [InverseProperty("GradedBy")]
        public virtual ICollection<ExamResult> GradedExamResults { get; set; }

        // Lớp học của học sinh (chỉ áp dụng cho Student)
        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; }

        #endregion

        #region Methods and computed properties

        /// <summary>
        /// Thống kê chi tiết theo loại câu hỏi
        /// </summary>
        [NotMapped]
        public QuestionStatistics Statistics
        {
            get
            {
                try
                {
                    if (!string.IsNullOrEmpty(QuestionTypeStatistics))
                    {
                        return System.Text.Json.JsonSerializer.Deserialize<QuestionStatistics>(QuestionTypeStatistics)
                               ?? new QuestionStatistics();
                    }
                }
                catch
                {
                    // Ignore parsing errors and return default statistics
                }

                return new QuestionStatistics();
            }
            set
            {
                QuestionTypeStatistics = System.Text.Json.JsonSerializer.Serialize(value);
            }
        }

        /// <summary>
        /// Cập nhật thống kê sau khi hoàn thành bài thi
        /// </summary>
        public void UpdateStatistics()
        {
            if (StudentAnswers == null)
                return;

            var stats = new QuestionStatistics();

            // Đếm câu hỏi theo loại
            foreach (var answer in StudentAnswers)
            {
                if (answer.Question == null)
                    continue;

                switch (answer.Question.QuestionType)
                {
                    case 1: // Trắc nghiệm một đáp án
                        stats.SingleChoiceTotal++;
                        if (answer.IsCorrect) stats.SingleChoiceCorrect++;
                        break;
                    case 5: // Đúng-sai nhiều ý
                        stats.TrueFalseTotal++;
                        if (answer.IsCorrect) stats.TrueFalseCorrect++;
                        else if (answer.IsPartiallyCorrect) stats.TrueFalsePartial++;
                        break;
                    case 3: // Trả lời ngắn
                        stats.ShortAnswerTotal++;
                        if (answer.IsCorrect) stats.ShortAnswerCorrect++;
                        else if (answer.IsPartiallyCorrect) stats.ShortAnswerPartial++;
                        break;
                }
            }

            // Cập nhật thống kê tổng hợp
            CorrectAnswers = stats.SingleChoiceCorrect + stats.TrueFalseCorrect + stats.ShortAnswerCorrect;
            PartiallyCorrectAnswers = stats.TrueFalsePartial + stats.ShortAnswerPartial;
            AnsweredQuestions = StudentAnswers.Count(a => a.Status > 0);
            TotalQuestions = StudentAnswers.Count;

            // Cập nhật trạng thái chấm bài
            PendingManualGradeCount = StudentAnswers.Count(a => a.RequiresManualReview);

            if (PendingManualGradeCount > 0)
            {
                GradingStatus = 4; // Đang chờ chấm tay cho câu hỏi trả lời ngắn
            }

            // Lưu thống kê
            Statistics = stats;
        }

        /// <summary>
        /// Tính điểm phần trăm và kiểm tra đạt yêu cầu
        /// </summary>
        public void CalculatePercentageAndStatus()
        {
            if (Exam == null)
                return;

            decimal maxScore = Exam.TotalScore;

            if (maxScore > 0)
            {
                PercentageScore = Math.Round((Score / maxScore) * 100, 2);
            }

            // Kiểm tra đạt yêu cầu
            if (Exam.PassScore.HasValue)
            {
                IsPassed = Score >= Exam.PassScore.Value;
            }
            else
            {
                // Nếu không có điểm đạt, quy ước là 50%
                IsPassed = PercentageScore >= 50;
            }
        }

        #endregion
    }

    /// <summary>
    /// Thống kê chi tiết theo loại câu hỏi
    /// </summary>
    public class QuestionStatistics
    {
        // Câu hỏi trắc nghiệm một đáp án
        public int SingleChoiceTotal { get; set; }
        public int SingleChoiceCorrect { get; set; }

        // Câu hỏi đúng-sai nhiều ý
        public int TrueFalseTotal { get; set; }
        public int TrueFalseCorrect { get; set; }
        public int TrueFalsePartial { get; set; }

        // Câu hỏi trả lời ngắn
        public int ShortAnswerTotal { get; set; }
        public int ShortAnswerCorrect { get; set; }
        public int ShortAnswerPartial { get; set; }
    }
}