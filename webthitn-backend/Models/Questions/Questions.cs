using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho câu hỏi trong hệ thống
    /// </summary>
    public class Question
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        [Required]
        public string Content { get; set; }

        /// <summary>
        /// Giải thích cho câu hỏi (hiển thị sau khi làm bài)
        /// </summary>
        public required string Explanation { get; set; }

        /// <summary>
        /// ID của môn học
        /// </summary>
        public required int SubjectId { get; set; }

        /// <summary>
        /// ID của chương (nếu có)
        /// </summary>
        public required int? ChapterId { get; set; }

        /// <summary>
        /// ID của mức độ câu hỏi
        /// </summary>
        public required int QuestionLevelId { get; set; }

        /// <summary>
        /// Loại câu hỏi (1: Một đáp án, 2: Nhiều đáp án, 3: Điền từ, 4: Ghép đôi)
        /// </summary>
        public required int QuestionType { get; set; }

        /// <summary>
        /// Tags/từ khóa cho câu hỏi, phân cách bởi dấu phẩy
        /// </summary>
        public required string Tags { get; set; }

        /// <summary>
        /// Thời gian làm câu hỏi gợi ý (giây)
        /// </summary>
        public required int? SuggestedTime { get; set; }

        /// <summary>
        /// Điểm mặc định cho câu hỏi
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal DefaultScore { get; set; } = 1;

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        public required bool IsActive
        {
            get; set;
        }

        /// <summary>
        /// Đường dẫn đến hình ảnh (nếu có)
        /// </summary>
        public required string ImagePath { get; set; }

        /// <summary>
        /// ID người tạo
        /// </summary>
        public required int CreatorId { get; set; }

        /// <summary>
        /// Ngày tạo
        /// </summary>
        public required DateTime CreatedAt { get; set; }

        /// <summary>
        /// Ngày cập nhật
        /// </summary>
        public required DateTime? UpdatedAt { get; set; }

        #region Navigation Properties

        /// <summary>
        /// Môn học của câu hỏi
        /// </summary>
        public virtual required Subject Subject { get; set; }

        /// <summary>
        /// Chương của câu hỏi (nếu có)
        /// </summary>
        public virtual required Chapter Chapter { get; set; }

        /// <summary>
        /// Mức độ câu hỏi
        /// </summary>
        public virtual required QuestionLevel QuestionLevel { get; set; }

        /// <summary>
        /// Người tạo câu hỏi
        /// </summary>
        public virtual required User Creator { get; set; }

        /// <summary>
        /// Danh sách các đáp án của câu hỏi
        /// </summary>
        public virtual required ICollection<QuestionOption> Options { get; set; }

        /// <summary>
        /// Danh sách bài thi chứa câu hỏi này
        /// </summary>
        public virtual required ICollection<ExamQuestion> ExamQuestions { get; set; }

        #endregion

        /// <summary>
        /// Trả về tên loại câu hỏi dựa trên mã QuestionType
        /// </summary>
        /// <returns>Tên loại câu hỏi</returns>
        [NotMapped]
        public string QuestionTypeName
        {
            get
            {
                return QuestionType switch
                {
                    1 => "Một đáp án",
                    2 => "Nhiều đáp án",
                    3 => "Điền từ",
                    4 => "Ghép đôi",
                    _ => "Không xác định",
                };
            }
        }
    }
}