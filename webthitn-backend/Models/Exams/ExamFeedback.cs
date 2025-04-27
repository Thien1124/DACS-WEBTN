using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    public class ExamFeedback
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ExamId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Content { get; set; }

        public string ResponseContent { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }

        [Required]
        public FeedbackStatus Status { get; set; }

        public FeedbackType Type { get; set; }

        public int? QuestionId { get; set; }

        public int? ResolvedById { get; set; }

        [ForeignKey("ExamId")]
        public virtual Exam Exam { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; }

        [ForeignKey("ResolvedById")]
        public virtual User ResolvedBy { get; set; }
    }

    public enum FeedbackStatus
    {
        Pending = 0,
        InProcess = 1,
        Resolved = 2,
        Rejected = 3
    }

    public enum FeedbackType
    {
        General = 0,
        QuestionError = 1,
        TechnicalIssue = 2,
        ScoringIssue = 3,
        Other = 4
    }
}