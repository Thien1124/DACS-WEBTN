using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace webthitn_backend.Models
{
    public class Chapter
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Subject")]
        public int SubjectId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } 

        public int OrderIndex { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Subject Subject { get; set; }
        public virtual ICollection<Lesson> Lessons { get; set; }
    }
}