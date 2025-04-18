using System;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO hiển thị thông tin bài học trong danh sách
    /// </summary>
    public class LessonDTO
    {
        /// <summary>
        /// ID của bài học
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Tên bài học
        /// </summary>
        /// <example>Khái niệm đạo hàm</example>
        public string Name { get; set; }

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
    }
}