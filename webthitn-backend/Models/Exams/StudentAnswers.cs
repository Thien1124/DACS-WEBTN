using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace webthitn_backend.Models
{
    /// <summary>
    /// Entity đại diện cho câu trả lời của học sinh trong bài thi
    /// </summary>
    public class StudentAnswer
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public StudentAnswer()
        {
            // Khởi tạo collection để tránh lỗi null reference
            AnswerHistory = new HashSet<StudentAnswerHistory>();
        }

        /// <summary>
        /// ID của câu trả lời
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID của kết quả bài thi
        /// </summary>
        public int ExamResultId { get; set; }

        /// <summary>
        /// ID của quan hệ bài thi - câu hỏi
        /// </summary>
        public int ExamQuestionId { get; set; }

        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// Thứ tự câu hỏi trong bài thi
        /// </summary>
        public int QuestionOrder { get; set; }

        /// <summary>
        /// Các ID của đáp án được chọn (JSON array cho câu hỏi nhiều đáp án)
        /// </summary>
        public string? SelectedOptionIds { get; set; }

        /// <summary>
        /// Văn bản câu trả lời (cho câu hỏi điền từ)
        /// </summary>
        public string? TextAnswer { get; set; }

        /// <summary>
        /// Dữ liệu ghép đôi (JSON cho câu hỏi ghép đôi)
        /// </summary>
        public string? MatchingData { get; set; }

        /// <summary>
        /// Câu trả lời có đúng hay không
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Câu trả lời có chính xác một phần hay không (cho câu nhiều đáp án)
        /// </summary>
        public bool IsPartiallyCorrect { get; set; }

        /// <summary>
        /// Điểm số cho câu trả lời này
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Score { get; set; }

        /// <summary>
        /// Điểm số tối đa cho câu hỏi này
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal MaxScore { get; set; }

        /// <summary>
        /// Thời gian trả lời (giây)
        /// </summary>
        public int? AnswerTime { get; set; }

        /// <summary>
        /// Có đánh dấu để xem lại không
        /// </summary>
        public bool IsFlagged { get; set; }

        /// <summary>
        /// Điểm chấm thủ công (nếu giáo viên thay đổi điểm)
        /// </summary>
        [Column(TypeName = "decimal(5, 2)")]
        public decimal? ManualScore { get; set; }

        /// <summary>
        /// Ghi chú của giáo viên khi chấm điểm
        /// </summary>
        public string? TeacherNote { get; set; }

        /// <summary>
        /// Thời điểm trả lời câu hỏi
        /// </summary>
        public DateTime? AnsweredAt { get; set; }

        /// <summary>
        /// Thời điểm sửa đổi câu trả lời gần nhất
        /// </summary>
        public DateTime? ModifiedAt { get; set; }

        /// <summary>
        /// Trạng thái câu hỏi
        /// </summary>
        /// <remarks>
        /// 0: Chưa trả lời
        /// 1: Đã trả lời
        /// 2: Đánh dấu xem lại
        /// </remarks>
        public int Status { get; set; }

        #region Navigation Properties

        /// <summary>
        /// Kết quả bài thi
        /// </summary>
        public virtual ExamResult? ExamResult { get; set; }

        /// <summary>
        /// Câu hỏi trong bài thi
        /// </summary>
        public virtual ExamQuestion? ExamQuestion { get; set; }

        /// <summary>
        /// Câu hỏi
        /// </summary>
        public virtual Question? Question { get; set; }

        /// <summary>
        /// Lịch sử thay đổi của câu trả lời
        /// </summary>
        public virtual ICollection<StudentAnswerHistory> AnswerHistory { get; set; }

        #endregion

        #region Computed Properties

        /// <summary>
        /// Danh sách các ID đáp án đã chọn
        /// </summary>
        [NotMapped]
        public List<int> SelectedOptionIdsList
        {
            get
            {
                if (string.IsNullOrEmpty(SelectedOptionIds))
                    return new List<int>();

                try
                {
                    return JsonSerializer.Deserialize<List<int>>(SelectedOptionIds) ?? new List<int>();
                }
                catch
                {
                    return new List<int>();
                }
            }
            set
            {
                SelectedOptionIds = JsonSerializer.Serialize(value ?? new List<int>());
            }
        }

        /// <summary>
        /// Cấu trúc dữ liệu ghép đôi
        /// </summary>
        [NotMapped]
        public Dictionary<string, string> MatchingPairs
        {
            get
            {
                if (string.IsNullOrEmpty(MatchingData))
                    return new Dictionary<string, string>();

                try
                {
                    return JsonSerializer.Deserialize<Dictionary<string, string>>(MatchingData) ?? new Dictionary<string, string>();
                }
                catch
                {
                    return new Dictionary<string, string>();
                }
            }
            set
            {
                MatchingData = JsonSerializer.Serialize(value ?? new Dictionary<string, string>());
            }
        }

        #endregion
    }
}