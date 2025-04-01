using System;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.Models
{
    public class Setting
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Key { get; set; }

        [Required]
        public string Value { get; set; }

        [StringLength(255)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}