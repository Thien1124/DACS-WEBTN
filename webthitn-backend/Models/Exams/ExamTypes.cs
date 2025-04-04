using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho loại bài thi
    /// </summary>
    public class ExamType
    {
        /// <summary>
        /// ID của loại bài thi
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tên loại bài thi
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        /// <summary>
        /// Mô tả loại bài thi
        /// </summary>
        [MaxLength(255)]
        public string Description { get; set; }

        /// <summary>
        /// Danh sách bài thi thuộc loại này
        /// </summary>
        public virtual ICollection<Exam> Exams { get; set; }
    }
}