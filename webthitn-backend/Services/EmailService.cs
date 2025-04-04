using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace webthitn_backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string recipient, string subject, string htmlMessage, string textMessage = null)
        {
            var email = new MimeMessage();

            // Thông tin người gửi
            email.From.Add(new MailboxAddress(
                _configuration["EmailSettings:SenderName"],
                _configuration["EmailSettings:SenderEmail"]));

            // Thêm người nhận
            email.To.Add(MailboxAddress.Parse(recipient));

            // Chủ đề email
            email.Subject = subject;

            // Nội dung email (hỗ trợ cả HTML và plain text)
            var builder = new BodyBuilder();
            builder.HtmlBody = htmlMessage;

            if (textMessage != null)
                builder.TextBody = textMessage;

            email.Body = builder.ToMessageBody();

            try
            {
                // Tạo kết nối SMTP
                using (var client = new SmtpClient())
                {
                    // Kết nối đến máy chủ SMTP
                    await client.ConnectAsync(
                        _configuration["EmailSettings:SmtpServer"],
                        int.Parse(_configuration["EmailSettings:SmtpPort"]),
                        SecureSocketOptions.StartTls);

                    // Xác thực với máy chủ SMTP
                    await client.AuthenticateAsync(
                        _configuration["EmailSettings:Username"],
                        _configuration["EmailSettings:Password"]);

                    // Gửi email
                    await client.SendAsync(email);

                    // Ngắt kết nối
                    await client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ và ghi log
                throw new Exception($"Lỗi khi gửi email: {ex.Message}", ex);
            }
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetCode)
        {
            string subject = "Đặt Lại Mật Khẩu - ExamDG";

            string htmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                        <h2 style='color: #2a76d2; text-align: center;'>Đặt Lại Mật Khẩu</h2>
                        <p>Xin chào,</p>
                        <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu tài khoản ExamDG của bạn.</p>
                        <p>Mã đặt lại mật khẩu của bạn là: <strong style='font-size: 18px; color: #2a76d2;'>{resetCode}</strong></p>
                        <p>Mã này sẽ hết hạn sau 24 giờ.</p>
                        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        <div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;'>
                            <p style='margin: 0;'>Trân trọng,<br>Đội ngũ ExamDG</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            string textBody = $"Đặt Lại Mật Khẩu\n\n" +
                            $"Xin chào,\n\n" +
                            $"Mã đặt lại mật khẩu của bạn là: {resetCode}\n\n" +
                            $"Mã này sẽ hết hạn sau 24 giờ.\n\n" +
                            $"Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                            $"Trân trọng,\nĐội ngũ ExamDG";

            await SendEmailAsync(email, subject, htmlBody, textBody);
        }
    }
}