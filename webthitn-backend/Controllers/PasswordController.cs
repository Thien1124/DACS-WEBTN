using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using webthitn_backend.Models;
using webthitn_backend.Services;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using webthitn_backend.Models.LoginAndPass;

namespace webthitn_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PasswordController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly ILogger<PasswordController> _logger;

        public PasswordController(
            IConfiguration configuration,
            ApplicationDbContext context,
            EmailService emailService,
            ILogger<PasswordController> logger)
        {
            _configuration = configuration;
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        // 1. Endpoint quên mật khẩu - gửi email với mã reset
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            _logger.LogInformation($"Yêu cầu đặt lại mật khẩu cho email: {request.Email}");

            // Kiểm tra xem email có tồn tại trong hệ thống không
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                _logger.LogWarning($"Email không tồn tại: {request.Email}");
                // Không nên tiết lộ là email không tồn tại vì lý do bảo mật
                return Ok(new { message = "Nếu email tồn tại, một hướng dẫn đặt lại mật khẩu sẽ được gửi." });
            }

            // Tạo mã reset password ngẫu nhiên
            var resetCode = GenerateResetCode();
            var expiryTime = DateTime.UtcNow.AddHours(24);

            _logger.LogInformation($"Mã reset được tạo cho user {user.Username}: {resetCode}, hết hạn: {expiryTime}");

            // Lưu mã và thời gian hết hạn vào database
            user.ResetPasswordCode = resetCode;
            user.ResetPasswordExpiry = expiryTime;
            await _context.SaveChangesAsync();

            // Gửi email
            try
            {
                await _emailService.SendPasswordResetEmailAsync(user.Email, resetCode);
                _logger.LogInformation($"Email đặt lại mật khẩu đã được gửi đến: {user.Email}");
                return Ok(new { message = "Email đặt lại mật khẩu đã được gửi." });
            }
            catch (Exception ex)
            {
                // Log lỗi
                _logger.LogError($"Lỗi gửi email: {ex.Message}");
                return StatusCode(500, new { message = "Không thể gửi email.", error = ex.Message });
            }
        }

        // 2. Endpoint đặt lại mật khẩu - sử dụng mã đã gửi qua email
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            _logger.LogInformation($"Yêu cầu đặt lại mật khẩu với mã: {request.ResetCode} cho email: {request.Email}");

            // Tìm người dùng với mã reset
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == request.Email &&
                u.ResetPasswordCode == request.ResetCode &&
                u.ResetPasswordExpiry > DateTime.UtcNow);

            if (user == null)
            {
                _logger.LogWarning("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");

                // Thử tìm người dùng để debug
                var userByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (userByEmail != null)
                {
                    _logger.LogInformation($"User tồn tại, nhưng không khớp điều kiện. Code: {userByEmail.ResetPasswordCode}, Expiry: {userByEmail.ResetPasswordExpiry}, Hiện tại: {DateTime.UtcNow}");
                }

                return BadRequest(new { message = "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." });
            }

            // Cập nhật mật khẩu mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // Đặt giá trị rỗng thay vì null để tránh lỗi SQL
            user.ResetPasswordCode = string.Empty;  // Sử dụng chuỗi rỗng thay vì null
            user.ResetPasswordExpiry = null;        // Giữ null cho datetime nếu DB cho phép

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Đặt lại mật khẩu thành công cho user: {user.Username}");
                return Ok(new { message = "Mật khẩu đã được đặt lại thành công." });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError($"Lỗi cập nhật DB: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Lỗi khi cập nhật mật khẩu trong cơ sở dữ liệu." });
            }
        }

        // 3. Endpoint thay đổi mật khẩu (yêu cầu đăng nhập)
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // Debug thông tin token và claims
            _logger.LogInformation("Bắt đầu xử lý yêu cầu đổi mật khẩu");
            _logger.LogInformation($"Authorization header present: {Request.Headers.ContainsKey("Authorization")}");

            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                _logger.LogInformation($"Authorization header: {authHeader.FirstOrDefault()?.Substring(0, 20)}...");
            }

            _logger.LogInformation("Claims trong token:");
            foreach (var claim in User.Claims)
            {
                _logger.LogInformation($"Claim: {claim.Type} = {claim.Value}");
            }

            // Lấy username từ token JWT
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation($"Username trích xuất từ token: {username ?? "null"}");

            // Nếu không tìm thấy username trong claim tiêu chuẩn, thử tìm trong claim 'sub'
            if (string.IsNullOrEmpty(username))
            {
                username = User.FindFirst("sub")?.Value;
                _logger.LogInformation($"Username từ claim 'sub': {username ?? "null"}");
            }

            if (string.IsNullOrEmpty(username))
            {
                _logger.LogWarning("Không thể xác định người dùng từ token");
                return Unauthorized(new { message = "Không thể xác định người dùng." });
            }

            // Tìm người dùng trong DB
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
            {
                _logger.LogWarning($"Không tìm thấy người dùng trong DB: {username}");
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            _logger.LogInformation($"Đã tìm thấy người dùng: {user.Username}, Email: {user.Email}");

            // Xác thực mật khẩu hiện tại
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            {
                _logger.LogWarning($"Mật khẩu hiện tại không chính xác cho user: {username}");
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
            }

            // Cập nhật mật khẩu mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Mật khẩu đã được thay đổi thành công cho user: {username}");
                return Ok(new { message = "Mật khẩu đã được thay đổi thành công." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật mật khẩu: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật mật khẩu.", error = ex.Message });
            }
        }

        // Phương thức hỗ trợ - Tạo mã xác nhận ngẫu nhiên
        private string GenerateResetCode()
        {
            // Tạo mã xác nhận gồm 6 chữ số
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}