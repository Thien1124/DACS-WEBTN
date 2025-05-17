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
                        <p>Mã này sẽ hết hạn sau 15 phút.</p>
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
                            $"Mã này sẽ hết hạn sau 15 phút.\n\n" +
                            $"Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                            $"Trân trọng,\nĐội ngũ ExamDG";

            await SendEmailAsync(email, subject, htmlBody, textBody);
        }

        public async Task SendScoreVerificationEmailAsync(string studentEmail, string studentName, 
            int examResultId, string examTitle, decimal currentScore, string verificationReason)
        {
            string subject = "Yêu Cầu Xác Minh Điểm Số - ExamDG";

            string htmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                        <h2 style='color: #2a76d2; text-align: center;'>Yêu Cầu Xác Minh Điểm Số</h2>
                        
                        <div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #2a76d2; margin: 20px 0;'>
                            <p><strong>Học sinh:</strong> {studentName}</p>
                            <p><strong>Bài thi:</strong> {examTitle}</p>
                            <p><strong>Mã kết quả:</strong> #{examResultId}</p>
                            <p><strong>Điểm hiện tại:</strong> {currentScore}</p>
                        </div>
                        
                        <p><strong>Lý do yêu cầu xác minh:</strong></p>
                        <p style='padding: 10px; background-color: #f8f9fa; border-radius: 5px;'>{verificationReason}</p>
                        
                        <p>Vui lòng kiểm tra điểm số của học sinh và phản hồi trong thời gian sớm nhất.</p>
                        <p>Để xem chi tiết bài làm của học sinh, vui lòng đăng nhập vào hệ thống và truy cập kết quả bài thi.</p>
                        
                        <div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;'>
                            <p style='margin: 0;'>Trân trọng,<br>Hệ thống ExamDG</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            string textBody = $"Yêu Cầu Xác Minh Điểm Số\n\n" +
                            $"Học sinh: {studentName}\n" +
                            $"Bài thi: {examTitle}\n" +
                            $"Mã kết quả: #{examResultId}\n" +
                            $"Điểm hiện tại: {currentScore}\n\n" +
                            $"Lý do yêu cầu xác minh:\n{verificationReason}\n\n" +
                            $"Vui lòng kiểm tra điểm số của học sinh và phản hồi trong thời gian sớm nhất.\n\n" +
                            $"Trân trọng,\nHệ thống ExamDG";

            await SendEmailAsync(studentEmail, subject, htmlBody, textBody);
        }

        public async Task SendScoreVerificationResponseEmailAsync(string studentEmail, string studentName, 
            int examResultId, string examTitle, decimal oldScore, decimal newScore, string responseMessage)
        {
            string subject = "Kết Quả Xác Minh Điểm Số - ExamDG";
            bool scoreChanged = oldScore != newScore;

            string htmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                        <h2 style='color: #2a76d2; text-align: center;'>Kết Quả Xác Minh Điểm Số</h2>
                        
                        <p>Xin chào {studentName},</p>
                        <p>Chúng tôi đã hoàn thành việc xác minh điểm số cho bài thi của bạn.</p>
                        
                        <div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #2a76d2; margin: 20px 0;'>
                            <p><strong>Bài thi:</strong> {examTitle}</p>
                            <p><strong>Mã kết quả:</strong> #{examResultId}</p>
                            <p><strong>Điểm cũ:</strong> {oldScore}</p>
                            <p><strong>Điểm mới:</strong> <span style='color: {(scoreChanged ? "#28a745" : "#333")};'>{newScore}</span></p>
                        </div>
                        
                        <p><strong>Phản hồi từ giáo viên:</strong></p>
                        <p style='padding: 10px; background-color: #f8f9fa; border-radius: 5px;'>{responseMessage}</p>
                        
                        <p>Nếu bạn có thắc mắc khác, vui lòng liên hệ với giáo viên của mình.</p>
                        
                        <div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;'>
                            <p style='margin: 0;'>Trân trọng,<br>Hệ thống ExamDG</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            string textBody = $"Kết Quả Xác Minh Điểm Số\n\n" +
                            $"Xin chào {studentName},\n\n" +
                            $"Chúng tôi đã hoàn thành việc xác minh điểm số cho bài thi của bạn.\n\n" +
                            $"Bài thi: {examTitle}\n" +
                            $"Mã kết quả: #{examResultId}\n" +
                            $"Điểm cũ: {oldScore}\n" +
                            $"Điểm mới: {newScore}\n\n" +
                            $"Phản hồi từ giáo viên:\n{responseMessage}\n\n" +
                            $"Nếu bạn có thắc mắc khác, vui lòng liên hệ với giáo viên của mình.\n\n" +
                            $"Trân trọng,\nHệ thống ExamDG";

            await SendEmailAsync(studentEmail, subject, htmlBody, textBody);
        }
    }
}