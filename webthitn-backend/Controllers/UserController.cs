using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models.Applications;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserController> _logger;

        public UserController(ApplicationDbContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // 1. Lấy thông tin người dùng hiện tại
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { message = "Không thể xác định người dùng." });
            }

            var user = await _context.Users
                .Where(u => u.Username == username)
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    CreatedAt = u.CreatedAt,
                    LastLogin = u.LastLogin
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            // Cập nhật thời gian đăng nhập cuối
            var userEntity = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (userEntity != null)
            {
                userEntity.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(user);
        }

        // 2. Cập nhật thông tin người dùng
        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDTO model)
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { message = "Không thể xác định người dùng." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            // Cập nhật thông tin người dùng
            if (!string.IsNullOrEmpty(model.FullName))
                user.FullName = model.FullName;

            if (!string.IsNullOrEmpty(model.PhoneNumber))
                user.PhoneNumber = model.PhoneNumber;

            if (!string.IsNullOrEmpty(model.Email) && model.Email != user.Email)
            {
                // Kiểm tra email đã tồn tại chưa
                var emailExists = await _context.Users.AnyAsync(u => u.Email == model.Email && u.Id != user.Id);
                if (emailExists)
                {
                    return BadRequest(new { message = "Email đã được sử dụng." });
                }
                user.Email = model.Email;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thông tin thành công.",
                user = new UserDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt,
                    LastLogin = user.LastLogin,
                    UpdatedAt = user.UpdatedAt
                }
            });
        }

        // 3. Admin: Lấy danh sách người dùng
        [Authorize(Roles = "Admin")]
        [HttpGet("list")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var totalCount = await _context.Users.CountAsync();

            var users = await _context.Users
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    CreatedAt = u.CreatedAt,
                    LastLogin = u.LastLogin,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                data = users
            });
        }

        // 4. Admin: Đổi vai trò người dùng
        [Authorize(Roles = "Admin")]
        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDTO model)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            // Cập nhật vai trò
            user.Role = model.Role;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật vai trò thành công." });
        }

        // 5. Admin: Khóa/mở khóa tài khoản người dùng
        [Authorize(Roles = "Admin")]
        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusDTO model)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            // Cập nhật trạng thái
            user.IsActive = model.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = model.IsActive ? "Đã kích hoạt tài khoản người dùng." : "Đã khóa tài khoản người dùng." });
        }

        // 6. Admin: Xóa người dùng
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa người dùng thành công." });
        }
        [HttpGet("system-info")]
        public IActionResult GetSystemInfo()
        {
            return Ok(new
            {
                currentDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                currentUser = User.Identity.IsAuthenticated ? User.FindFirst(ClaimTypes.NameIdentifier)?.Value : null
            });
        }
    }
}