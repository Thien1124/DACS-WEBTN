using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO để tạo lớp học mới
    /// </summary>
    public class CreateClassroomDTO
    {
        /// <summary>
        /// Tên lớp (bắt buộc)
        /// </summary>
        [Required(ErrorMessage = "Tên lớp không được để trống")]
        public string Name { get; set; }

        /// <summary>
        /// Khối lớp (nếu không cung cấp, sẽ tự động trích xuất từ tên lớp)
        /// </summary>
        public string Grade { get; set; }

        /// <summary>
        /// Mô tả về lớp (tùy chọn)
        /// </summary>
        public string Description { get; set; }
    }
}