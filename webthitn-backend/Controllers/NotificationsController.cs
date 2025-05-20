using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Models.Notifications;
using webthitn_backend.Services;

namespace webthitn_backend.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly ILogger<NotificationsController> _logger;
        private readonly IConfiguration _configuration;

        public NotificationsController(
            ApplicationDbContext context,
            EmailService emailService,
            ILogger<NotificationsController> logger,
            IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Gửi thông báo qua email
        /// </summary>
        /// <param name="notificationDto">Thông tin thông báo email</param>
        /// <returns>Kết quả gửi thông báo</returns>
        [HttpPost("email")]
        [Authorize(Roles = "Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SendEmailNotification([FromBody] EmailNotificationDTO notificationDto)
        {
            try
            {
                _logger.LogInformation("Bắt đầu gửi thông báo qua email");

                if (string.IsNullOrEmpty(notificationDto.Recipients))
                {
                    return BadRequest(new { Success = false, Message = "Danh sách người nhận không được để trống" });
                }

                // Xử lý danh sách email người nhận
                var recipients = notificationDto.Recipients
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(email => email.Trim())
                    .Where(email => !string.IsNullOrWhiteSpace(email))
                    .ToList();

                // Validate each email individually
                var invalidEmails = recipients
                    .Where(email => !IsValidEmail(email))
                    .ToList();

                if (invalidEmails.Any())
                {
                    return BadRequest(new { 
                        Success = false, 
                        Message = "Có địa chỉ email không hợp lệ", 
                        InvalidEmails = invalidEmails 
                    });
                }

                if (!recipients.Any())
                {
                    return BadRequest(new { Success = false, Message = "Không có địa chỉ email hợp lệ" });
                }

                // Xử lý template nếu có
                string htmlContent = notificationDto.Content;

                if (!string.IsNullOrEmpty(notificationDto.Template) && !string.IsNullOrEmpty(notificationDto.TemplateData))
                {
                    // Đây chỉ là mã mẫu, bạn có thể thay thế bằng logic xử lý template thực tế của mình
                    try
                    {
                        var templateData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(notificationDto.TemplateData);

                        // Đọc template từ file hoặc từ database
                        // Ở đây tạm thời sử dụng template cơ bản
                        string template = GetEmailTemplate(notificationDto.Template);

                        // Thay thế các placeholder trong template
                        foreach (var item in templateData)
                        {
                            template = template.Replace($"{{{{{item.Key}}}}}", item.Value);
                        }

                        htmlContent = template;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi xử lý template email");
                    }
                }

                int successCount = 0;
                List<string> failedEmails = new List<string>();

                // Xử lý link để đảm bảo không null - BỔ SUNG
                string link = "#"; // Giá trị mặc định

                // Nếu có link trong DTO, sử dụng nó
                if (!string.IsNullOrEmpty(notificationDto.Link))
                {
                    link = notificationDto.Link;
                }
                // Nếu không có link nhưng có templateData, thử trích xuất từ đó
                else if (!string.IsNullOrEmpty(notificationDto.TemplateData))
                {
                    try
                    {
                        var templateData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(notificationDto.TemplateData);
                        if (templateData != null)
                        {
                            // Kiểm tra các khóa phổ biến có thể chứa URL
                            string[] possibleLinkKeys = { "resultUrl", "link", "url", "examUrl", "redirectUrl" };
                            foreach (var key in possibleLinkKeys)
                            {
                                if (templateData.ContainsKey(key) && templateData[key] != null)
                                {
                                    link = templateData[key].ToString();
                                    break;
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể parse templateData để lấy link");
                    }
                }
                // Trường hợp cuối, thử trích xuất từ content nếu có thẻ <a href>
                else if (htmlContent.Contains("href="))
                {
                    try
                    {
                        // Tìm vị trí của href= trong content
                        int hrefStart = htmlContent.IndexOf("href=") + 6; // 6 là độ dài của "href='"
                        if (hrefStart > 5)
                        {
                            int hrefEnd = htmlContent.IndexOf("'", hrefStart);
                            if (hrefEnd > hrefStart)
                            {
                                link = htmlContent.Substring(hrefStart, hrefEnd - hrefStart);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể trích xuất link từ content");
                    }
                }

                try
                {
                    // Send to all recipients at once (more efficient)
                    await _emailService.SendBulkEmailAsync(recipients, notificationDto.Subject, htmlContent);
                    successCount = recipients.Count;
                    
                    // If we need to save notifications in the system
                    if (notificationDto.SaveNotification)
                    {
                        var users = await _context.Users
                            .Where(u => recipients.Contains(u.Email))
                            .ToListAsync();
                            
                        foreach (var user in users)
                        {
                            var notification = new Notification
                            {
                                Title = notificationDto.Subject,
                                Content = htmlContent,
                                UserId = user.Id,
                                Type = notificationDto.Type,
                                IsRead = false,
                                Link = link,
                                CreatedAt = DateTime.UtcNow,
                                RelatedEntityId = notificationDto.RelatedEntityId,
                                RelatedEntityType = notificationDto.RelatedEntityType,
                                SentViaEmail = true
                            };
                            
                            _context.Notifications.Add(notification);
                        }
                        
                        await _context.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending bulk email");
                    failedEmails.AddRange(recipients);
                    successCount = 0;
                }

                return Ok(new
                {
                    Success = true,
                    Message = $"Đã gửi thành công {successCount}/{recipients.Count} email",
                    SuccessCount = successCount,
                    TotalCount = recipients.Count,
                    FailedRecipients = failedEmails
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi thông báo qua email");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi gửi thông báo", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gửi thông báo trong hệ thống
        /// </summary>
        /// <param name="notificationDto">Thông tin thông báo</param>
        /// <returns>Kết quả gửi thông báo</returns>
        [HttpPost("in-app")]
        [Authorize(Roles = "Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SendInAppNotification([FromBody] InAppNotificationDTO notificationDto)
        {
            try
            {
                _logger.LogInformation("Bắt đầu gửi thông báo trong hệ thống");

                // Xác định danh sách người nhận
                var userIds = new HashSet<int>(); // Sử dụng HashSet để tránh trùng lặp

                // Thu thập tất cả userId hợp lệ từ cả hai nguồn
                if (notificationDto.UserId.HasValue && notificationDto.UserId.Value > 0)
                {
                    userIds.Add(notificationDto.UserId.Value);
                }

                if (notificationDto.UserIds != null && notificationDto.UserIds.Any())
                {
                    foreach (var id in notificationDto.UserIds.Where(id => id > 0))
                    {
                        userIds.Add(id);
                    }
                }

                if (!userIds.Any())
                {
                    return BadRequest(new { Success = false, Message = "Phải chỉ định ít nhất một người nhận" });
                }

                // Kiểm tra xem người dùng có tồn tại không
                var existingUsers = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.Email })
                    .ToListAsync();

                if (!existingUsers.Any())
                {
                    return BadRequest(new { Success = false, Message = "Không tìm thấy người nhận" });
                }

                var notifications = new List<Notification>();

                // Đảm bảo link không null
                string link = !string.IsNullOrEmpty(notificationDto.Link) ? notificationDto.Link : "#";

                // Tạo thông báo cho từng người dùng
                foreach (var user in existingUsers)
                {
                    var notification = new Notification
                    {
                        Title = notificationDto.Title,
                        Content = notificationDto.Content,
                        UserId = user.Id,
                        Type = notificationDto.Type,
                        IsRead = false,
                        Link = link,
                        CreatedAt = DateTime.UtcNow,
                        RelatedEntityId = notificationDto.RelatedEntityId,
                        RelatedEntityType = notificationDto.RelatedEntityType,
                        SentViaEmail = false
                    };

                    notifications.Add(notification);
                }

                // Thêm vào database
                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();

                // Nếu cần gửi email
                if (notificationDto.SendEmail)
                {
                    var emails = existingUsers.Select(u => u.Email).ToList();

                    foreach (var email in emails)
                    {
                        try
                        {
                            await _emailService.SendEmailAsync(
                                email,
                                notificationDto.Title,
                                notificationDto.Content
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Lỗi khi gửi email đến {email}");
                            // Tiếp tục với email tiếp theo
                        }
                    }
                }

                // In the method that handles in-app notifications
                if (notificationDto.SendEmail && notificationDto.RelatedEntityType == "OfficialExam")
                {
                    // For each user ID in the list
                    foreach (var userId in userIds)
                    {
                        var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                        if (student != null && !string.IsNullOrEmpty(student.Email))
                        {
                            // Get the student's exam result - fix the query to use the correct relationship
                            var examResult = await _context.ExamResults
                                .Include(er => er.Exam)
                                .FirstOrDefaultAsync(er => 
                                    er.StudentId == userId && 
                                    er.ExamId == notificationDto.RelatedEntityId); // Using ExamId instead of OfficialExamId
                                
                            if (examResult != null)
                            {
                                // Construct full result link (frontend URL + link path)
                                string baseUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                                string fullLink = $"{baseUrl}{notificationDto.Link}";
                                
                                await _emailService.SendExamResultNotificationEmailAsync(
                                    student.Email,
                                    student.FullName,
                                    examResult.Exam.Title,
                                    examResult.Score,
                                    examResult.Exam.TotalScore,
                                    examResult.IsPassed,
                                    fullLink
                                );
                            }
                        }
                    }
                }

                return Ok(new
                {
                    Success = true,
                    Message = $"Đã tạo thông báo cho {notifications.Count} người dùng",
                    NotificationCount = notifications.Count,
                    UserIds = notifications.Select(n => n.UserId).ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo thông báo trong hệ thống");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi tạo thông báo", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông báo của người dùng hiện tại
        /// </summary>
        /// <param name="page">Số trang</param>
        /// <param name="pageSize">Số lượng mỗi trang</param>
        /// <param name="onlyUnread">Chỉ lấy thông báo chưa đọc</param>
        /// <returns>Danh sách thông báo</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetMyNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool onlyUnread = false)
        {
            try
            {
                // Lấy ID người dùng hiện tại từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Xây dựng query
                var query = _context.Notifications.Where(n => n.UserId == userId);

                // Lọc theo trạng thái đọc nếu cần
                if (onlyUnread)
                {
                    query = query.Where(n => !n.IsRead);
                }

                // Đếm tổng số thông báo
                int totalCount = await query.CountAsync();
                int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                // Đảm bảo trang hợp lệ
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                // Lấy thông báo theo trang
                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Chuyển đổi về DTO
                var notificationDtos = notifications.Select(n => new NotificationDTO
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    Link = n.Link,
                    CreatedAt = n.CreatedAt,
                    RelatedEntityId = n.RelatedEntityId,
                    RelatedEntityType = n.RelatedEntityType
                }).ToList();

                // Đếm số thông báo chưa đọc
                int unreadCount = await _context.Notifications
                    .CountAsync(n => n.UserId == userId && !n.IsRead);

                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        Notifications = notificationDtos,
                        Pagination = new
                        {
                            CurrentPage = page,
                            PageSize = pageSize,
                            TotalItems = totalCount,
                            TotalPages = totalPages
                        },
                        UnreadCount = unreadCount
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy thông báo");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy thông báo", Error = ex.Message });
            }
        }

        /// <summary>
        /// Đánh dấu thông báo đã đọc
        /// </summary>
        /// <param name="id">ID thông báo</param>
        /// <returns>Kết quả đánh dấu đã đọc</returns>
        [HttpPut("{id}/read")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                // Lấy ID người dùng hiện tại từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Tìm thông báo
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

                if (notification == null)
                {
                    return NotFound(new { Success = false, Message = "Không tìm thấy thông báo" });
                }

                // Nếu thông báo chưa đọc
                if (!notification.IsRead)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return Ok(new { Success = true, Message = "Đã đánh dấu thông báo là đã đọc" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi đánh dấu thông báo ID {id} đã đọc");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi đánh dấu thông báo đã đọc", Error = ex.Message });
            }
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo là đã đọc
        /// </summary>
        /// <returns>Kết quả đánh dấu đã đọc</returns>
        [HttpPut("mark-all-read")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                // Lấy ID người dùng hiện tại từ token
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return StatusCode(500, new { Success = false, Message = "Không xác định được người dùng" });
                }

                // Lấy tất cả thông báo chưa đọc
                var unreadNotifications = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                // Cập nhật trạng thái
                foreach (var notification in unreadNotifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new { Success = true, Message = $"Đã đánh dấu {unreadNotifications.Count} thông báo là đã đọc" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đánh dấu tất cả thông báo đã đọc");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi đánh dấu tất cả thông báo đã đọc", Error = ex.Message });
            }
        }

        // Phương thức lấy mẫu template email từ tên template
        private string GetEmailTemplate(string templateName)
        {
            // Trong thực tế, bạn sẽ đọc template từ file hoặc từ database
            // Đây chỉ là mẫu đơn giản
            switch (templateName.ToLower())
            {
                case "exam_reminder":
                    return @"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                                <h2 style='color: #2a76d2; text-align: center;'>Nhắc nhở bài thi</h2>
                                <p>Xin chào {{fullName}},</p>
                                <p>Bạn có một bài thi sắp diễn ra:</p>
                                <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2a76d2;'>
                                    <p><strong>Tên bài thi:</strong> {{examTitle}}</p>
                                    <p><strong>Môn học:</strong> {{subjectName}}</p>
                                    <p><strong>Thời gian:</strong> {{examTime}}</p>
                                    <p><strong>Thời lượng:</strong> {{duration}} phút</p>
                                </div>
                                <p>Vui lòng chuẩn bị và tham gia đúng giờ.</p>
                                <p>Chúc bạn làm bài thi tốt!</p>
                                <div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;'>
                                    <p style='margin: 0;'>Trân trọng,<br>Đội ngũ ExamDG</p>
                                </div>
                            </div>
                        </body>
                        </html>";

                case "exam_result":
                    return @"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                                <h2 style='color: #2a76d2; text-align: center;'>Kết quả bài thi</h2>
                                <p>Xin chào {{fullName}},</p>
                                <p>Bài thi của bạn đã được chấm xong:</p>
                                <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2a76d2;'>
                                    <p><strong>Tên bài thi:</strong> {{examTitle}}</p>
                                    <p><strong>Môn học:</strong> {{subjectName}}</p>
                                    <p><strong>Điểm số:</strong> {{score}}/{{totalScore}} ({{percentage}}%)</p>
                                    <p><strong>Kết quả:</strong> {{result}}</p>
                                </div>
                                <p>Bạn có thể xem chi tiết bài làm của mình bằng cách nhấn vào <a href='{{resultLink}}'>liên kết này</a>.</p>
                                <div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;'>
                                    <p style='margin: 0;'>Trân trọng,<br>Đội ngũ ExamDG</p>
                                </div>
                            </div>
                        </body>
                        </html>";
                case "exam_result_announcement":
                    return @"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                                <h2 style='color: #2b6cb0; text-align: center;'>Kết quả kỳ thi đã được công bố</h2>
                                <p>Kính gửi học sinh,</p>
                                <p>Kết quả kỳ thi <strong>{{examTitle}}</strong> đã được công bố.</p>
                                <p>Vui lòng đăng nhập vào hệ thống để xem điểm số của bạn.</p>
                                <div style='margin: 25px 0; text-align: center;'>
                                    <a href='{{resultLink}}' 
                                    style='background-color: #4299e1; color: white; padding: 10px 20px; 
                                            text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>
                                    Xem kết quả
                                    </a>
                                </div>
                                <div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;'>
                                    <p style='margin: 0;'>Trân trọng,<br>Đội ngũ ExamDG</p>
                                </div>
                            </div>
                        </body>
                        </html>";
                default:
                    return string.Empty;
            }
        }

        // Add this helper method to the class
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}