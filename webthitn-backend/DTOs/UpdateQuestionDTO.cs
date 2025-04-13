using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO dùng để cập nhật thông tin câu hỏi
    /// </summary>
    public class UpdateQuestionDTO
    {
        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Loại câu hỏi (1: Một đáp án, 2: Đúng-sai nhiều ý, 3: Trả lời ngắn)
        /// </summary>
        public int? QuestionType { get; set; }

        /// <summary>
        /// Giải thích đáp án
        /// </summary>
        public string Explanation { get; set; }

        /// <summary>
        /// ID môn học
        /// </summary>
        public int? SubjectId { get; set; }

        /// <summary>
        /// ID chương học
        /// </summary>
        public int? ChapterId { get; set; }

        /// <summary>
        /// ID bài học
        /// </summary>
        public int? LessonId { get; set; }

        /// <summary>
        /// ID mức độ câu hỏi
        /// </summary>
        public int? QuestionLevelId { get; set; }

        /// <summary>
        /// Từ khóa/tag của câu hỏi
        /// </summary>
        public string Tags { get; set; }

        /// <summary>
        /// Thời gian gợi ý làm câu hỏi (giây)
        /// </summary>
        public int? SuggestedTime { get; set; }

        /// <summary>
        /// Điểm mặc định của câu hỏi
        /// </summary>
        public decimal? DefaultScore { get; set; }

        /// <summary>
        /// Trạng thái hoạt động
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Cấu hình chấm điểm (JSON)
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Cấu hình cho câu trả lời ngắn (JSON)
        /// </summary>
        public string ShortAnswerConfig { get; set; }

        /// <summary>
        /// Danh sách các đáp án của câu hỏi
        /// </summary>
        public List<UpdateQuestionOptionDTO> Options { get; set; } = new List<UpdateQuestionOptionDTO>();
    }

    /// <summary>
    /// DTO đáp án khi cập nhật câu hỏi
    /// </summary>
    public class UpdateQuestionOptionDTO
    {
        /// <summary>
        /// ID đáp án (null nếu đáp án mới)
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Nội dung đáp án
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Đánh dấu đáp án đúng
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Thứ tự hiển thị
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Nhãn hiển thị (A, B, C, D...)
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Giải thích đáp án
        /// </summary>
        public string Explanation { get; set; }

        /// <summary>
        /// Đáp án thuộc nhóm câu hỏi đúng-sai
        /// </summary>
        public bool IsPartOfTrueFalseGroup { get; set; }

        /// <summary>
        /// ID nhóm cho câu hỏi đúng-sai nhiều ý
        /// </summary>
        public int? GroupId { get; set; }

        /// <summary>
        /// Phần trăm điểm cho đáp án này (dành cho câu trả lời ngắn)
        /// </summary>
        public int ScorePercentage { get; set; } = 100;
    }
}