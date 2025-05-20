using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    public class OfficialExam
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public int ExamId { get; set; }

        [ForeignKey("ExamId")]
        public Exam Exam { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        // Bỏ tham chiếu đến Classroom
        public string ClassroomName { get; set; }
        
        // Add Grade property
        public string Grade { get; set; }

        public int CreatorId { get; set; }

        [ForeignKey("CreatorId")]
        public User Creator { get; set; }

        public bool IsActive { get; set; } = true;

        public bool ResultsReleased { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<OfficialExamStudent> Students { get; set; }
    }

    public class OfficialExamStudent
    {
        [Key]
        public int Id { get; set; }

        public int OfficialExamId { get; set; }

        [ForeignKey("OfficialExamId")]
        public OfficialExam OfficialExam { get; set; }

        public int StudentId { get; set; }

        [ForeignKey("StudentId")]
        public User Student { get; set; }

        public bool HasTaken { get; set; } = false;

        public int? ExamResultId { get; set; }

        [ForeignKey("ExamResultId")]
        public ExamResult ExamResult { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}