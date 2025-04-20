using System;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO để cập nhật chương
    /// </summary>
    public class UpdateChapterDTO
    {
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
        public int? SubjectId { get; set; }

        /// <summary>
        /// Thứ tự hiển thị
        /// </summary>
        /// <example>1</example>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        /// <example>true</example>
        public bool? IsActive { get; set; }
    }
}