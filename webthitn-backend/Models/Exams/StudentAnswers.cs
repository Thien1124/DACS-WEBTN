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
        /// ID của đáp án được chọn (cho câu hỏi một đáp án)
        /// </summary>
        public int? SelectedOptionId { get; set; }

        /// <summary>
        /// Văn bản câu trả lời (cho câu hỏi trả lời ngắn)
        /// </summary>
        public string? TextAnswer { get; set; }

        /// <summary>
        /// Dữ liệu đáp án đúng-sai (JSON cho câu hỏi đúng-sai nhiều ý)
        /// Ví dụ: {"1":true,"2":false,"3":true,"4":true}
        /// </summary>
        public string? TrueFalseAnswers { get; set; }

        /// <summary>
        /// Câu trả lời có đúng hay không
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Câu trả lời có chính xác một phần hay không
        /// (sử dụng cho câu hỏi đúng-sai nhiều ý hoặc trả lời ngắn khớp một phần)
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
        /// Chi tiết đánh giá câu trả lời ngắn (JSON)
        /// {
        ///   "original_answer": "Câu trả lời gốc",
        ///   "matched_answer": "Đáp án khớp",
        ///   "is_exact_match": true/false,
        ///   "is_partial_match": true/false,
        ///   "similarity_score": 85,
        ///   "requires_manual_review": true/false
        /// }
        /// </summary>
        public string? ShortAnswerEvaluation { get; set; }

        /// <summary>
        /// Số lượng ý đúng trong câu hỏi đúng-sai nhiều ý
        /// </summary>
        public int? TrueFalseCorrectCount { get; set; }

        /// <summary>
        /// Đánh dấu xem câu trả lời có cần đánh giá thủ công không
        /// </summary>
        public bool RequiresManualReview { get; set; }

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
        /// Đáp án được chọn cho câu hỏi một đáp án
        /// </summary>
        public virtual QuestionOption? SelectedOption { get; set; }

        /// <summary>
        /// Lịch sử thay đổi của câu trả lời
        /// </summary>
        public virtual ICollection<StudentAnswerHistory> AnswerHistory { get; set; }

        #endregion

        #region Computed Properties

        /// <summary>
        /// Cấu trúc dữ liệu đúng-sai nhiều ý
        /// </summary>
        [NotMapped]
        public Dictionary<string, bool> TrueFalseAnswersDictionary
        {
            get
            {
                if (string.IsNullOrEmpty(TrueFalseAnswers))
                    return new Dictionary<string, bool>();

                try
                {
                    return JsonSerializer.Deserialize<Dictionary<string, bool>>(TrueFalseAnswers) ?? new Dictionary<string, bool>();
                }
                catch
                {
                    return new Dictionary<string, bool>();
                }
            }
            set
            {
                TrueFalseAnswers = JsonSerializer.Serialize(value ?? new Dictionary<string, bool>());
            }
        }

        /// <summary>
        /// Thông tin đánh giá câu trả lời ngắn
        /// </summary>
        [NotMapped]
        public ShortAnswerEvaluationInfo ShortAnswerEvaluationInfo
        {
            get
            {
                if (string.IsNullOrEmpty(ShortAnswerEvaluation))
                    return new ShortAnswerEvaluationInfo();

                try
                {
                    return JsonSerializer.Deserialize<ShortAnswerEvaluationInfo>(ShortAnswerEvaluation) ?? new ShortAnswerEvaluationInfo();
                }
                catch
                {
                    return new ShortAnswerEvaluationInfo();
                }
            }
            set
            {
                ShortAnswerEvaluation = JsonSerializer.Serialize(value ?? new ShortAnswerEvaluationInfo());
            }
        }

        public int? Order { get; internal set; }

        #endregion

        /// <summary>
        /// Cập nhật điểm cho câu trả lời dựa trên loại câu hỏi
        /// </summary>
        public void UpdateScore()
        {
            if (Question == null)
                return;

            switch (Question.QuestionType)
            {
                case 1: // Một đáp án (a, b, c, d)
                    UpdateSingleChoiceScore();
                    break;
                case 5: // Đúng-sai nhiều ý
                    UpdateTrueFalseScore();
                    break;
                case 3: // Trả lời ngắn
                    // Điểm đã được cập nhật bởi hàm đánh giá bên ngoài
                    // hoặc do giáo viên chấm điểm thủ công
                    RequiresManualReview = !IsCorrect && !IsPartiallyCorrect;
                    break;
            }
        }

        /// <summary>
        /// Cập nhật điểm cho câu hỏi một đáp án
        /// </summary>
        private void UpdateSingleChoiceScore()
        {
            if (!SelectedOptionId.HasValue || Question == null)
                return;

            // Tìm đáp án được chọn
            var selectedOption = Question.Options.FirstOrDefault(o => o.Id == SelectedOptionId.Value);

            if (selectedOption != null)
            {
                IsCorrect = selectedOption.IsCorrect;
                IsPartiallyCorrect = false;

                Score = IsCorrect ? MaxScore : 0;
            }
            else
            {
                IsCorrect = false;
                IsPartiallyCorrect = false;
                Score = 0;
            }
        }

        /// <summary>
        /// Cập nhật điểm cho câu hỏi đúng-sai nhiều ý
        /// </summary>
        private void UpdateTrueFalseScore()
        {
            if (string.IsNullOrEmpty(TrueFalseAnswers) || Question == null)
                return;

            var answers = TrueFalseAnswersDictionary;
            var correctCount = 0;

            // Đếm số lượng câu trả lời đúng
            foreach (var answer in answers)
            {
                // Tìm đáp án tương ứng trong câu hỏi
                var option = Question.Options.FirstOrDefault(o =>
                    o.GroupId.HasValue && o.GroupId.Value.ToString() == answer.Key);

                if (option != null && option.IsCorrect == answer.Value)
                {
                    correctCount++;
                }
            }

            // Lưu số lượng ý đúng
            TrueFalseCorrectCount = correctCount;

            // Cập nhật trạng thái và điểm
            IsCorrect = correctCount == 4; // Đúng hoàn toàn nếu cả 4 ý đều đúng
            IsPartiallyCorrect = correctCount > 0 && correctCount < 4;

            // Tính điểm theo cấu hình của Question
            Score = Question.CalculateScoreForTrueFalse(correctCount);
        }
    }

    /// <summary>
    /// Thông tin đánh giá câu trả lời ngắn
    /// </summary>
    public class ShortAnswerEvaluationInfo
    {
        /// <summary>
        /// Câu trả lời gốc của học sinh
        /// </summary>
        public string OriginalAnswer { get; set; } = "";

        /// <summary>
        /// Đáp án khớp nhất từ danh sách đáp án đúng
        /// </summary>
        public string MatchedAnswer { get; set; } = "";

        /// <summary>
        /// Đánh dấu khớp chính xác
        /// </summary>
        public bool IsExactMatch { get; set; }

        /// <summary>
        /// Đánh dấu khớp một phần
        /// </summary>
        public bool IsPartialMatch { get; set; }

        /// <summary>
        /// Độ tương đồng (0-100)
        /// </summary>
        public int SimilarityScore { get; set; }

        /// <summary>
        /// Cần đánh giá thủ công
        /// </summary>
        public bool RequiresManualReview { get; set; } = true;
    }
}