using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace webthitn_backend.Models
{
    public class Subject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } // Tên môn học (Toán, Lý, Hóa, ...)

        [StringLength(10)]
        public string Code { get; set; } // Mã môn học (MATH, PHY, CHEM, ...)

        [StringLength(500)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Chapter> Chapters { get; set; }
        public virtual ICollection<Exam> Exams { get; set; }
    }
}