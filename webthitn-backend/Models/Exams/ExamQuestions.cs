using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho quan hệ giữa bài thi và câu hỏi
    /// </summary>
    public class ExamQuestion
    {
        /// <summary>
        /// ID của quan hệ bài thi - câu hỏi
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID của bài thi
        /// </summary>
        public int ExamId { get; set; }

        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// Thứ tự hiển thị của câu hỏi trong bài thi
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Điểm của câu hỏi trong bài thi này
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Score { get; set; }

        #region Navigation Properties

        /// <summary>
        /// Bài thi
        /// </summary>
        public virtual Exam? Exam { get; set; }

        /// <summary>
        /// Câu hỏi
        /// </summary>
        public virtual Question? Question { get; set; }

        #endregion
    }
}