using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
    public class QuestionOption
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Question")]
        public int QuestionId { get; set; }

        [Required]
        public string Content { get; set; } // Nội dung đáp án

        [StringLength(1000)]
        public string ImageUrl { get; set; } // Đường dẫn hình ảnh (nếu có)

        // Đáp án A, B, C, D
        [StringLength(1)]
        public string Label { get; set; }

        public bool IsCorrect { get; set; } = false; // Có phải đáp án đúng không

        public int OrderIndex { get; set; } // Thứ tự đáp án

        // Navigation property
        public virtual Question Question { get; set; }
    }
}