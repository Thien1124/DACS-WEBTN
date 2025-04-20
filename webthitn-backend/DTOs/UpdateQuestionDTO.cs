using System.ComponentModel.DataAnnotations;

/// <summary>
/// DTO để cập nhật câu hỏi
/// </summary>
public class UpdateQuestionDTO
{
    /// <summary>
    /// Nội dung câu hỏi
    /// </summary>
    public string Content { get; set; }

    /// <summary>
    /// Giải thích cho câu hỏi
    /// </summary>
    public string Explanation { get; set; }

    /// <summary>
    /// ID môn học
    /// </summary>
    public int? SubjectId { get; set; }

    /// <summary>
    /// ID chương
    /// </summary>
    public int? ChapterId { get; set; }

    /// <summary>
    /// ID mức độ câu hỏi
    /// </summary>
    public int? QuestionLevelId { get; set; }

    /// <summary>
    /// Tags của câu hỏi, phân cách bởi dấu phẩy
    /// </summary>
    public string Tags { get; set; }

    /// <summary>
    /// Thời gian làm câu hỏi gợi ý (giây)
    /// </summary>
    public int? SuggestedTime { get; set; }

    /// <summary>
    /// Điểm mặc định
    /// </summary>
    [Range(0.1, 10, ErrorMessage = "Điểm mặc định phải từ 0.1 đến 10")]
    public decimal? DefaultScore { get; set; }

    /// <summary>
    /// Trạng thái kích hoạt
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Cấu hình tính điểm cho câu hỏi đúng-sai nhiều ý (JSON)
    /// </summary>
    public string ScoringConfig { get; set; }

    /// <summary>
    /// Cấu hình cho câu hỏi trả lời ngắn (JSON)
    /// </summary>
    public string ShortAnswerConfig { get; set; }

    /// <summary>
    /// Danh sách các đáp án (để cập nhật)
    /// </summary>
    public List<UpdateQuestionOptionDTO> Options { get; set; } = new List<UpdateQuestionOptionDTO>();
}

