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
        public int QuestionLevelId { get; set; }

        /// <summary>
        /// Loại câu hỏi 
        /// 1: Một đáp án (trắc nghiệm a,b,c,d)
        /// 2: Đúng-sai nhiều ý (dùng cho trắc nghiệm đúng-sai 4 ý) , mới xuất hiện năm nay
        /// 3: Trả lời ngắn với nhiều đáp án có thể chấp nhận được , mới xuất hiện năm nay
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
        /// Cấu hình tính điểm cho câu hỏi đúng-sai nhiều ý (JSON)
        /// {
        ///   "1_correct": 0.10,
        ///   "2_correct": 0.25,
        ///   "3_correct": 0.50,
        ///   "4_correct": 1.00
        /// }
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Cấu hình cho câu hỏi trả lời ngắn (JSON)
        /// {
        ///   "case_sensitive": false,
        ///   "exact_match": false,
        ///   "partial_credit": true,
        ///   "partial_credit_percent": 50,
        ///   "allow_similar": true,
        ///   "similarity_threshold": 80
        /// }
        /// </summary>
        public string ShortAnswerConfig { get; set; }

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
        public virtual QuestionLevel Level { get; set; }

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
                    2 => "Đúng-sai nhiều ý",
                    3 => "Trả lời ngắn",
                    _ => "Không xác định",
                };
            }
        }

        /// <summary>
        /// Kiểm tra xem đây có phải là câu hỏi đúng-sai nhiều ý hay không
        /// </summary>
        [NotMapped]
        public bool IsMultiTrueFalseQuestion
        {
            get
            {
                return QuestionType == 2;
            }
        }

        /// <summary>
        /// Kiểm tra xem đây có phải là câu hỏi trả lời ngắn hay không
        /// </summary>
        [NotMapped]
        public bool IsShortAnswerQuestion
        {
            get
            {
                return QuestionType == 3;
            }
        }

        /// <summary>
        /// Tính điểm dựa trên số lượng câu trả lời đúng cho câu hỏi đúng-sai
        /// </summary>
        public decimal CalculateScoreForTrueFalse(int correctAnswersCount)
        {
            if (QuestionType != 2)
                return 0;

            if (string.IsNullOrEmpty(ScoringConfig))
            {
                // Nếu không có cấu hình, dùng cấu hình mặc định
                return correctAnswersCount switch
                {
                    1 => 0.10m,
                    2 => 0.25m,
                    3 => 0.50m,
                    4 => 1.00m,
                    _ => 0m
                };
            }

            try
            {
                // Parse cấu hình tính điểm tùy chỉnh
                var config = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, decimal>>(ScoringConfig);
                var key = $"{correctAnswersCount}_correct";

                if (config.ContainsKey(key))
                    return config[key];

                return 0m;
            }
            catch
            {
                return 0m;
            }
        }

        /// <summary>
        /// Đánh giá câu trả lời ngắn và tính điểm
        /// </summary>
        /// <param name="studentAnswer">Câu trả lời của học sinh</param>
        /// <param name="correctAnswers">Danh sách các câu trả lời đúng</param>
        /// <returns>Điểm số và thông tin đánh giá</returns>
        public (decimal Score, bool IsExactMatch, bool IsPartialMatch, string MatchedAnswer) EvaluateShortAnswer(
            string studentAnswer, IEnumerable<QuestionOption> correctAnswers)
        {
            if (QuestionType != 3 || string.IsNullOrWhiteSpace(studentAnswer))
                return (0, false, false, string.Empty);

            // Lấy cấu hình đánh giá
            var config = GetShortAnswerConfiguration();

            // Chuẩn hóa câu trả lời của học sinh
            var normalizedStudentAnswer = config.CaseSensitive
                ? studentAnswer.Trim()
                : studentAnswer.Trim().ToLowerInvariant();

            // Tìm câu trả lời chính xác nhất trong danh sách câu trả lời đúng
            foreach (var answer in correctAnswers)
            {
                var correctAnswer = config.CaseSensitive
                    ? answer.Content.Trim()
                    : answer.Content.Trim().ToLowerInvariant();

                // Kiểm tra khớp chính xác
                if (normalizedStudentAnswer == correctAnswer)
                    return (DefaultScore, true, false, answer.Content);

                // Nếu cho phép điểm một phần và khớp tương đối
                if (config.AllowSimilar && IsSimilar(normalizedStudentAnswer, correctAnswer, config.SimilarityThreshold))
                {
                    decimal partialScore = config.PartialCredit
                        ? DefaultScore * (config.PartialCreditPercent / 100m)
                        : DefaultScore;

                    return (partialScore, false, true, answer.Content);
                }
            }

            return (0, false, false, string.Empty);
        }

        /// <summary>
        /// Kiểm tra mức độ tương đồng giữa hai chuỗi
        /// </summary>
        private bool IsSimilar(string str1, string str2, int threshold)
        {
            // Sử dụng thuật toán Levenshtein Distance để tính độ tương đồng
            int levenshteinDistance = CalculateLevenshteinDistance(str1, str2);
            int maxLength = Math.Max(str1.Length, str2.Length);

            if (maxLength == 0)
                return true;

            int similarity = (int)(100 * (1 - ((double)levenshteinDistance / maxLength)));
            return similarity >= threshold;
        }

        /// <summary>
        /// Tính khoảng cách Levenshtein giữa hai chuỗi
        /// </summary>
        private int CalculateLevenshteinDistance(string str1, string str2)
        {
            int[,] distance = new int[str1.Length + 1, str2.Length + 1];

            for (int i = 0; i <= str1.Length; i++)
                distance[i, 0] = i;
            for (int j = 0; j <= str2.Length; j++)
                distance[0, j] = j;

            for (int i = 1; i <= str1.Length; i++)
            {
                for (int j = 1; j <= str2.Length; j++)
                {
                    int cost = (str1[i - 1] == str2[j - 1]) ? 0 : 1;
                    distance[i, j] = Math.Min(
                        Math.Min(distance[i - 1, j] + 1, distance[i, j - 1] + 1),
                        distance[i - 1, j - 1] + cost);
                }
            }

            return distance[str1.Length, str2.Length];
        }

        /// <summary>
        /// Lấy cấu hình cho câu hỏi trả lời ngắn
        /// </summary>
        private ShortAnswerConfiguration GetShortAnswerConfiguration()
        {
            try
            {
                if (!string.IsNullOrEmpty(ShortAnswerConfig))
                {
                    return System.Text.Json.JsonSerializer.Deserialize<ShortAnswerConfiguration>(ShortAnswerConfig)
                           ?? new ShortAnswerConfiguration();
                }
            }
            catch
            {
                // Ignore parsing errors and return default config
            }

            return new ShortAnswerConfiguration();
        }
    }

    /// <summary>
    /// Cấu hình cho câu hỏi trả lời ngắn
    /// </summary>
    public class ShortAnswerConfiguration
    {
        /// <summary>
        /// Phân biệt chữ hoa/thường
        /// </summary>
        public bool CaseSensitive { get; set; } = false;

        /// <summary>
        /// Yêu cầu khớp chính xác
        /// </summary>
        public bool ExactMatch { get; set; } = false;

        /// <summary>
        /// Cho phép điểm một phần
        /// </summary>
        public bool PartialCredit { get; set; } = true;

        /// <summary>
        /// Phần trăm điểm cho điểm một phần
        /// </summary>
        public int PartialCreditPercent { get; set; } = 50;

        /// <summary>
        /// Cho phép câu trả lời tương đối
        /// </summary>
        public bool AllowSimilar { get; set; } = true;

        /// <summary>
        /// Ngưỡng tương đồng (%)
        /// </summary>
        public int SimilarityThreshold { get; set; } = 80;
    }
}