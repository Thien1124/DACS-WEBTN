using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO để giáo viên cập nhật điểm bài thi
    /// </summary>
    public class UpdateResultDTO
    {
        /// <summary>
        /// Đã xem xét và hoàn thành chấm điểm
        /// </summary>
        public bool IsReviewed { get; set; } = true;

        /// <summary>
        /// Nhận xét của giáo viên
        /// </summary>
        /// <example>Bài làm tốt, cần chú ý về cách tính đạo hàm</example>
        public string TeacherComment { get; set; }

        /// <summary>
        /// Danh sách cập nhật điểm cho các câu trả lời
        /// </summary>
        public List<UpdateAnswerScoreDTO> AnswerScores { get; set; } = new List<UpdateAnswerScoreDTO>();

        /// <summary>
        /// ID người chấm điểm
        /// </summary>
        public int? ReviewerId { get; set; }

        /// <summary>
        /// Thời gian chấm điểm
        /// </summary>
        public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    }
}