namespace webthitn_backend.Models.LoginAndPass
{
    public class PasswordReset
    {
        public int Id { get; set; }
        public string UserEmail { get; set; }
        public string ResetToken { get; set; }
        public DateTime ExpirationTime { get; set; }
    }

}
