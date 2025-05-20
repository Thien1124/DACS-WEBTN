namespace webthitn_backend.DTOs
{
    public class ScoreVerificationRequestDTO
    {
        /// <summary>
        /// ID kết quả bài thi cần xác minh điểm
        /// </summary>
        public int ExamResultId { get; set; }

        /// <summary>
        /// Lý do yêu cầu xác minh điểm
        /// </summary>
        public string Reason { get; set; }
    }

    public class ScoreVerificationResponseDTO
    {
        /// <summary>
        /// ID của yêu cầu xác minh điểm
        /// </summary>
        public int VerificationId { get; set; }

        /// <summary>
        /// Điểm số mới sau khi xác minh (null nếu giữ nguyên)
        /// </summary>
        public decimal? NewScore { get; set; }

        /// <summary>
        /// Phản hồi của giáo viên về yêu cầu xác minh
        /// </summary>
        public string Response { get; set; }
    }
}