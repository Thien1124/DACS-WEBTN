using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO để nộp bài thi
    /// </summary>
    public class SubmitExamDTO
    {
        /// <summary>
        /// ID của bài thi
        /// </summary>
        /// <example>14</example>
        public int ExamId { get; set; }

        /// <summary>
        /// Thời gian bắt đầu làm bài
        /// </summary>
        /// <example>2025-04-28T08:35:05Z</example>
        public DateTime StartTime { get; set; }

        /// <summary>
        /// Thời gian kết thúc làm bài
        /// </summary>
        /// <example>2025-04-28T08:50:05</example>
        public DateTime EndTime { get; set; }

        /// <summary>
        /// Ghi chú của học sinh
        /// </summary>
        /// <example>Bài làm kiểm tra địa lý 15 phút</example>
        public string Notes { get; set; }

        /// <summary>
        /// ID của phiên làm bài
        /// </summary>
        /// <example>session_9f8e7d6c5b4a</example>
        public string SessionId { get; set; }

        /// <summary>
        /// Thông tin thiết bị
        /// </summary>
        /// <example>Mozilla/5.0 (Windows NT 10.0; Win64; x64)</example>
        public string DeviceInfo { get; set; }

        /// <summary>
        /// Câu trả lời đã được nộp bởi người dùng (không phải tự động)
        /// </summary>
        /// <example>true</example>
        public bool IsSubmittedManually { get; set; } = true;

        /// <summary>
        /// Danh sách câu trả lời
        /// </summary>
        public List<AnswerSubmissionDTO> Answers { get; set; } = new List<AnswerSubmissionDTO>();
    }

    /// <summary>
    /// DTO cho một câu trả lời khi nộp bài
    /// </summary>
    public class AnswerSubmissionDTO
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        /// <example>27</example>
        public int QuestionId { get; set; }

        /// <summary>
        /// Thời gian bắt đầu trả lời câu hỏi
        /// </summary>
        /// <example>2025-04-28T08:35:05Z</example>
        public DateTime StartTime { get; set; }

        /// <summary>
        /// Thời gian kết thúc trả lời câu hỏi
        /// </summary>
        /// <example>2025-04-28T08:50:05</example>
        public DateTime EndTime { get; set; }

        /// <summary>
        /// ID của đáp án được chọn (cho câu hỏi một đáp án)
        /// </summary>
        /// <example>39</example>
        public int? SelectedOptionId { get; set; }

        /// <summary>
        /// Văn bản câu trả lời (cho câu hỏi trả lời ngắn)
        /// </summary>
        /// <example></example>
        public string TextAnswer { get; set; }

        /// <summary>
        /// Dữ liệu đáp án đúng-sai (JSON cho câu hỏi đúng-sai nhiều ý)
        /// Ví dụ: {"1":true,"2":false,"3":true,"4":true}
        /// </summary>
        /// <example>{}</example>
        public string TrueFalseAnswers { get; set; }

        /// <summary>
        /// Câu trả lời ghép đôi (cho câu hỏi ghép đôi)
        /// Ví dụ: {"1":3,"2":1,"3":4,"4":2} - ghép item bên trái với item bên phải
        /// </summary>
        /// <example>{}</example>
        public string MatchingAnswers { get; set; }
    }
}