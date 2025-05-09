using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webthitn_backend.Models
{
    public class DocumentResource
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public string Url { get; set; }

        public string ThumbnailUrl { get; set; }

        public long FileSize { get; set; }

        [MaxLength(20)]
        public string FileType { get; set; }

        public int SubjectId { get; set; }

        [ForeignKey("SubjectId")]
        public Subject Subject { get; set; }

        public int? ChapterId { get; set; }

        [ForeignKey("ChapterId")]
        public Chapter Chapter { get; set; }

        [MaxLength(500)]
        public string Tags { get; set; }

        public int UploadedById { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public int DownloadCount { get; set; }

        [MaxLength(50)]
        public string DocumentType { get; set; } // PDF, Slide, Word, etc.
    }
}