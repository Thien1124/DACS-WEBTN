using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO hiển thị thông tin kết quả bài thi trong danh sách
    /// </summary>
    public class ExamResultListDTO
    {
        /// <summary>
        /// ID của kết quả bài thi
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Thông tin cơ bản về bài thi
        /// </summary>
        public ExamBasicDTO Exam { get; set; }

        /// <summary>
        /// Thông tin cơ bản về học sinh
        /// </summary>
        public required UserBasicDTO Student { get; set; }

        /// <summary>
        /// Số điểm đạt được
        /// </summary>
        /// <example>8.5</example>
        public decimal Score { get; set; }

        /// <summary>
        /// Điểm phần trăm
        /// </summary>
        /// <example>85</example>
        public decimal PercentageScore { get; set; }

        /// <summary>
        /// Đạt yêu cầu hay không
        /// </summary>
        /// <example>true</example>
        public bool IsPassed { get; set; }

        /// <summary>
        /// Số câu đúng / tổng số câu
        /// </summary>
        /// <example>17/20</example>
        public string CorrectRatio { get; set; }

        /// <summary>
        /// Thời gian làm bài (phút:giây)
        /// </summary>
        /// <example>42:30</example>
        public string DurationFormatted { get; set; }

        /// <summary>
        /// Thứ tự lần làm
        /// </summary>
        /// <example>2</example>
        public int AttemptNumber { get; set; }

        /// <summary>
        /// Trạng thái hoàn thành
        /// </summary>
        /// <example>true</example>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// Thời điểm bắt đầu làm bài
        /// </summary>
        /// <example>2025-04-05T10:15:30Z</example>
        public DateTime StartedAt { get; set; }

        /// <summary>
        /// Thời điểm hoàn thành
        /// </summary>
        /// <example>2025-04-05T10:58:00Z</example>
        public DateTime? CompletedAt { get; set; }
    }

    /// <summary>
    /// DTO hiển thị thông tin chi tiết kết quả bài thi
    /// </summary>
    public class ExamResultDetailDTO
    {
        /// <summary>
        /// ID của kết quả bài thi
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Thông tin bài thi
        /// </summary>
        public ExamBasicDTO Exam { get; set; }

        /// <summary>
        /// Thông tin học sinh
        /// </summary>
        public required UserBasicDTO Student { get; set; }

        /// <summary>
        /// Số điểm đạt được
        /// </summary>
        /// <example>8.5</example>
        public decimal Score { get; set; }

        /// <summary>
        /// Điểm tối đa của bài thi
        /// </summary>
        /// <example>10</example>
        public decimal TotalScore { get; set; }

        /// <summary>
        /// Điểm phần trăm
        /// </summary>
        /// <example>85</example>
        public decimal PercentageScore { get; set; }

        /// <summary>
        /// Đạt yêu cầu hay không
        /// </summary>
        /// <example>true</example>
        public bool IsPassed { get; set; }

        /// <summary>
        /// Điểm đạt yêu cầu
        /// </summary>
        /// <example>5</example>
        public decimal? PassScore { get; set; }

        /// <summary>
        /// Thời gian làm bài (giây)
        /// </summary>
        /// <example>2550</example>
        public int Duration { get; set; }

        /// <summary>
        /// Thời gian làm bài định dạng
        /// </summary>
        /// <example>42 phút 30 giây</example>
        public string DurationFormatted { get; set; }

        /// <summary>
        /// Số câu trả lời đúng
        /// </summary>
        /// <example>17</example>
        public int CorrectAnswers { get; set; }

        /// <summary>
        /// Tổng số câu hỏi
        /// </summary>
        /// <example>20</example>
        public int TotalQuestions { get; set; }

        /// <summary>
        /// Số câu đã làm
        /// </summary>
        /// <example>20</example>
        public int AnsweredQuestions { get; set; }

        /// <summary>
        /// Thứ tự lần làm
        /// </summary>
        /// <example>2</example>
        public int AttemptNumber { get; set; }

        /// <summary>
        /// Trạng thái hoàn thành
        /// </summary>
        /// <example>true</example>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// Thời điểm bắt đầu làm bài
        /// </summary>
        /// <example>2025-04-05T10:15:30Z</example>
        public DateTime StartedAt { get; set; }

        /// <summary>
        /// Thời điểm hoàn thành
        /// </summary>
        /// <example>2025-04-05T10:58:00Z</example>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Nhận xét của giáo viên
        /// </summary>
        /// <example>Bài làm tốt, cần cải thiện phần giới hạn</example>
        public string TeacherComment { get; set; }

        /// <summary>
        /// Bài thi được nộp tự động khi hết giờ hay nộp bởi người dùng
        /// </summary>
        /// <example>false</example>
        public bool IsSubmittedManually { get; set; }

        /// <summary>
        /// Danh sách câu trả lời của học sinh
        /// </summary>
        public required IEnumerable<StudentAnswerDTO> StudentAnswers { get; set; }

        /// <summary>
        /// Thống kê theo mức độ câu hỏi
        /// </summary>
        public required IEnumerable<QuestionLevelStatDTO> LevelStats { get; set; }
    }

    /// <summary>
    /// DTO cho câu trả lời của học sinh
    /// </summary>
    public class StudentAnswerDTO
    {
        /// <summary>
        /// ID của câu trả lời
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        /// <example>42</example>
        public int QuestionId { get; set; }

        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        /// <example>Tính giới hạn của hàm số f(x) = sin(x)/x khi x tiến đến 0</example>
        public required string QuestionContent { get; set; }

        /// <summary>
        /// Loại câu hỏi
        /// </summary>
        /// <example>Một đáp án</example>
        public required string QuestionType { get; set; }

        /// <summary>
        /// Thứ tự câu hỏi trong bài thi
        /// </summary>
        /// <example>5</example>
        public int QuestionOrder { get; set; }

        /// <summary>
        /// Các đáp án đã chọn
        /// </summary>
        public List<SelectedOptionDTO> SelectedOptions { get; set; }

        /// <summary>
        /// Văn bản câu trả lời (cho câu hỏi điền từ)
        /// </summary>
        /// <example>1</example>
        public string TextAnswer { get; set; }

        /// <summary>
        /// Dữ liệu ghép đôi (cho câu hỏi ghép đôi)
        /// </summary>
        public List<MatchingPairDTO> MatchingPairs { get; set; }

        /// <summary>
        /// Câu trả lời đúng hoàn toàn
        /// </summary>
        /// <example>true</example>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Câu trả lời đúng một phần
        /// </summary>
        /// <example>false</example>
        public bool IsPartiallyCorrect { get; set; }

        /// <summary>
        /// Điểm số cho câu trả lời
        /// </summary>
        /// <example>1</example>
        public decimal Score { get; set; }

        /// <summary>
        /// Điểm tối đa cho câu hỏi
        /// </summary>
        /// <example>1</example>
        public decimal MaxScore { get; set; }

        /// <summary>
        /// Thời gian trả lời (giây)
        /// </summary>
        /// <example>45</example>
        public int? AnswerTime { get; set; }

        /// <summary>
        /// Trạng thái câu hỏi
        /// </summary>
        /// <example>1</example>
        public int Status { get; set; }

        /// <summary>
        /// Giải thích cho câu hỏi
        /// </summary>
        /// <example>Áp dụng định lý L'Hospital ta có giới hạn bằng 1</example>
        public string Explanation { get; set; }
    }

    /// <summary>
    /// DTO cho đáp án đã chọn
    /// </summary>
    public class SelectedOptionDTO
    {
        /// <summary>
        /// ID của đáp án
        /// </summary>
        /// <example>15</example>
        public int OptionId { get; set; }

        /// <summary>
        /// Nội dung đáp án
        /// </summary>
        /// <example>1</example>
        public string Content { get; set; }

        /// <summary>
        /// Đáp án này có đúng không
        /// </summary>
        /// <example>true</example>
        public bool IsCorrect { get; set; }
    }

    /// <summary>
    /// DTO cho cặp ghép đôi
    /// </summary>
    public class MatchingPairDTO
    {
        /// <summary>
        /// Giá trị bên trái
        /// </summary>
        /// <example>France</example>
        public string LeftValue { get; set; }

        /// <summary>
        /// Giá trị bên phải
        /// </summary>
        /// <example>Paris</example>
        public string RightValue { get; set; }

        /// <summary>
        /// Cặp này có đúng không
        /// </summary>
        /// <example>true</example>
        public bool IsCorrect { get; set; }
    }

    /// <summary>
    /// DTO thống kê theo mức độ câu hỏi
    /// </summary>
    public class QuestionLevelStatDTO
    {
        /// <summary>
        /// ID mức độ
        /// </summary>
        /// <example>3</example>
        public int LevelId { get; set; }

        /// <summary>
        /// Tên mức độ
        /// </summary>
        /// <example>Vận dụng thấp</example>
        public string LevelName { get; set; }

        /// <summary>
        /// Tổng số câu hỏi ở mức độ này
        /// </summary>
        /// <example>8</example>
        public int TotalQuestions { get; set; }

        /// <summary>
        /// Số câu trả lời đúng
        /// </summary>
        /// <example>6</example>
        public int CorrectAnswers { get; set; }

        /// <summary>
        /// Tỷ lệ đúng (%)
        /// </summary>
        /// <example>75</example>
        public decimal CorrectPercentage { get; set; }
    }

    /// <summary>
    /// DTO cơ bản về bài thi
    /// </summary>
    public class ExamBasicDTO
    {
        /// <summary>
        /// ID của bài thi
        /// </summary>
        /// <example>15</example>
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề bài thi
        /// </summary>
        /// <example>Kiểm tra giữa kỳ Toán học</example>
        public string Title { get; set; }

        /// <summary>
        /// Loại bài thi
        /// </summary>
        /// <example>Giữa kỳ</example>
        public string Type { get; set; }

        /// <summary>
        /// Môn học
        /// </summary>
        public required SubjectBasicDTO Subject { get; set; }
    }
}