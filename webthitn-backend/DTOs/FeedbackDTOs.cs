using System;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cho việc gửi phản hồi bài thi
    /// </summary>
    public class CreateFeedbackDTO
    {
        [Required]
        public string Content { get; set; }

        public int FeedbackType { get; set; } // 0: General, 1: QuestionError, 2: TechnicalIssue, 3: ScoringIssue, 4: Other

        public int? QuestionId { get; set; } // Nếu phản hồi liên quan đến câu hỏi cụ thể
    }

    /// <summary>
    /// DTO cho việc xử lý phản hồi bài thi
    /// </summary>
    public class ResolveFeedbackDTO
    {
        [Required]
        public string ResponseContent { get; set; }

        [Required]
        public int Status { get; set; } // 1: InProcess, 2: Resolved, 3: Rejected
    }

    /// <summary>
    /// DTO để hiển thị thông tin phản hồi
    /// </summary>
    public class FeedbackDTO
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public string ExamTitle { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Content { get; set; }
        public string ResponseContent { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public int? QuestionId { get; set; }
        public string QuestionContent { get; set; }
        public int? ResolvedById { get; set; }
        public string ResolvedByName { get; set; }
    }
}