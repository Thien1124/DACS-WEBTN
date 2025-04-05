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
        /// ID của đáp án được chọn (cho câu hỏi một đáp án)
        /// </summary>
        public int? SelectedOptionId { get; set; }

        /// <summary>
        /// Văn bản câu trả lời (cho câu hỏi trả lời ngắn)
        /// </summary>
        public string? TextAnswer { get; set; }

        /// <summary>
        /// Dữ liệu đáp án đúng-sai (JSON cho câu hỏi đúng-sai nhiều ý)
        /// Ví dụ: {"1":true,"2":false,"3":true,"4":true}
        /// </summary>
        public string? TrueFalseAnswers { get; set; }

        /// <summary>
        /// Loại câu hỏi được lưu trong lịch sử này
        /// 1: Một đáp án (trắc nghiệm a,b,c,d)
        /// 3: Trả lời ngắn
        /// 5: Đúng-sai nhiều ý
        /// </summary>
        public int QuestionType { get; set; }

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

        /// <summary>
        /// Thiết bị sử dụng (user agent)
        /// </summary>
        public string? DeviceInfo { get; set; }

        #region Navigation Properties

        /// <summary>
        /// Câu trả lời
        /// </summary>
        public virtual StudentAnswer? StudentAnswer { get; set; }

        #endregion
    }
}