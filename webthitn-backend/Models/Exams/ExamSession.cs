using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho một phiên làm bài thi
    /// </summary>
    public class ExamSession
    {
        /// <summary>
        /// ID của phiên làm bài
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
        public int StudentId { get; set; }

        /// <summary>
        /// ID của kết quả bài thi liên kết
        /// </summary>
        public int ExamResultId { get; set; }

        /// <summary>
        /// Thông tin trình duyệt
        /// </summary>
        public string BrowserInfo { get; set; } = string.Empty;

        /// <summary>
        /// Địa chỉ IP
        /// </summary>
        [MaxLength(50)]
        public string IPAddress { get; set; } = string.Empty;

        /// <summary>
        /// Thời điểm bắt đầu phiên
        /// </summary>
        public DateTime StartTime { get; set; }

        /// <summary>
        /// Thời điểm kết thúc phiên (có thể null nếu phiên chưa kết thúc)
        /// </summary>
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// Thời gian hoạt động cuối cùng
        /// </summary>
        public DateTime LastActivityTime { get; set; }

        /// <summary>
        /// Trạng thái hoạt động của phiên
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Lý do kết thúc phiên (nếu có)
        /// </summary>
        public string EndReason { get; set; } = string.Empty;

        #region Navigation Properties

        /// <summary>
        /// Bài thi
        /// </summary>
        [ForeignKey("ExamId")]
        public virtual Exam Exam { get; set; }

        /// <summary>
        /// Học sinh
        /// </summary>
        [ForeignKey("StudentId")]
        public virtual User Student { get; set; }

        /// <summary>
        /// Kết quả bài thi
        /// </summary>
        [ForeignKey("ExamResultId")]
        public virtual ExamResult ExamResult { get; set; }

        #endregion
    }
}