using System.ComponentModel.DataAnnotations;

/// <summary>
/// DTO để cập nhật đáp án
/// </summary>
public class UpdateQuestionOptionDTO
{
    /// <summary>
    /// ID của đáp án (nếu cập nhật đáp án hiện có, không có ID sẽ tạo mới)
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
    /// Giá trị ghép đôi (cho câu hỏi ghép đôi)
    /// </summary>
    public string MatchingValue { get; set; } = "";

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
    [Range(0, 100, ErrorMessage = "Phần trăm điểm phải từ 0 đến 100")]
    public int ScorePercentage { get; set; }
}