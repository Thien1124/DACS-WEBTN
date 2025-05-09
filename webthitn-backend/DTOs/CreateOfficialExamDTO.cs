using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    public class CreateOfficialExamDTO
    {
        [Required(ErrorMessage = "Tiêu đề kỳ thi không được để trống")]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "ID đề thi không được để trống")]
        public int ExamId { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? ClassroomId { get; set; }

        public List<int> StudentIds { get; set; } = new List<int>();
    }

    public class UpdateOfficialExamDTO
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? ClassroomId { get; set; }

        public bool? IsActive { get; set; }
    }

    public class OfficialExamListDTO
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public int ExamId { get; set; }

        public string ExamTitle { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? ClassroomId { get; set; }

        public string ClassroomName { get; set; }

        public UserBasicDTO Creator { get; set; }

        public bool IsActive { get; set; }

        public bool ResultsReleased { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public int AssignedStudentsCount { get; set; }

        public int CompletedStudentsCount { get; set; }

        public string Status { get; set; }
    }

    public class OfficialExamDetailDTO : OfficialExamListDTO
    {
        public ExamListDTO Exam { get; set; }

        public List<OfficialExamStudentDTO> Students { get; set; }
    }

    public class OfficialExamStudentDTO
    {
        public int Id { get; set; }

        public int StudentId { get; set; }

        public string StudentName { get; set; }

        public string StudentCode { get; set; }

        public bool HasTaken { get; set; }

        public int? ExamResultId { get; set; }

        public double? Score { get; set; }

        public double? PercentageScore { get; set; }

        public bool? IsPassed { get; set; }

        public DateTime CompletedAt { get; set; }
    }

    public class AssignStudentsDTO
    {
        [Required(ErrorMessage = "Danh sách ID học sinh không được để trống")]
        public List<int> StudentIds { get; set; } = new List<int>();
    }

    public class ReleaseResultDTO
    {
        public bool Release { get; set; } = true;

        public string NotificationMessage { get; set; }
    }
}