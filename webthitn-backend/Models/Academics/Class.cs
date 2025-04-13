using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Model đại diện cho lớp học trong hệ thống
    /// </summary>
    public class Class
    {
        /// <summary>
        /// Constructor để khởi tạo collections
        /// </summary>
        public Class()
        {
            Students = new HashSet<User>();
        }

        /// <summary>
        /// ID của lớp học, là khóa chính
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tên lớp học: 10A1, 11B2, 12C3,...
        /// </summary>
        [Required(ErrorMessage = "Tên lớp học không được để trống")]
        [StringLength(20, ErrorMessage = "Tên lớp học không được vượt quá 20 ký tự")]
        public string Name { get; set; }

        /// <summary>
        /// Khối lớp: 10, 11, 12
        /// </summary>
        [Required(ErrorMessage = "Khối lớp không được để trống")]
        [StringLength(10, ErrorMessage = "Khối lớp không được vượt quá 10 ký tự")]
        public string Grade { get; set; }

        /// <summary>
        /// Mô tả về lớp học
        /// </summary>
        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự")]
        public string Description { get; set; }

        /// <summary>
        /// Năm học: 2025-2026
        /// </summary>
        [StringLength(20, ErrorMessage = "Năm học không được vượt quá 20 ký tự")]
        public string SchoolYear { get; set; }

        /// <summary>
        /// Trạng thái của lớp học: true - đang hoạt động, false - đã vô hiệu hóa
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Thứ tự hiển thị
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Thời gian tạo lớp học
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Thời gian cập nhật lớp học gần nhất
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        /// <summary>
        /// Danh sách học sinh của lớp
        /// </summary>
        public virtual ICollection<User> Students { get; set; }
    }
}