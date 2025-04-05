namespace webthitn_backend.Models.LoginAndPass
{
    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string ResetCode { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
