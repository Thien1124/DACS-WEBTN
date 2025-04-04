using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho bài thi trong hệ thống
    /// </summary>
    public class Exam
    {
        /// <summary>
        /// ID của bài thi
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề bài thi
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        /// <summary>
        /// Mô tả bài thi
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// ID của môn học
        /// </summary>
        public int SubjectId { get; set; }

        /// <summary>
        /// ID của loại bài thi
        /// </summary>
        public int ExamTypeId { get; set; }

        /// <summary>
        /// Thời gian làm bài (phút)
        /// </summary>
        [Required]
        public int Duration { get; set; }

        /// <summary>
        /// Điểm tối đa của bài thi
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal TotalScore { get; set; }

        /// <summary>
        /// Điểm đạt của bài thi
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal? PassScore { get; set; }

        /// <summary>
        /// Số lần được làm bài (null là không giới hạn)
        /// </summary>
        public int? MaxAttempts { get; set; }

        /// <summary>
        /// Thời gian bắt đầu mở bài thi
        /// </summary>
        public DateTime? StartTime { get; set; }

        /// <summary>
        /// Thời gian kết thúc đóng bài thi
        /// </summary>
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Cài đặt hiển thị kết quả sau khi làm bài
        /// </summary>
        public bool ShowResult { get; set; } = true;

        /// <summary>
        /// Cài đặt hiển thị đáp án đúng sau khi làm bài
        /// </summary>
        public bool ShowAnswers { get; set; } = false;

        /// <summary>
        /// Trộn câu hỏi khi hiển thị
        /// </summary>
        public bool ShuffleQuestions { get; set; } = true;

        /// <summary>
        /// Mã truy cập bài thi (nếu được bảo vệ)
        /// </summary>
        public string AccessCode { get; set; }

        /// <summary>
        /// Ngày giờ tạo bài thi
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Ngày giờ cập nhật gần nhất
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// ID người tạo bài thi
        /// </summary>
        public int CreatorId { get; set; }

        /// <summary>
        /// Quan hệ với môn học
        /// </summary>
        public virtual Subject Subject { get; set; }

        /// <summary>
        /// Quan hệ với loại bài thi
        /// </summary>
        public virtual ExamType ExamType { get; set; }

        /// <summary>
        /// Người tạo bài thi
        /// </summary>
        public virtual User Creator { get; set; }

        /// <summary>
        /// Danh sách câu hỏi trong bài thi
        /// </summary>
        public virtual ICollection<ExamQuestion> ExamQuestions { get; set; }

        /// <summary>
        /// Danh sách kết quả làm bài
        /// </summary>
        public virtual ICollection<ExamResult> ExamResults { get; set; }
    }
}