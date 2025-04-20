// DTO cho cập nhật trạng thái đề thi
public class UpdateExamStatusDTO
{
    /// <summary>
    /// Trạng thái kích hoạt của đề thi (true: công khai, false: nháp)
    /// </summary>
    public bool IsActive { get; set; }
}
