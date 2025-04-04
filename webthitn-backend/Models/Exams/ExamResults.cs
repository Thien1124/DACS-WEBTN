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
        /// Số câu trả lời đúng
        /// </summary>
        public required int CorrectAnswers { get; set; }

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
        public required string TeacherComment { get; set; }

        /// <summary>
        /// ID của giáo viên chấm bài (nếu có chấm thủ công)
        /// </summary>
        public required int? GradedById { get; set; }

        /// <summary>
        /// Trạng thái chấm bài
        /// </summary>
        /// <remarks>
        /// 0: Đang chờ chấm
        /// 1: Đã chấm tự động
        /// 2: Đã chấm thủ công
        /// 3: Đã chấm kết hợp (tự động + thủ công)
        /// </remarks>
        public required int GradingStatus { get; set; }

        /// <summary>
        /// IP của thiết bị làm bài
        /// </summary>
        [MaxLength(50)]
        public string IPAddress { get; set; }

        /// <summary>
        /// Thông tin thiết bị làm bài (user agent)
        /// </summary>
        public required string DeviceInfo { get; set; }

        /// <summary>
        /// Thời điểm bắt đầu làm bài
        /// </summary>
        public required DateTime StartedAt { get; set; }

        /// <summary>
        /// Thời điểm nộp bài
        /// </summary>
        public required DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Thời điểm chấm bài
        /// </summary>
        public required DateTime? GradedAt { get; set; }

        /// <summary>
        /// Bài thi được hoàn thành hay bị hết thời gian
        /// </summary>
        /// <remarks>
        /// True: Người dùng chủ động nộp bài
        /// False: Hết thời gian làm bài và hệ thống tự động nộp
        /// </remarks>
        public required bool IsSubmittedManually { get; set; }

        #region Navigation Properties

        /// <summary>
        /// Bài thi
        /// </summary>
        public virtual required Exam Exam { get; set; }

        /// <summary>
        /// Học sinh
        /// </summary>
        public virtual required User Student { get; set; }

        /// <summary>
        /// Giáo viên chấm bài
        /// </summary>
        public virtual required User GradedBy { get; set; }

        /// <summary>
        /// Danh sách câu trả lời của học sinh
        /// </summary>
        public virtual required ICollection<StudentAnswer> StudentAnswers { get; set; }

        #endregion
    }
}