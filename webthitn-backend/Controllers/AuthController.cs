using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using webthitn_backend.Models;
using BCrypt.Net;

namespace webthitn_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly Models.ApplicationDbContext _context;

        public AuthController(IConfiguration configuration, Models.ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        // Đăng ký người dùng
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            // Kiểm tra xem người dùng đã tồn tại chưa
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
            if (existingUser != null)
            {
                return Conflict("User already exists!");
            }

            // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            // Lưu người dùng vào cơ sở dữ liệu
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Registration successful!");
        }

        // Đăng nhập và lấy JWT token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User user)
        {
            // Kiểm tra tài khoản người dùng trong cơ sở dữ liệu
            var storedUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
            if (storedUser == null || !BCrypt.Net.BCrypt.Verify(user.Password, storedUser.Password))
            {
                return Unauthorized("Invalid credentials");
            }

            // Tạo JWT token khi đăng nhập thành công
            var token = GenerateJwtToken(storedUser);
            return Ok(new { Token = token });
        }

        // Tạo JWT token
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, user.Username),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])); // Sử dụng khóa từ appsettings.json
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}

