using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace webthitn_backend.Models
{
    public class Lesson
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Chapter")]
        public int ChapterId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } // Tên bài học

        public int OrderIndex { get; set; } // Thứ tự bài học

        [StringLength(500)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Chapter Chapter { get; set; }
        public virtual ICollection<Question> Questions { get; set; }
    }
}