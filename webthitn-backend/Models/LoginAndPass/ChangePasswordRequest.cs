using System.ComponentModel.DataAnnotations;

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; }

    [Required]
    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
    public string NewPassword { get; set; }
}