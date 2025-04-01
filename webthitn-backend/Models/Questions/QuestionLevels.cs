using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace webthitn_backend.Models
{
    public class QuestionLevel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } // Nhận biết, Thông hiểu, Vận dụng thấp, Vận dụng cao

        public int Value { get; set; } // 1, 2, 3, 4

        [StringLength(255)]
        public string Description { get; set; }

        // Navigation properties
        public virtual ICollection<Question> Questions { get; set; }
    }
}