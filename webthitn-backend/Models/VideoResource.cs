using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho tài nguyên video ôn tập
    /// </summary>
    public class VideoResource
    {
        /// <summary>
        /// ID của video
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề video
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        /// <summary>
        /// Mô tả video
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Đường dẫn tới file video
        /// </summary>
        [Required]
        public string Url { get; set; }

        /// <summary>
        /// Đường dẫn tới thumbnail của video
        /// </summary>
        public string ThumbnailUrl { get; set; }

        /// <summary>
        /// Thời lượng video (giây)
        /// </summary>
        public int Duration { get; set; }

        /// <summary>
        /// Kích thước file (bytes)
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// Loại file (mp4, avi, etc.)
        /// </summary>
        [MaxLength(10)]
        public string FileType { get; set; }

        /// <summary>
        /// ID của môn học
        /// </summary>
        public int SubjectId { get; set; }

        /// <summary>
        /// Môn học
        /// </summary>
        [ForeignKey("SubjectId")]
        public virtual Subject Subject { get; set; }

        /// <summary>
        /// ID của chương học (nếu có)
        /// </summary>
        public int? ChapterId { get; set; }

        /// <summary>
        /// Chương học
        /// </summary>
        [ForeignKey("ChapterId")]
        public virtual Chapter Chapter { get; set; }

        /// <summary>
        /// Các tag/từ khóa liên quan đến video
        /// </summary>
        [MaxLength(500)]
        public string Tags { get; set; }

        /// <summary>
        /// ID của người upload
        /// </summary>
        public int UploadedById { get; set; }

        /// <summary>
        /// Người upload
        /// </summary>
        [ForeignKey("UploadedById")]
        public virtual User UploadedBy { get; set; }

        /// <summary>
        /// Số lượt xem
        /// </summary>
        public int ViewCount { get; set; } = 0;

        /// <summary>
        /// Trạng thái kích hoạt của video
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Thời gian tạo
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Thời gian cập nhật gần nhất
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
}