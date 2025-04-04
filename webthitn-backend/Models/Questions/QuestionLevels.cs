using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho mức độ khó của câu hỏi
    /// </summary>
    public class QuestionLevel
    {
        /// <summary>
        /// ID của mức độ
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tên mức độ
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        /// <summary>
        /// Giá trị số của mức độ (1: Dễ, 2: Trung bình, 3: Khó, 4: Rất khó)
        /// </summary>
        public int Value { get; set; }

        /// <summary>
        /// Mô tả về mức độ
        /// </summary>
        [MaxLength(255)]
        public string Description { get; set; }

        /// <summary>
        /// Danh sách câu hỏi thuộc mức độ này
        /// </summary>
        public virtual ICollection<Question> Questions { get; set; }
    }
}