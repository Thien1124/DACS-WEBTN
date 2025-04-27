using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cho việc trộn câu hỏi từ nhiều nguồn
    /// </summary>
    public class QuestionMixRequestDTO
    {
        /// <summary>
        /// Danh sách nguồn câu hỏi
        /// </summary>
        [Required]
        public List<QuestionSourceDTO> Sources { get; set; }

        /// <summary>
        /// Cài đặt cho kết quả
        /// </summary>
        public MixSettingsDTO Settings { get; set; }
    }

    /// <summary>
    /// DTO định nghĩa một nguồn câu hỏi
    /// </summary>
    public class QuestionSourceDTO
    {
        /// <summary>
        /// ID môn học (bắt buộc)
        /// </summary>
        [Required]
        public int SubjectId { get; set; }

        /// <summary>
        /// Số lượng câu hỏi cần lấy từ nguồn này
        /// </summary>
        [Required]
        [Range(1, 100)]
        public int Count { get; set; }

        /// <summary>
        /// ID chương học (tùy chọn)
        /// </summary>
        public int? ChapterId { get; set; }

        /// <summary>
        /// ID mức độ câu hỏi (tùy chọn)
        /// </summary>
        public int? LevelId { get; set; }

        /// <summary>
        /// Loại câu hỏi (1: Trắc nghiệm, 2: Đúng sai, 3: Trả lời ngắn)
        /// </summary>
        public int? QuestionType { get; set; }

        /// <summary>
        /// Chủ đề/tag cần tìm kiếm
        /// </summary>
        public string Topic { get; set; }

        /// <summary>
        /// Điểm mỗi câu hỏi (nếu không cung cấp, sẽ dùng điểm mặc định của câu hỏi)
        /// </summary>
        public decimal? ScorePerQuestion { get; set; }

        /// <summary>
        /// Phương thức chọn (random: ngẫu nhiên, newest: mới nhất, oldest: cũ nhất)
        /// </summary>
        public string SelectionMethod { get; set; } = "random";

        /// <summary>
        /// Danh sách ID câu hỏi cần loại trừ
        /// </summary>
        public List<int> ExcludeIds { get; set; }
    }

    /// <summary>
    /// Cài đặt cho kết quả trộn câu hỏi
    /// </summary>
    public class MixSettingsDTO
    {
        /// <summary>
        /// Có xáo trộn câu hỏi sau khi kết hợp không
        /// </summary>
        public bool Shuffle { get; set; } = true;

        /// <summary>
        /// Có bao gồm đáp án hay không
        /// </summary>
        public bool IncludeAnswers { get; set; } = false;

        /// <summary>
        /// Có bao gồm giải thích hay không
        /// </summary>
        public bool IncludeExplanations { get; set; } = false;
    }

    /// <summary>
    /// Kết quả từ API trộn câu hỏi
    /// </summary>
    public class QuestionMixResultDTO
    {
        /// <summary>
        /// Tổng số câu hỏi được yêu cầu
        /// </summary>
        public int RequestedCount { get; set; }

        /// <summary>
        /// Tổng số câu hỏi thực tế lấy được
        /// </summary>
        public int ActualCount { get; set; }

        /// <summary>
        /// Tổng điểm của bộ câu hỏi
        /// </summary>
        public decimal TotalScore { get; set; }

        /// <summary>
        /// Thống kê theo loại câu hỏi
        /// </summary>
        public List<QuestionTypeStatDTO> TypeStats { get; set; }

        /// <summary>
        /// Thống kê theo môn học
        /// </summary>
        public List<SubjectStatDTO> SubjectStats { get; set; }

        /// <summary>
        /// Danh sách câu hỏi đã trộn
        /// </summary>
        public List<QuestionDetailDTO> Questions { get; set; }
    }

    /// <summary>
    /// Thống kê theo loại câu hỏi
    /// </summary>
    public class QuestionTypeStatDTO
    {
        public int Type { get; set; }
        public string TypeName { get; set; }
        public int Count { get; set; }
        public decimal TotalScore { get; set; }
        public double Percentage { get; set; }
    }

    /// <summary>
    /// Thống kê theo môn học
    /// </summary>
    public class SubjectStatDTO
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; }
        public int Count { get; set; }
        public decimal TotalScore { get; set; }
        public double Percentage { get; set; }
    }
}