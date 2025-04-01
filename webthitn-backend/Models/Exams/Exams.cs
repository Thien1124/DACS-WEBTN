using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    public class Exam
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Subject")]
        public int SubjectId { get; set; }

        [ForeignKey("ExamType")]
        public int ExamTypeId { get; set; }

        [ForeignKey("Creator")]
        public int CreatorId { get; set; } // Giáo viên tạo đề

        [Required]
        [StringLength(100)]
        public string Title { get; set; } // Tiêu đề bài thi

        [StringLength(500)]
        public string Description { get; set; }

        public int Duration { get; set; } // Thời gian làm bài (phút)

        public DateTime StartTime { get; set; } // Thời gian bắt đầu

        public DateTime EndTime { get; set; } // Thời gian kết thúc

        public int TotalQuestions { get; set; } // Tổng số câu hỏi

        public float TotalPoints { get; set; } // Tổng số điểm

        public float PassingScore { get; set; } = 5.0f; // Điểm đạt

        public bool ShuffleQuestions { get; set; } = true; // Xáo trộn câu hỏi?

        public bool ShuffleOptions { get; set; } = true; // Xáo trộn các đáp án?

        public bool ShowResults { get; set; } = true; // Hiển thị kết quả ngay sau khi làm bài?

        [StringLength(50)]
        public string ExamCode { get; set; } // Mã đề thi

        public string GradeLevel { get; set; } // Dành cho khối lớp nào (10, 11, 12)

        public bool IsPublic { get; set; } = false; // Công khai hay không

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Subject Subject { get; set; }
        public virtual ExamType ExamType { get; set; }
        public virtual User Creator { get; set; }
        public virtual ICollection<ExamQuestion> ExamQuestions { get; set; }
        public virtual ICollection<ExamResult> ExamResults { get; set; }
    }
}