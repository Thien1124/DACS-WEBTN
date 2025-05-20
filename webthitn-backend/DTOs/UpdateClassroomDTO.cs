namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO để cập nhật thông tin lớp học
    /// </summary>
    public class UpdateClassroomDTO
    {
        /// <summary>
        /// Tên mới của lớp (để trống nếu không thay đổi)
        /// </summary>
        public string NewName { get; set; }

        /// <summary>
        /// Khối lớp mới (để trống nếu không thay đổi)
        /// </summary>
        public string Grade { get; set; }

        /// <summary>
        /// Mô tả mới về lớp (để trống nếu không thay đổi)
        /// </summary>
        public string Description { get; set; }
    }
}