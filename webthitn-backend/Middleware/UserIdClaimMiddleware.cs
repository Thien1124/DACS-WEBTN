using System.Security.Claims;

/// <summary>
/// Middleware để xử lý authentication claim
/// </summary>
public class UserIdClaimMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserIdClaimMiddleware> _logger;

    public UserIdClaimMiddleware(RequestDelegate next, ILogger<UserIdClaimMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Chỉ xử lý khi user đã được xác thực
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            try
            {
                // Tìm userId từ các claim phổ biến
                var userIdClaim = context.User.FindFirst("userId") ??
                                  context.User.FindFirst("UserId") ??
                                  context.User.FindFirst("sub") ??
                                  context.User.FindFirst(ClaimTypes.NameIdentifier);

                // Nếu tìm thấy và có thể parse thành số
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    // Đảm bảo claim userId tồn tại và là số nguyên
                    var identity = context.User.Identity as ClaimsIdentity;
                    if (identity != null)
                    {
                        // Xóa claim userId cũ nếu có
                        var existingClaim = identity.FindFirst("userId");
                        if (existingClaim != null)
                        {
                            identity.RemoveClaim(existingClaim);
                        }

                        // Thêm claim userId mới
                        identity.AddClaim(new Claim("userId", userId.ToString()));
                    }
                }
                else
                {
                    _logger.LogWarning("Không tìm thấy userId hợp lệ trong claims");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý userId claim");
            }
        }

        // Tiếp tục pipeline
        await _next(context);
    }
}

