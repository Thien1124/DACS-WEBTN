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
        /// Ký hiệu tùy chỉnh (a, b, c, d hoặc khác) cho đáp án
        /// </summary>
        [MaxLength(10)]
        public string Label { get; set; }

        /// <summary>
        /// Đường dẫn đến hình ảnh (cập nhật sau)
        /// </summary>
        public string ImagePath { get; set; }

        /// <summary>
        /// Phần giải thích cho đáp án này (cập nhật sau)
        /// </summary>
        public string Explanation { get; set; }

        /// <summary>
        /// Giá trị ghép đôi (cho câu hỏi ghép đôi)
        /// </summary>
        public string MatchingValue { get; set; } = "";

        /// <summary>
        /// Mức độ điểm số cho đáp án này (0-100%)
        /// Chỉ dùng cho câu hỏi trả lời ngắn, đáp án chính xác nhất sẽ là 100%
        /// </summary>
        public int ScorePercentage { get; set; } = 100;

        /// <summary>
        /// Tham chiếu đến câu hỏi
        /// </summary>
        public virtual Question Question { get; set; }

        /// <summary>
        /// Đánh dấu nếu đây là một mục Đúng-Sai trong câu hỏi đúng-sai nhiều ý
        /// </summary>
        public bool IsPartOfTrueFalseGroup { get; set; }

        /// <summary>
        /// Nhóm đáp án (dùng cho câu hỏi đúng-sai nhiều ý, các đáp án có cùng GroupId thuộc về cùng một ý con)
        /// </summary>
        public int? GroupId { get; set; }
    }
}