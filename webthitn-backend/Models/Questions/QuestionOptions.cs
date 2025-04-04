using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho các lựa chọn/đáp án của câu hỏi
    /// </summary>
    public class QuestionOption
    {
        /// <summary>
        /// ID của đáp án
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// Nội dung đáp án
        /// </summary>
        [Required]
        public string Content { get; set; }

        /// <summary>
        /// Đánh dấu đáp án đúng
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Thứ tự hiển thị của đáp án
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Đường dẫn đến hình ảnh (nếu có)
        /// </summary>
        public string ImagePath { get; set; }

        /// <summary>
        /// Phần giải thích cho đáp án này (nếu cần)
        /// </summary>
        public string Explanation { get; set; }

        /// <summary>
        /// Tham chiếu đến câu hỏi
        /// </summary>
        public virtual Question Question { get; set; }

        /// <summary>
        /// Giá trị ghép đôi (sử dụng cho câu hỏi ghép đôi)
        /// </summary>
        public string MatchingValue { get; set; }
    }
}