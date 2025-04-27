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
        [Required]
        public int SubjectId { get; set; }

        [Required]
        [Range(1, 100)]
        public int QuestionCount { get; set; }

        public int LevelId { get; set; }

        public List<int> QuestionTypes { get; set; }

        public List<int> ChapterIds { get; set; }

        public string Topic { get; set; }
    }
}