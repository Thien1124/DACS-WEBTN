using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO hiển thị thông tin chi tiết của chương
    /// </summary>
    public class ChapterDetailDTO
    {
        /// <summary>
        /// ID của chương
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Tên chương
        /// </summary>
        /// <example>Đạo hàm</example>
        public string Name { get; set; }

        /// <summary>
        /// Mô tả chương
        /// </summary>
        /// <example>Kiến thức cơ bản về đạo hàm và ứng dụng</example>
        public string Description { get; set; }

        /// <summary>
        /// ID của môn học
        /// </summary>
        /// <example>1</example>
        public int SubjectId { get; set; }

        /// <summary>
        /// Tên môn học
        /// </summary>
        /// <example>Toán 12</example>
        public string SubjectName { get; set; }

        /// <summary>
        /// Thứ tự hiển thị
        /// </summary>
        /// <example>1</example>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        /// <example>true</example>
        public bool IsActive { get; set; }

        /// <summary>
        /// Thời gian tạo
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Thời gian cập nhật gần nhất
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Danh sách bài học trong chương
        /// </summary>
        public List<LessonDTO> Lessons { get; set; } = new List<LessonDTO>();
    }
}