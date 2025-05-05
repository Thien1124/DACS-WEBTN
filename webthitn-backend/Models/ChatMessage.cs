using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }

        public int SenderId { get; set; }

        [ForeignKey("SenderId")]
        public User Sender { get; set; }

        public int ReceiverId { get; set; }

        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; }

        [Required]
        public string Content { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }
    }
}