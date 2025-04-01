using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    public class ExamResult
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Exam")]
        public int ExamId { get; set; }

        [ForeignKey("Student")]
        public int StudentId { get; set; }

        public DateTime StartTime { get; set; } // Thời gian bắt đầu làm bài

        public DateTime? EndTime { get; set; } // Thời gian nộp bài

        public float TotalScore { get; set; } = 0.0f; // Tổng điểm

        public float MaxPossibleScore { get; set; } = 0.0f; // Điểm tối đa

        public int TotalCorrect { get; set; } = 0; // Tổng số câu đúng

        public int TotalQuestions { get; set; } = 0; // Tổng số câu hỏi

        public bool Passed { get; set; } = false; // Đã đạt yêu cầu chưa?

        [StringLength(50)]
        public string Status { get; set; } = "InProgress"; // InProgress, Completed, Timed Out

        public int AttemptNumber { get; set; } = 1; // Lần thử thứ mấy

        // Navigation properties
        public virtual Exam Exam { get; set; }
        public virtual User Student { get; set; }
        public virtual ICollection<StudentAnswer> StudentAnswers { get; set; }
    }
}