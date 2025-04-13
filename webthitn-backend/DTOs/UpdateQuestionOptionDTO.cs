/// <summary>
/// DTO để cập nhật hoặc thêm mới đáp án
/// </summary>
public class UpdateQuestionOptionDTO
{
    /// <summary>
    /// ID của đáp án (nếu là 0 thì thêm mới)
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
    /// Ký hiệu tùy chỉnh (a, b, c, d hoặc khác) cho đáp án
    /// </summary>
    public string Label { get; set; }

    /// <summary>
    /// Giải thích cho đáp án
    /// </summary>
    public string Explanation { get; set; }

    /// <summary>
    /// Đánh dấu nếu đây là một mục Đúng-Sai trong câu hỏi đúng-sai nhiều ý
    /// </summary>
    public bool IsPartOfTrueFalseGroup { get; set; }

    /// <summary>
    /// Nhóm đáp án (dùng cho câu hỏi đúng-sai nhiều ý)
    /// </summary>
    public int? GroupId { get; set; }

    /// <summary>
    /// Mức điểm cho đáp án này (0-100%)
    /// </summary>
    public int ScorePercentage { get; set; } = 100;
}
