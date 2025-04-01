using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace webthitn_backend.Models.Users
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [StringLength(100)]
        public string FullName { get; set; } = string.Empty; // Giá trị mặc định

        [StringLength(100)]
        public string? School { get; set; } // Cho phép null

        [StringLength(20)]
        public string? Grade { get; set; } // Cho phép null

        [StringLength(20)]
        public string? PhoneNumber { get; set; } // Cho phép null

        [StringLength(20)]
        public string Role { get; set; } = "Student"; // Giá trị mặc định

        public bool IsActive { get; set; } = true; // Giá trị mặc định

        public string ResetPasswordCode { get; set; } = string.Empty; // Giá trị mặc định

        public DateTime? ResetPasswordExpiry { get; set; } // Đã là nullable

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Giá trị mặc định

        public DateTime? UpdatedAt { get; set; } // Đã là nullable

        public DateTime? LastLogin { get; set; } // Đã là nullable

        // Navigation properties
        public virtual ICollection<ExamResult> ExamResults { get; set; }
    }
}