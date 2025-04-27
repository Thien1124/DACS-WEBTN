using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    public class OptionImportDTO
    {
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
        public string Label { get; set; }
        public int? GroupId { get; set; }
        public int? ScorePercentage { get; set; }
    }

    public class OptionExportDTO
    {
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
        public string Label { get; set; }
        public int GroupId { get; set; }
        public int ScorePercentage { get; set; }
    }

    public class ExportQuestionsDTO
    {
        public int? SubjectId { get; set; }
        public int? ChapterId { get; set; }
        public int? LevelId { get; set; }
        public int? QuestionType { get; set; }
        public string Topic { get; set; }
        public string Search { get; set; }
        public List<int> QuestionIds { get; set; }
        public bool? IncludeOptions { get; set; } = true;
        public bool? IncludeExplanation { get; set; } = true;
        public bool? IncludeMetadata { get; set; } = false;
        public string Format { get; set; } = "xlsx";
        public int? LimitRows { get; set; } = 1000;
    }
}