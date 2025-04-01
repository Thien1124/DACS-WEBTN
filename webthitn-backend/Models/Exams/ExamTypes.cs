using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace webthitn_backend.Models
{
    public class ExamType
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } // Kiểm tra 15 phút, Kiểm tra 1 tiết, Giữa kỳ, Cuối kỳ, Thi thử THPT QG

        [StringLength(255)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<Exam> Exams { get; set; }
    }
}