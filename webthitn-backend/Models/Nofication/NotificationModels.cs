using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models.Notifications
{
    /// <summary>
    /// Loại thông báo trong hệ thống
    /// </summary>
    public enum NotificationType
    {
        /// <summary>
        /// Thông báo chung
        /// </summary>
        General = 0,

        /// <summary>
        /// Thông báo về bài thi
        /// </summary>
        Exam = 1,

        /// <summary>
        /// Thông báo về kết quả
        /// </summary>
        Result = 2,

        /// <summary>
        /// Thông báo về hệ thống
        /// </summary>
        System = 3,

        /// <summary>
        /// Thông báo về tài khoản
        /// </summary>
        Account = 4
    }

    /// <summary>
    /// Thông báo trong hệ thống
    /// </summary>
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề thông báo
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        /// <summary>
        /// Nội dung thông báo
        /// </summary>
        [Required]
        public string Content { get; set; }

        /// <summary>
        /// ID của người dùng nhận thông báo
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>
        /// Đối tượng người dùng nhận thông báo
        /// </summary>
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        /// <summary>
        /// Loại thông báo
        /// </summary>
        public NotificationType Type { get; set; }

        /// <summary>
        /// Thông báo đã đọc hay chưa
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// Đường dẫn liên quan đến thông báo
        /// </summary>
        public string Link { get; set; }

        /// <summary>
        /// Thời gian tạo thông báo
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Thời gian đọc thông báo
        /// </summary>
        public DateTime? ReadAt { get; set; }

        /// <summary>
        /// ID đối tượng liên quan (ví dụ: ID bài thi, ID kết quả)
        /// </summary>
        public int? RelatedEntityId { get; set; }

        /// <summary>
        /// Loại đối tượng liên quan
        /// </summary>
        public string RelatedEntityType { get; set; }

        /// <summary>
        /// Thông báo đã gửi qua email chưa
        /// </summary>
        public bool SentViaEmail { get; set; }
    }
}