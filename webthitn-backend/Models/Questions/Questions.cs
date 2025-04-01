using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace webthitn_backend.Models
{
    public class Question
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Lesson")]
        public int? LessonId { get; set; } // Có thể null nếu câu hỏi không thuộc bài học nào cụ thể

        [ForeignKey("Subject")]
        public int SubjectId { get; set; } // Tất cả câu hỏi đều thuộc một môn học

        [ForeignKey("Level")]
        public int LevelId { get; set; } // Mức độ câu hỏi

        [Required]
        public string Content { get; set; } // Nội dung câu hỏi

        [StringLength(1000)]
        public string ImageUrl { get; set; } // Đường dẫn hình ảnh (nếu có)

        public float DefaultPoints { get; set; } = 0.25f; // Điểm mặc định

        [StringLength(50)]
        public string QuestionCode { get; set; } // Mã câu hỏi (VD: MATH12C1L2Q5)

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Lesson Lesson { get; set; }
        public virtual Subject Subject { get; set; }
        public virtual QuestionLevel Level { get; set; }
        public virtual ICollection<QuestionOption> Options { get; set; }
        public virtual ICollection<ExamQuestion> ExamQuestions { get; set; }
    }
}