using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Model đại diện cho môn học trong hệ thống
    /// </summary>
    public class Subject
    {
        /// <summary>
        /// ID của môn học, là khóa chính
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tên môn học: Toán, Lý, Hóa, Văn, Anh,...
        /// </summary>
        [Required(ErrorMessage = "Tên môn học không được để trống")]
        [StringLength(50, ErrorMessage = "Tên môn học không được vượt quá 50 ký tự")]
        public string Name { get; set; }

        /// <summary>
        /// Mã môn học: MATH, PHY, CHEM, LIT, ENG,...
        /// </summary>
        [StringLength(10, ErrorMessage = "Mã môn học không được vượt quá 10 ký tự")]
        public string Code { get; set; }

        /// <summary>
        /// Mô tả về môn học
        /// </summary>
        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự")]
        public string Description { get; set; }

        /// <summary>
        /// Trạng thái của môn học: true - đang hoạt động, false - đã vô hiệu hóa
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Thời gian tạo môn học
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Thời gian cập nhật môn học gần nhất, null nếu chưa được cập nhật
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties - Các mối quan hệ
        /// <summary>
        /// Danh sách các chương thuộc môn học này
        /// </summary>
        public virtual ICollection<Chapter> Chapters { get; set; }

        /// <summary>
        /// Danh sách các bài thi thuộc môn học này
        /// </summary>
        public virtual ICollection<Exam> Exams { get; set; }
    }
}