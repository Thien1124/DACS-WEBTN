// DTO cho phê duyệt đề thi
public class ApproveExamDTO
{
    /// <summary>
    /// Trạng thái phê duyệt (true: duyệt, false: từ chối)
    /// </summary>
    public bool Approved { get; set; }

    /// <summary>
    /// Nhận xét của người duyệt
    /// </summary>
    public string Comment { get; set; }
}