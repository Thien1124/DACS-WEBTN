using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cho việc tải lên video
    /// </summary>
    public class VideoUploadDTO
    {
        /// <summary>
        /// Tiêu đề video
        /// </summary>
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        [MaxLength(255, ErrorMessage = "Tiêu đề không được vượt quá 255 ký tự")]
        public string Title { get; set; }

        /// <summary>
        /// Mô tả video
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// ID của môn học liên quan
        /// </summary>
        [Required(ErrorMessage = "Phải chọn môn học")]
        public int SubjectId { get; set; }

        /// <summary>
        /// ID của chương học (nếu có)
        /// </summary>
        public int? ChapterId { get; set; }

        /// <summary>
        /// Các tag/từ khóa liên quan đến video, phân cách bằng dấu phẩy
        /// </summary>
        [MaxLength(500, ErrorMessage = "Tags không được vượt quá 500 ký tự")]
        public string Tags { get; set; }
    }
}