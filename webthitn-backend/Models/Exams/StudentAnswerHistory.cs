using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity lưu trữ lịch sử thay đổi câu trả lời của học sinh
    /// </summary>
    public class StudentAnswerHistory
    {
        /// <summary>
        /// ID của lịch sử
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID của câu trả lời
        /// </summary>
        public int StudentAnswerId { get; set; }

        /// <summary>
        /// Các ID của đáp án được chọn (JSON array cho câu hỏi nhiều đáp án)
        /// </summary>
        public string? SelectedOptionIds { get; set; }

        /// <summary>
        /// Văn bản câu trả lời (cho câu hỏi điền từ)
        /// </summary>
        public string? TextAnswer { get; set; }

        /// <summary>
        /// Dữ liệu ghép đôi (JSON cho câu hỏi ghép đôi)
        /// </summary>
        public string? MatchingData { get; set; }

        /// <summary>
        /// Thời gian thay đổi
        /// </summary>
        public DateTime ChangedAt { get; set; }

        /// <summary>
        /// IP của thiết bị khi thay đổi
        /// </summary>
        [MaxLength(50)]
        public string? IPAddress { get; set; }

        /// <summary>
        /// ID của phiên làm bài
        /// </summary>
        [MaxLength(100)]
        public string? SessionId { get; set; }

        #region Navigation Properties

        /// <summary>
        /// Câu trả lời
        /// </summary>
        public virtual StudentAnswer? StudentAnswer { get; set; }

        #endregion
    }
}