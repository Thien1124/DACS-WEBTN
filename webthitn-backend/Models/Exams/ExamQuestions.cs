using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
    public class ExamQuestion
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Exam")]
        public int ExamId { get; set; }

        [ForeignKey("Question")]
        public int QuestionId { get; set; }

        public int OrderIndex { get; set; } // Thứ tự câu hỏi trong đề thi

        public float Points { get; set; } // Điểm cho câu hỏi này trong đề thi cụ thể

        // Navigation properties
        public virtual Exam Exam { get; set; }
        public virtual Question Question { get; set; }
    }
}