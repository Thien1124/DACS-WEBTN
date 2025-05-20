using System;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using webthitn_backend.Models;

namespace webthitn_backend.Models.Users
{
    /// <summary>
    /// Entity đại diện cho người dùng trong hệ thống
    /// </summary>
    public class User
    {
        public User()
        {
            // Khởi tạo các collection để tránh warning
            CreatedExams = new HashSet<Exam>();
            CreatedQuestions = new HashSet<Question>();
            ExamResults = new HashSet<ExamResult>();
        }

        /// <summary>
        /// ID của người dùng
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tên đăng nhập
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Username { get; set; }

        /// <summary>
        /// Email của người dùng
        /// </summary>
        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; }

        /// <summary>
        /// Mật khẩu đã được hash
        /// </summary>
        [Required]
        public string Password { get; set; }

        /// <summary>
        /// Họ và tên
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        /// <summary>
        /// Vai trò của người dùng (Admin, Teacher, Student)
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Role { get; set; }

        /// <summary>
        /// Số điện thoại
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; }

        /// <summary>
        /// Trường học
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string School { get; set; }

        /// <summary>
        /// Lớp hoặc khối
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Grade { get; set; }

        /// <summary>
        /// Lớp học của người dùng (học sinh)
        /// </summary>
        public string? Classroom { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Đường dẫn đến ảnh đại diện
        /// </summary>
        [MaxLength(255)]
        public string? AvatarUrl { get; set; }
        /// <summary>
        /// Mã đặt lại mật khẩu
        /// </summary>
        [MaxLength(100)]
        public string? ResetPasswordCode { get; set; }

        /// <summary>
        /// Thời gian hết hạn của mã đặt lại mật khẩu
        /// </summary>
        public DateTime? ResetPasswordExpiry { get; set; }

        /// <summary>
        /// Token đặt lại mật khẩu
        /// </summary>
        [MaxLength(100)]
        public string? ResetToken { get; set; }

        /// <summary>
        /// Thời gian hết hạn token đặt lại mật khẩu
        /// </summary>
        public DateTime? ResetTokenExpires { get; set; }

        /// <summary>
        /// Refresh token cho JWT
        /// </summary>
        [MaxLength(255)]
        public string? RefreshToken { get; set; }

        /// <summary>
        /// Thời gian hết hạn refresh token
        /// </summary>
        public DateTime? RefreshTokenExpires { get; set; }

        /// <summary>
        /// Ngày tạo người dùng
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Ngày cập nhật thông tin gần nhất
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Thời gian đăng nhập gần nhất
        /// </summary>
        public DateTime? LastLogin { get; set; }

        #region Navigation Properties

        /// <summary>
        /// Các bài thi đã tạo (chỉ áp dụng cho Teacher và Admin)
        /// </summary>
        public virtual ICollection<Exam> CreatedExams { get; set; }

        /// <summary>
        /// Các câu hỏi đã tạo (chỉ áp dụng cho Teacher và Admin)
        /// </summary>
        public virtual ICollection<Question> CreatedQuestions { get; set; }

        /// <summary>
        /// Kết quả các bài thi đã làm (chỉ áp dụng cho Student)
        /// </summary>
        public virtual ICollection<ExamResult> ExamResults { get; set; }

        #endregion
        #region Navigation Properties
        #endregion
    }
}