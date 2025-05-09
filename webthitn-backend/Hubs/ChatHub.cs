using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using webthitn_backend.Models;

namespace webthitn_backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        // Khi một người dùng kết nối đến hub
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User.FindFirst("userId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnConnectedAsync();
        }

        // Khi người dùng ngắt kết nối
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.User.FindFirst("userId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnDisconnectedAsync(exception);
        }

        // Gửi tin nhắn trực tiếp đến một người dùng cụ thể
        public async Task SendDirectMessage(int receiverId, string message)
        {
            if (string.IsNullOrEmpty(message))
                return;

            var senderId = int.Parse(Context.User.FindFirst("userId").Value);

            // Lưu tin nhắn vào database
            var chatMessage = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = message,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            // Gửi tin nhắn đến người nhận thông qua SignalR
            await Clients.Group($"user_{receiverId}").SendAsync("ReceiveMessage", senderId, message, chatMessage.SentAt);
        }
    }
}