using System;

namespace webthitn_backend.DTOs
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateUserDTO
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class UpdateUserRoleDTO
    {
        public string Role { get; set; }
    }

    public class UpdateUserStatusDTO
    {
        public bool IsActive { get; set; }
    }
}