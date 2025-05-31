using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using webthitn_backend.Models;
using webthitn_backend.DTOs;
using webthitn_backend.Models.LoginAndPass;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IConfiguration configuration,
            ApplicationDbContext context,
            ILogger<AuthController> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        // Đăng ký người dùng
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
        {
            try
            {
                // Kiểm tra xem người dùng đã tồn tại chưa (theo username hoặc email)
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == registerRequest.Username);
                if (existingUser != null)
                {
                    return Conflict(new { message = "Tài khoản đã tồn tại!" });
                }

                var existingEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerRequest.Email);
                if (existingEmail != null)
                {
                    return Conflict(new { message = "Email đã được sử dụng!" });
                }
                if (registerRequest.Password != registerRequest.ConfirmPassword)
                {
                    return BadRequest("Mật khẩu và xác nhận mật khẩu không khớp.");
                }

                // Tạo người dùng mới
                var user = new User
                {
                    FullName = registerRequest.FullName,
                    Username = registerRequest.Username,
                    Email = registerRequest.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
                    PhoneNumber = registerRequest.PhoneNumber,
                    Role = "Student", // Mặc định là Student thay vì User
                    School = "Chưa cập nhật", // Thêm giá trị mặc định
                    Grade = "Chưa cập nhật", // Thêm giá trị mặc định
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                // Lưu người dùng vào cơ sở dữ liệu
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Tạo token để đăng nhập luôn
                var token = GenerateJwtToken(user, false); // Không ghi nhớ khi đăng ký

                return Ok(new
                {
                    message = "Đăng ký thành công!",
                    token = token,
                    user = new UserDTO
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FullName = user.FullName,
                        PhoneNumber = user.PhoneNumber,
                        CreatedAt = user.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Đăng ký thất bại: {ex.Message}");
                _logger.LogError($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner Exception: {ex.InnerException.Message}");
                    _logger.LogError($"Inner Stack Trace: {ex.InnerException.StackTrace}");
                }
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng ký tài khoản." });
            }
        }


        // Đăng nhập và lấy JWT token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                _logger.LogInformation($"Đang thực hiện đăng nhập cho: {loginRequest.UsernameOrEmail}, RememberMe: {loginRequest.RememberMe}");

                // Kiểm tra tài khoản người dùng trong cơ sở dữ liệu dựa trên username hoặc email
                var user = await _context.Users.FirstOrDefaultAsync(u =>
                    u.Username == loginRequest.UsernameOrEmail || u.Email == loginRequest.UsernameOrEmail);

                if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password))
                {
                    _logger.LogWarning($"Đăng nhập thất bại: thông tin không hợp lệ cho user {loginRequest.UsernameOrEmail}");
                    return Unauthorized(new { message = "Thông tin đăng nhập không hợp lệ" });
                }

                // Kiểm tra trạng thái tài khoản
                if (!user.IsActive)
                {
                    _logger.LogWarning($"Đăng nhập thất bại: tài khoản {user.Username} bị khóa");
                    return Unauthorized(new { message = "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." });
                }

                // Cập nhật thời gian đăng nhập cuối
                user.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Tạo JWT token khi đăng nhập thành công với thời hạn phụ thuộc vào Remember Me
                var token = GenerateJwtToken(user, loginRequest.RememberMe);

                _logger.LogInformation($"Đăng nhập thành công: {user.Username}, RememberMe: {loginRequest.RememberMe}");

                return Ok(new
                {
                    token = token,
                    user = new UserDTO
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FullName = user.FullName,
                        PhoneNumber = user.PhoneNumber,
                        Role = user.Role,
                        LastLogin = user.LastLogin,
                        CreatedAt = user.CreatedAt
                    },
                    rememberMe = loginRequest.RememberMe,
                    currentDate = DateTime.UtcNow // Thông tin thời gian hiện tại
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Đăng nhập thất bại: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng nhập." });
            }
        }

        // API xác minh token
        [HttpGet("verify-token")]
        public IActionResult VerifyToken()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();
                if (authHeader == null || !authHeader.StartsWith("Bearer "))
                {
                    return Unauthorized(new { message = "Token không hợp lệ" });
                }

                var token = authHeader.Substring("Bearer ".Length);
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero
                }, out var validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var username = jwtToken.Claims.First(x => x.Type == "sub").Value;
                var email = jwtToken.Claims.First(x => x.Type == "email").Value;

                // Kiểm tra xem token có được tạo với RememberMe hay không
                var rememberMeClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "rememberMe")?.Value;
                bool isRemembered = rememberMeClaim != null && bool.Parse(rememberMeClaim);

                return Ok(new
                {
                    valid = true,
                    username = username,
                    email = email,
                    rememberMe = isRemembered,
                    currentDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    currentUser = username // Hiển thị username hiện tại (Thien1124)
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Xác thực token thất bại: {ex.Message}");
                return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn" });
            }
        }

        // Tạo JWT token với thời gian hết hạn dài hơn nếu rememberMe = true
        private string GenerateJwtToken(User user, bool rememberMe)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.Role ?? "User"),
                new Claim("userId", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("rememberMe", rememberMe.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Thời gian hết hạn token luôn là 15 phút
            DateTime expiresTime = DateTime.Now.AddMinutes(15);

            _logger.LogInformation($"Tạo token cho {user.Username} với thời hạn 15 phút");

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiresTime,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}