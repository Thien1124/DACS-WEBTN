using System;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO cho thông tin tài liệu
    /// </summary>
    public class DocumentDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public string ThumbnailUrl { get; set; }
        public long FileSize { get; set; }
        public string FileType { get; set; }
        public string DocumentType { get; set; }
        public int SubjectId { get; set; }
        public string SubjectName { get; set; }
        public int? ChapterId { get; set; }
        public string ChapterName { get; set; }
        public int? GradeId { get; set; } 
        public string Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public int DownloadCount { get; set; }
    }
}