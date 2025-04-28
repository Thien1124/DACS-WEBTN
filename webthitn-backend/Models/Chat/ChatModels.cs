using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
	/// <summary>
	/// Đại diện cho một cuộc trò chuyện giữa hai người dùng
	/// </summary>
	public class Conversation
	{
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// ID của người dùng đầu tiên trong cuộc trò chuyện
		/// </summary>
		[Required]
		public int User1Id { get; set; }

		/// <summary>
		/// ID của người dùng thứ hai trong cuộc trò chuyện
		/// </summary>
		[Required]
		public int User2Id { get; set; }

		/// <summary>
		/// Thời điểm cuộc hội thoại được tạo
		/// </summary>
		[Required]
		public DateTime CreatedAt { get; set; }

		/// <summary>
		/// Thời điểm tin nhắn cuối cùng được gửi
		/// </summary>
		public DateTime LastMessageAt { get; set; }

		/// <summary>
		/// Tham chiếu người dùng 1
		/// </summary>
		[ForeignKey("User1Id")]
		public virtual User User1 { get; set; }

		/// <summary>
		/// Tham chiếu người dùng 2
		/// </summary>
		[ForeignKey("User2Id")]
		public virtual User User2 { get; set; }

		/// <summary>
		/// Danh sách tin nhắn trong cuộc trò chuyện
		/// </summary>
		public virtual ICollection<ChatMessage> Messages { get; set; }
	}

	/// <summary>
	/// Đại diện cho một tin nhắn trong cuộc trò chuyện
	/// </summary>
	public class ChatMessage
	{
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// ID của cuộc trò chuyện mà tin nhắn thuộc về
		/// </summary>
		[Required]
		public int ConversationId { get; set; }

		/// <summary>
		/// ID của người gửi tin nhắn
		/// </summary>
		[Required]
		public int SenderId { get; set; }

		/// <summary>
		/// Nội dung tin nhắn
		/// </summary>
		[Required]
		public string Content { get; set; }

		/// <summary>
		/// Thời điểm gửi tin nhắn
		/// </summary>
		[Required]
		public DateTime SentAt { get; set; }

		/// <summary>
		/// Thời điểm đọc tin nhắn (null nếu chưa đọc)
		/// </summary>
		public DateTime? ReadAt { get; set; }

		/// <summary>
		/// Loại tin nhắn (text, image, file,...)
		/// </summary>
		public MessageType MessageType { get; set; } = MessageType.Text;

		/// <summary>
		/// Đường dẫn đến tệp đính kèm (nếu có)
		/// </summary>
		public string AttachmentUrl { get; set; }

		/// <summary>
		/// Tham chiếu đến cuộc trò chuyện
		/// </summary>
		[ForeignKey("ConversationId")]
		public virtual Conversation Conversation { get; set; }

		/// <summary>
		/// Tham chiếu đến người gửi tin nhắn
		/// </summary>
		[ForeignKey("SenderId")]
		public virtual User Sender { get; set; }
	}

	/// <summary>
	/// Định nghĩa các loại tin nhắn
	/// </summary>
	public enum MessageType
	{
		Text = 0,
		Image = 1,
		File = 2,
		SystemNotification = 3
	}
}