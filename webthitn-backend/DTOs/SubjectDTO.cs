using System;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO hiển thị thông tin môn học trong danh sách
    /// </summary>
    public class SubjectListDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ChaptersCount { get; set; }
        public int ExamsCount { get; set; }
    }

    /// <summary>
    /// DTO hiển thị chi tiết môn học kèm thông tin chương
    /// </summary>
    public class SubjectDetailDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public IEnumerable<ChapterBasicDTO> Chapters { get; set; }
        public int ExamsCount { get; set; }
    }

    /// <summary>
    /// DTO cơ bản cho chương (dùng trong chi tiết môn học)
    /// </summary>
    public class ChapterBasicDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int OrderIndex { get; set; }
        public bool IsActive { get; set; }
        public int LessonsCount { get; set; }
    }

    /// <summary>
    /// DTO dùng để tạo mới môn học
    /// </summary>
    public class CreateSubjectDTO
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// DTO dùng để cập nhật môn học
    /// </summary>
    public class UpdateSubjectDTO
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// DTO đơn giản cho dropdown/select
    /// </summary>
    public class SubjectDropdownDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }
}