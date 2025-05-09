using System;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO chứa thông tin người dùng để trả về cho client
    /// </summary>
    public class UserDTO
    {
        /// <summary>
        /// ID của người dùng
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Tên đăng nhập của người dùng
        /// </summary>
        /// <example>thien1124</example>
        public string Username { get; set; }

        /// <summary>
        /// Địa chỉ email của người dùng
        /// </summary>
        /// <example>thien1124@example.com</example>
        public string Email { get; set; }

        /// <summary>
        /// Họ và tên đầy đủ của người dùng
        /// </summary>
        /// <example>Nguyễn Văn Thiện</example>
        public string FullName { get; set; }

        /// <summary>
        /// Số điện thoại của người dùng
        /// </summary>
        /// <example>0912345678</example>
        public string PhoneNumber { get; set; }

        /// <summary>
        /// Vai trò của người dùng trong hệ thống (Admin, Teacher, Student)
        /// </summary>
        /// <example>Teacher</example>
        public string Role { get; set; }
        public string? Grade { get; set; }
        /// <summary>
        /// Thời điểm tạo tài khoản
        /// </summary>
        /// <example>2025-04-03T13:18:47Z</example>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Thời điểm đăng nhập cuối cùng
        /// </summary>
        /// <example>2025-04-03T13:18:47Z</example>
        public DateTime? LastLogin { get; set; }

        /// <summary>
        /// Thời điểm cập nhật thông tin gần nhất
        /// </summary>
        /// <example>2025-04-03T13:18:47Z</example>
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO dùng để cập nhật thông tin cá nhân của người dùng
    /// </summary>
    public class UpdateUserDTO
    {
        /// <summary>
        /// Địa chỉ email mới của người dùng
        /// </summary>
        /// <example>thien1124.new@example.com</example>
        public string Email { get; set; }

        /// <summary>
        /// Họ và tên đầy đủ mới của người dùng
        /// </summary>
        /// <example>Nguyễn Văn Thiện</example>
        public required string FullName { get; set; }

        /// <summary>
        /// Số điện thoại mới của người dùng
        /// </summary>
        /// <example>0987654321</example>
        public required string PhoneNumber { get; set; }
    }

    /// <summary>
    /// DTO dùng để cập nhật vai trò của người dùng (chỉ Admin mới có quyền)
    /// </summary>
    public class UpdateUserRoleDTO
    {
        /// <summary>
        /// Vai trò mới của người dùng (Admin, Teacher, Student)
        /// </summary>
        /// <example>Teacher</example>
        public string Role { get; set; }
    }

    /// <summary>
    /// DTO dùng để kích hoạt hoặc vô hiệu hóa tài khoản người dùng
    /// </summary>
    public class UpdateUserStatusDTO
    {
        /// <summary>
        /// Trạng thái kích hoạt của tài khoản (true: kích hoạt, false: vô hiệu hóa)
        /// </summary>
        /// <example>true</example>
        public bool IsActive { get; set; }
    }
}