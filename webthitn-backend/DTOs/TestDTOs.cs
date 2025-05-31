using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cho việc tạo đề thi theo cấu trúc độ khó
    /// </summary>
    public class CreateStructuredTestDTO
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }

        [Required]
        public int SubjectId { get; set; }

        [Required]
        public int ExamTypeId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Duration { get; set; } // Thời gian làm bài (phút)

        [Required]
        [Range(1, int.MaxValue)]
        public int TotalScore { get; set; } // Tổng điểm

        public decimal? PassScore { get; set; } // Điểm đạt yêu cầu

        public bool IsPublic { get; set; } = true; // This is still used in the DTO, even if Exam doesn't have this property

        public bool ShuffleQuestions { get; set; } = true;

        public bool? ShowResult { get; set; } = true;

        public bool? ShowAnswers { get; set; } = false;

        public bool? AutoGradeShortAnswer { get; set; } = true;

        [Required]
        public List<TestCriterionDTO> Criteria { get; set; } // Tiêu chí phân bổ câu hỏi
    }

    /// <summary>
    /// DTO cho tiêu chí phân bổ câu hỏi
    /// </summary>
    public class TestCriterionDTO
    {
        public int LevelId { get; set; } // ID cấp độ

        public int QuestionType { get; set; } // Loại câu hỏi

        public int ChapterId { get; set; } // ID chương

        public string Topic { get; set; } // Chủ đề

        [Required]
        [Range(1, int.MaxValue)]
        public int Count { get; set; } // Số lượng câu hỏi

        [Required]
        [Range(0.1, 100)]
        public decimal Score { get; set; } // Điểm cho mỗi câu
    }

    /// <summary>
    /// DTO cho việc tạo đề ôn tập tùy chọn
    /// </summary>
    public class CreatePracticeTestDTO
    {
        [StringLength(200, ErrorMessage = "Tiêu đề không được vượt quá 200 ký tự")]
        public string? Title { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "ID môn học phải lớn hơn 0")]
        public int SubjectId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Số lượng câu hỏi phải nằm trong khoảng 1-100")]
        public int QuestionCount { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ID cấp độ phải lớn hơn 0")]
        public int? LevelId { get; set; }

        public List<int>? QuestionTypes { get; set; }

        public List<int>? ChapterIds { get; set; }

        [StringLength(500, ErrorMessage = "Chủ đề không được vượt quá 500 ký tự")]
        public string? Topic { get; set; }
    }
}