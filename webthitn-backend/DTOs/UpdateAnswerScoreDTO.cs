namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cập nhật điểm cho một câu trả lời
    /// </summary>
    public class UpdateAnswerScoreDTO
    {
        /// <summary>
        /// ID của câu trả lời
        /// </summary>
        /// <example>105</example>
        public int StudentAnswerId { get; set; }

        /// <summary>
        /// Điểm cập nhật
        /// </summary>
        /// <example>0.75</example>
        public decimal Score { get; set; }

        /// <summary>
        /// Lý do cho điểm
        /// </summary>
        /// <example>Câu trả lời đúng về cơ bản nhưng thiếu giải thích về cách áp dụng quy tắc l'Hôpital</example>
        public string Comment { get; set; }

        /// <summary>
        /// Đánh dấu là đúng, đúng một phần hay sai
        /// 1: Đúng, 2: Đúng một phần, 3: Sai
        /// </summary>
        /// <example>2</example>
        public int Status { get; set; }
    }
}