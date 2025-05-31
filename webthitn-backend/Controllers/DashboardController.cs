using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using webthitn_backend.DTOs;
using webthitn_backend.Services;

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// API cung cấp dữ liệu Dashboard CHỈ cho học sinh
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy dữ liệu Dashboard CHỈ cho học sinh
        /// </summary>
        /// <returns>Dữ liệu Dashboard của học sinh</returns>
        /// <response code="200">Trả về dữ liệu Dashboard thành công</response>
        /// <response code="401">Người dùng chưa đăng nhập</response>
        /// <response code="403">Chỉ học sinh mới có thể truy cập</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpGet]
        [Authorize(Roles = "Student")] // ✅ CHỈ CHO STUDENT
        [ProducesResponseType(typeof(DashboardResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("Không thể xác định ID người dùng từ token");
                    return Unauthorized(new { message = "Không thể xác định người dùng" });
                }

                _logger.LogInformation($"Getting dashboard for student ID: {userId}");

                // ✅ CHỈ GỌI STUDENT DASHBOARD
                var dashboardData = await _dashboardService.GetStudentDashboardAsync(userId);

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy dữ liệu Dashboard: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy dữ liệu Dashboard", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thống kê nhanh CHỈ cho học sinh
        /// </summary>
        /// <returns>Thống kê tổng quan của học sinh</returns>
        /// <response code="200">Trả về thống kê thành công</response>
        /// <response code="401">Người dùng chưa đăng nhập</response>
        /// <response code="403">Chỉ học sinh mới có thể truy cập</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpGet("quick-stats")]
        [Authorize(Roles = "Student")] // ✅ CHỈ CHO STUDENT
        [ProducesResponseType(typeof(UserStatsDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetQuickStats()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Không thể xác định người dùng" });
                }

                var dashboardData = await _dashboardService.GetStudentDashboardAsync(userId);
                return Ok(dashboardData.Stats);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy thống kê nhanh: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thống kê" });
            }
        }

        /// <summary>
        /// Refresh dữ liệu Dashboard CHỈ cho học sinh
        /// </summary>
        /// <returns>Dữ liệu Dashboard mới nhất</returns>
        /// <response code="200">Refresh thành công</response>
        /// <response code="401">Người dùng chưa đăng nhập</response>
        /// <response code="403">Chỉ học sinh mới có thể truy cập</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpPost("refresh")]
        [Authorize(Roles = "Student")] // ✅ CHỈ CHO STUDENT
        [ProducesResponseType(typeof(DashboardResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RefreshDashboard()
        {
            return await GetDashboard();
        }

        // ✅ XÓA TẤT CẢ ENDPOINTS KHÁC CHO ADMIN/TEACHER
    }
}