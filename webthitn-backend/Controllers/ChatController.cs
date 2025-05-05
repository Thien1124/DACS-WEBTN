using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    [Route("api/chat")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gửi tin nhắn trong chatbox
        /// </summary>
        /// <param name="messageDto">Thông tin tin nhắn mới</param>
        /// <returns>Thông tin tin nhắn sau khi đã gửi</returns>
        [HttpPost("message")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ChatMessageDTO>> SendMessage([FromBody] NewMessageDTO messageDto)
        {
            if (messageDto == null || string.IsNullOrEmpty(messageDto.Content))
                return BadRequest(new { Success = false, Message = "Nội dung tin nhắn không được để trống" });

            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
                return Unauthorized(new { Success = false, Message = "Không xác định được người dùng gửi tin nhắn" });

            if (messageDto.ReceiverId <= 0)
                return BadRequest(new { Success = false, Message = "Người nhận không hợp lệ" });

            // Kiểm tra người nhận có tồn tại
            var receiver = await _context.Users.FindAsync(messageDto.ReceiverId);
            if (receiver == null)
                return BadRequest(new { Success = false, Message = "Không tìm thấy người nhận" });

            // Tạo và lưu tin nhắn mới
            var message = new ChatMessage
            {
                SenderId = currentUserId,
                ReceiverId = messageDto.ReceiverId,
                Content = messageDto.Content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            // Lấy thông tin người gửi và người nhận
            var sender = await _context.Users.FindAsync(currentUserId);

            // Tạo DTO để trả về
            var messageResponse = new ChatMessageDTO
            {
                Id = message.Id,
                SenderId = message.SenderId,
                SenderName = sender?.FullName ?? $"User {message.SenderId}",
                ReceiverId = message.ReceiverId,
                ReceiverName = receiver?.FullName ?? $"User {message.ReceiverId}",
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt
            };

            return CreatedAtAction(nameof(SendMessage), new { id = message.Id },
                new { Success = true, Message = "Tin nhắn đã được gửi thành công", Data = messageResponse });
        }

        /// <summary>
        /// Lấy cuộc trò chuyện với một người dùng cụ thể
        /// </summary>
        /// <param name="userId">ID của người dùng cần lấy cuộc trò chuyện</param>
        /// <param name="page">Số trang, mặc định là 1</param>
        /// <param name="pageSize">Kích thước trang, mặc định là 20</param>
        /// <returns>Danh sách tin nhắn của cuộc trò chuyện</returns>
        [HttpGet("conversation/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<ChatMessageDTO>>> GetConversation(
            int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (userId <= 0)
                return BadRequest(new { Success = false, Message = "ID người dùng không hợp lệ" });

            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
                return Unauthorized(new { Success = false, Message = "Không xác định được người dùng hiện tại" });

            // Kiểm tra người dùng có tồn tại
            var otherUser = await _context.Users.FindAsync(userId);
            if (otherUser == null)
                return BadRequest(new { Success = false, Message = "Không tìm thấy người dùng" });

            // Lấy tin nhắn giữa hai người dùng, sắp xếp theo thời gian gửi
            var query = _context.ChatMessages
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                            (m.SenderId == userId && m.ReceiverId == currentUserId))
                .OrderByDescending(m => m.SentAt)
                .AsQueryable();

            // Đếm tổng số tin nhắn
            var totalCount = await query.CountAsync();

            // Phân trang
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var messages = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Đánh dấu tin nhắn đã đọc (khi người dùng hiện tại là người nhận)
            var unreadMessages = messages
                .Where(m => m.ReceiverId == currentUserId && !m.IsRead)
                .ToList();

            if (unreadMessages.Any())
            {
                foreach (var message in unreadMessages)
                {
                    message.IsRead = true;
                    message.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
            }

            // Lấy thông tin người gửi và người nhận
            var currentUser = await _context.Users.FindAsync(currentUserId);

            // Tạo danh sách DTO để trả về
            var messageResponses = messages.Select(m => new ChatMessageDTO
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.SenderId == currentUserId
                    ? currentUser?.FullName ?? $"User {m.SenderId}"
                    : otherUser?.FullName ?? $"User {m.SenderId}",
                ReceiverId = m.ReceiverId,
                ReceiverName = m.ReceiverId == currentUserId
                    ? currentUser?.FullName ?? $"User {m.ReceiverId}"
                    : otherUser?.FullName ?? $"User {m.ReceiverId}",
                Content = m.Content,
                SentAt = m.SentAt,
                IsRead = m.IsRead,
                ReadAt = m.ReadAt
            }).ToList();

            return Ok(new
            {
                Success = true,
                TotalCount = totalCount,
                PageCount = (int)Math.Ceiling((double)totalCount / pageSize),
                CurrentPage = page,
                PageSize = pageSize,
                Data = messageResponses
            });
        }

        /// <summary>
        /// Lấy danh sách tin nhắn chưa đọc của người dùng hiện tại
        /// </summary>
        /// <returns>Danh sách tin nhắn chưa đọc</returns>
        [HttpGet("unread")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<ChatMessageDTO>>> GetUnreadMessages()
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
                return Unauthorized(new { Success = false, Message = "Không xác định được người dùng hiện tại" });

            // Lấy tin nhắn chưa đọc gửi đến người dùng hiện tại
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.ReceiverId == currentUserId && !m.IsRead)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            // Tính số lượng người gửi tin nhắn
            var uniqueSenders = unreadMessages
                .Select(m => m.SenderId)
                .Distinct()
                .Count();

            // Nhóm tin nhắn theo người gửi và lấy tin nhắn mới nhất của mỗi người
            var latestMessagesByUser = unreadMessages
                .GroupBy(m => m.SenderId)
                .Select(g => g.OrderByDescending(m => m.SentAt).First())
                .ToList();

            // Lấy thông tin người gửi
            var senderIds = latestMessagesByUser.Select(m => m.SenderId).Distinct().ToList();
            var senders = await _context.Users
                .Where(u => senderIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u);

            // Tạo danh sách DTO để trả về
            var messageResponses = latestMessagesByUser.Select(m => new ChatMessageDTO
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = senders.ContainsKey(m.SenderId)
                    ? senders[m.SenderId].FullName
                    : $"User {m.SenderId}",
                ReceiverId = m.ReceiverId,
                ReceiverName = "You",
                Content = m.Content,
                SentAt = m.SentAt,
                IsRead = false,
                ReadAt = null
            }).ToList();

            return Ok(new
            {
                Success = true,
                TotalUnreadCount = unreadMessages.Count,
                UniqueSendersCount = uniqueSenders,
                Data = messageResponses
            });
        }

        // Helper method to get the current user's ID
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst("UserId");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }

            return -1;
        }
    }
}