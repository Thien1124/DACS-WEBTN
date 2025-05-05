using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using webthitn_backend.Models;

namespace webthitn_backend.Middlewares
{
    public class AdminAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AdminAuthorizationMiddleware> _logger;

        public AdminAuthorizationMiddleware(RequestDelegate next, ILogger<AdminAuthorizationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
        {
            // Kiểm tra xem đường dẫn có thuộc các endpoint cần bảo vệ không
            if (IsProtectedEndpoint(context.Request.Path))
            {
                _logger.LogInformation($"Đang kiểm tra quyền truy cập đến endpoint được bảo vệ: {context.Request.Path}");

                // Lấy ID người dùng từ claim (đã xác thực bởi JWT hoặc cơ chế auth khác)
                var userIdClaim = context.User.FindFirst("userId") ?? context.User.FindFirst("UserId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    _logger.LogWarning("Không thể xác định ID người dùng từ token");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Không xác định được người dùng" });
                    return;
                }

                // Kiểm tra vai trò của người dùng
                var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng với ID: {userId}");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Không tìm thấy thông tin người dùng" });
                    return;
                }

                // Kiểm tra xem người dùng có quyền Admin hoặc Teacher không
                if (user.Role != "Admin" && user.Role != "Teacher")
                {
                    _logger.LogWarning($"Người dùng {user.Username} không có quyền truy cập endpoint: {context.Request.Path}");
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        message = "Bạn không có quyền truy cập chức năng này",
                        details = "Chỉ quản trị viên và giáo viên mới có quyền thực hiện thao tác này"
                    });
                    return;
                }

                // Với một số endpoint chỉ dành riêng cho Admin
                if (IsAdminOnlyEndpoint(context.Request.Path) && user.Role != "Admin")
                {
                    _logger.LogWarning($"Người dùng {user.Username} không có quyền Admin để truy cập endpoint: {context.Request.Path}");
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        message = "Bạn không có quyền truy cập chức năng này",
                        details = "Chỉ quản trị viên mới có quyền thực hiện thao tác này"
                    });
                    return;
                }

                _logger.LogInformation($"Người dùng {user.Username} với vai trò {user.Role} được phép truy cập: {context.Request.Path}");
            }

            // Tiếp tục chuỗi middleware
            await _next(context);
        }

        private bool IsProtectedEndpoint(PathString path)
        {
            string pathStr = path.ToString().ToLower();

            // Danh sách các endpoint được bảo vệ
            return pathStr.Contains("/api/reports") ||
                   pathStr.Contains("/api/students/export") ||
                   pathStr.Contains("/api/scores/export") ||
                   pathStr.Contains("/api/official-exams") ||
                   pathStr.Contains("/api/exams/assign") ||
                   pathStr.Contains("/api/admin/") ||
                   pathStr.Contains("/api/dashboard");
        }

        private bool IsAdminOnlyEndpoint(PathString path)
        {
            string pathStr = path.ToString().ToLower();

            // Danh sách các endpoint chỉ dành cho Admin
            return pathStr.Contains("/api/admin/") ||
                   pathStr.Contains("/api/dashboard/system") ||
                   pathStr.Contains("/api/users/create-teacher");
        }
    }
}