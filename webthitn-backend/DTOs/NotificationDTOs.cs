using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using webthitn_backend.Models.Notifications;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO để gửi thông báo qua email
    /// </summary>
    public class EmailNotificationDTO
    {
        /// <summary>
        /// Danh sách địa chỉ email người nhận (ngăn cách bởi dấu phẩy nếu nhiều người)
        /// </summary>
        [Required(ErrorMessage = "Địa chỉ email người nhận không được để trống")]
        // Remove the EmailAddress validation attribute
        public string Recipients { get; set; }

        /// <summary>
        /// Tiêu đề email
        /// </summary>
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        [MaxLength(200, ErrorMessage = "Tiêu đề tối đa 200 ký tự")]
        public string Subject { get; set; }

        /// <summary>
        /// Nội dung email (hỗ trợ HTML)
        /// </summary>
        [Required(ErrorMessage = "Nội dung không được để trống")]
        public string Content { get; set; }

        /// <summary>
        /// Mẫu email sử dụng (tùy chọn)
        /// </summary>
        public string Template { get; set; }

        /// <summary>
        /// Dữ liệu cho mẫu email (dạng JSON)
        /// </summary>
        public string TemplateData { get; set; }

        /// <summary>
        /// Có lưu bản ghi thông báo trong hệ thống không
        /// </summary>
        public bool SaveNotification { get; set; } = false;

        /// <summary>
        /// Loại thông báo (nếu lưu)
        /// </summary>
        public NotificationType Type { get; set; } = NotificationType.General;

        /// <summary>
        /// ID đối tượng liên quan
        /// </summary>
        public int? RelatedEntityId { get; set; }

        /// <summary>
        /// Loại đối tượng liên quan
        /// </summary>
        public string RelatedEntityType { get; set; }

        /// <summary>
        /// Đường dẫn liên quan đến thông báo
        /// </summary>
        public string Link { get; set; }
    }

    /// <summary>
    /// DTO để gửi thông báo trong hệ thống
    /// </summary>
    public class InAppNotificationDTO
    {
        /// <summary>
        /// ID người nhận thông báo
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>
        /// Danh sách ID người nhận (nếu gửi nhiều người)
        /// </summary>
        public List<int> UserIds { get; set; }

        /// <summary>
        /// Tiêu đề thông báo
        /// </summary>
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        [MaxLength(200, ErrorMessage = "Tiêu đề tối đa 200 ký tự")]
        public string Title { get; set; }

        /// <summary>
        /// Nội dung thông báo
        /// </summary>
        [Required(ErrorMessage = "Nội dung không được để trống")]
        public string Content { get; set; }

        /// <summary>
        /// Loại thông báo
        /// </summary>
        public NotificationType Type { get; set; } = NotificationType.General;

        /// <summary>
        /// Đường dẫn liên quan đến thông báo
        /// </summary>
        public string Link { get; set; }

        /// <summary>
        /// ID đối tượng liên quan
        /// </summary>
        public int? RelatedEntityId { get; set; }

        /// <summary>
        /// Loại đối tượng liên quan
        /// </summary>
        public string RelatedEntityType { get; set; }

        /// <summary>
        /// Có gửi thông báo qua email không
        /// </summary>
        public bool SendEmail { get; set; } = false;
    }

    /// <summary>
    /// DTO thông báo trả về
    /// </summary>
    public class NotificationDTO
    {
        /// <summary>
        /// ID thông báo
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề thông báo
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Nội dung thông báo
        /// </summary>
        public string Content { get; set; }

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
        /// ID đối tượng liên quan
        /// </summary>
        public int? RelatedEntityId { get; set; }

        /// <summary>
        /// Loại đối tượng liên quan
        /// </summary>
        public string RelatedEntityType { get; set; }
    }
}