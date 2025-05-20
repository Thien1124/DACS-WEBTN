using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    [Index(nameof(ExamResultId))]
    [Index(nameof(StudentId))]
    [Index(nameof(TeacherId))]
    public class ScoreVerification
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int ExamResultId { get; set; }
        
        [Required]
        public int StudentId { get; set; }
        
        [Required]
        public int TeacherId { get; set; }
        
        public int? ResponderId { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal OriginalScore { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal? NewScore { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string RequestReason { get; set; }
        
        [MaxLength(500)]
        public string TeacherResponse { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } // Pending, Approved, Rejected
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties with explicit foreign key configurations
        [ForeignKey("ExamResultId")]
        public virtual ExamResult ExamResult { get; set; }
        
        [ForeignKey("StudentId")]
        public virtual User Student { get; set; }
        
        [ForeignKey("TeacherId")]
        public virtual User Teacher { get; set; }
        
        [ForeignKey("ResponderId")]
        public virtual User Responder { get; set; }
    }
}