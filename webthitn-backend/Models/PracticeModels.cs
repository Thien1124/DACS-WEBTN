using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Đề ôn tập
    /// </summary>
    public class PracticeExam
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SubjectId { get; set; }

        [Required]
        public int UserId { get; set; }

        public int QuestionCount { get; set; }

        public int? LevelId { get; set; } // Changed to nullable int

        public string Topic { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public bool IsCompleted { get; set; }

        [Required]
        public string Questions { get; set; } // Danh sách ID câu hỏi, phân cách bởi dấu phẩy

        [ForeignKey("SubjectId")]
        public virtual Subject Subject { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("LevelId")]
        public virtual QuestionLevel Level { get; set; }
    }

    /// <summary>
    /// Kết quả làm bài ôn tập
    /// </summary>
    public class PracticeResult
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PracticeExamId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public decimal Score { get; set; }

        [Required]
        public decimal MaxScore { get; set; }

        public int CorrectAnswers { get; set; }

        [Required]
        public DateTime CompletedAt { get; set; }

        public int CompletionTime { get; set; } // Thời gian hoàn thành (giây)

        public string Answers { get; set; } // JSON lưu trữ câu trả lời

        [ForeignKey("PracticeExamId")]
        public virtual PracticeExam PracticeExam { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}