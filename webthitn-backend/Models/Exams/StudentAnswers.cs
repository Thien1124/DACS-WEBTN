using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
    public class StudentAnswer
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ExamResult")]
        public int ExamResultId { get; set; }

        [ForeignKey("Question")]
        public int QuestionId { get; set; }

        [ForeignKey("SelectedOption")]
        public int? SelectedOptionId { get; set; } // Option được chọn

        public bool IsCorrect { get; set; } = false; // Đúng hay sai

        public float PointsEarned { get; set; } = 0.0f; // Điểm đạt được

        public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;

        public int AnswerOrder { get; set; } // Thứ tự trả lời

        // Navigation properties
        public virtual ExamResult ExamResult { get; set; }
        public virtual Question Question { get; set; }
        public virtual QuestionOption SelectedOption { get; set; }
    }
}