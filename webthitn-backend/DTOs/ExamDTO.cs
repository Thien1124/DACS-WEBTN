using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO hiển thị thông tin bài thi trong danh sách
    /// </summary>
    public class ExamListDTO
    {
        /// <summary>
        /// ID của bài thi
        /// </summary>
        /// <example>1</example>
        public required int Id { get; set; }

        /// <summary>
        /// Tiêu đề bài thi
        /// </summary>
        /// <example>Kiểm tra giữa kỳ Toán học</example>
        public required string Title { get; set; }

        /// <summary>
        /// Loại bài thi
        /// </summary>
        /// <example>Giữa kỳ</example>
        public required string Type { get; set; }

        /// <summary>
        /// Mô tả ngắn về bài thi
        /// </summary>
        /// <example>Bài kiểm tra kiến thức cơ bản về đạo hàm và tích phân</example>
        public required string Description { get; set; }

        /// <summary>
        /// Thời gian làm bài (phút)
        /// </summary>
        /// <example>45</example>
        public required int Duration { get; set; }

        /// <summary>
        /// Số câu hỏi trong bài thi
        /// </summary>
        /// <example>30</example>
        public required int QuestionCount { get; set; }

        /// <summary>
        /// Điểm tối đa của bài thi
        /// </summary>
        /// <example>10</example>
        public required decimal TotalScore { get; set; }

        /// <summary>
        /// Điểm đạt của bài thi
        /// </summary>
        /// <example>5</example>
        public required decimal? PassScore { get; set; }

        /// <summary>
        /// Số lần được làm bài
        /// </summary>
        /// <example>2</example>
        public required int? MaxAttempts { get; set; }

        /// <summary>
        /// Thời gian bắt đầu mở bài thi
        /// </summary>
        /// <example>2025-04-05T08:00:00Z</example>
        public required DateTime? StartTime { get; set; }

        /// <summary>
        /// Thời gian kết thúc đóng bài thi
        /// </summary>
        /// <example>2025-04-15T23:59:59Z</example>
        public required DateTime? EndTime { get; set; }

        /// <summary>
        /// Trạng thái bài thi
        /// </summary>
        /// <example>Đang mở</example>
        public required string Status { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt của bài thi
        /// </summary>
        /// <example>true</example>
        public required bool IsActive { get; set; }

        /// <summary>
        /// Hiển thị kết quả sau khi làm bài
        /// </summary>
        /// <example>true</example>
        public required bool ShowResult { get; set; }

        /// <summary>
        /// Hiển thị đáp án sau khi làm bài
        /// </summary>
        /// <example>false</example>
        public required bool ShowAnswers { get; set; }

        /// <summary>
        /// Trộn câu hỏi khi hiển thị
        /// </summary>
        /// <example>true</example>
        public required bool ShuffleQuestions { get; set; }

        /// <summary>
        /// Trộn đáp án khi hiển thị (áp dụng cho câu hỏi trắc nghiệm một đáp án)
        /// </summary>
        /// <example>true</example>
        public bool ShuffleOptions { get; set; } = true;

        /// <summary>
        /// Cài đặt chấm tự động câu hỏi trả lời ngắn
        /// </summary>
        /// <example>true</example>
        public bool AutoGradeShortAnswer { get; set; } = true;

        /// <summary>
        /// Cài đặt mức điểm đạt (%) cho câu hỏi đúng-sai nhiều ý nếu trả lời đúng một phần
        /// </summary>
        /// <example>true</example>
        public bool AllowPartialGrading { get; set; } = true;

        /// <summary>
        /// Ngày tạo bài thi
        /// </summary>
        /// <example>2025-04-03T13:18:47Z</example>
        public required DateTime CreatedAt { get; set; }

        /// <summary>
        /// Thông tin cơ bản về môn học
        /// </summary>
        public required SubjectBasicDTO Subject { get; set; }

        /// <summary>
        /// Thông tin người tạo
        /// </summary>
        public required UserBasicDTO Creator { get; set; }

        /// <summary>
        /// Thống kê số lượng câu hỏi theo loại
        /// </summary>
        public QuestionTypeCountDTO QuestionTypeCounts { get; set; }
    }

    /// <summary>
    /// DTO cơ bản về môn học cho danh sách bài thi
    /// </summary>
    public class SubjectBasicDTO
    {
        /// <summary>
        /// ID của môn học
        /// </summary>
        /// <example>1</example>
        public required int Id { get; set; }

        /// <summary>
        /// Tên môn học
        /// </summary>
        /// <example>Toán</example>
        public required string Name { get; set; }

        /// <summary>
        /// Mã môn học
        /// </summary>
        /// <example>MATH</example>
        public required string Code { get; set; }
    }

    /// <summary>
    /// DTO cơ bản về người dùng
    /// </summary>
    public class UserBasicDTO
    {
        /// <summary>
        /// ID của người dùng
        /// </summary>
        /// <example>2</example>
        public required int Id { get; set; }

        /// <summary>
        /// Tên đăng nhập
        /// </summary>
        /// <example>Thien1124</example>
        public required string Username { get; set; }

        /// <summary>
        /// Họ tên đầy đủ
        /// </summary>
        /// <example>Thien Nguyen</example>
        public required string FullName { get; set; }
    }

    /// <summary>
    /// Tham số truyền vào khi lọc bài thi
    /// </summary>
    public class ExamFilterDTO
    {
        /// <summary>
        /// ID của môn học cần lọc
        /// </summary>
        /// <example>1</example>
        public required int? SubjectId { get; set; }

        /// <summary>
        /// ID của loại bài thi
        /// </summary>
        /// <example>3</example>
        public int ExamTypeId { get; set; }

        /// <summary>
        /// Trang hiện tại
        /// </summary>
        /// <example>1</example>
        public required int Page
        {
            get; set;
        }

        /// <summary>
        /// Số lượng bản ghi mỗi trang
        /// </summary>
        /// <example>10</example>
        public required int PageSize
        {
            get; set;
        }

        /// <summary>
        /// Chỉ lấy các bài thi đang hoạt động
        /// </summary>
        /// <example>true</example>
        public required bool ActiveOnly
        {
            get; set;
        }

        /// <summary>
        /// Lọc trạng thái bài thi (null: tất cả, true: đang mở, false: đã đóng)
        /// </summary>
        /// <example>true</example>
        public required bool? IsOpen { get; set; }

        /// <summary>
        /// Từ khóa tìm kiếm (tên, mô tả)
        /// </summary>
        /// <example>kiểm tra</example>
        public required string SearchTerm { get; set; }
    }

    /// <summary>
    /// DTO tạo mới bài thi
    /// </summary>
    public class CreateExamDTO
    {
        /// <summary>
        /// Tiêu đề bài thi
        /// </summary>
        /// <example>Kiểm tra giữa kỳ Toán học</example>
        public string Title { get; set; }

        /// <summary>
        /// Mô tả bài thi
        /// </summary>
        /// <example>Bài kiểm tra kiến thức cơ bản về đạo hàm và tích phân</example>
        public string Description { get; set; }

        /// <summary>
        /// ID của môn học
        /// </summary>
        /// <example>1</example>
        public int SubjectId { get; set; }

        /// <summary>
        /// ID của loại bài thi
        /// </summary>
        /// <example>3</example>
        public int ExamTypeId { get; set; }

        /// <summary>
        /// Thời gian làm bài (phút)
        /// </summary>
        /// <example>45</example>
        public int Duration { get; set; }

        /// <summary>
        /// Điểm tối đa của bài thi
        /// </summary>
        /// <example>10</example>
        public decimal TotalScore { get; set; }

        /// <summary>
        /// Điểm đạt của bài thi
        /// </summary>
        /// <example>5</example>
        public decimal? PassScore { get; set; }

        /// <summary>
        /// Số lần được làm bài
        /// </summary>
        /// <example>2</example>
        public int? MaxAttempts { get; set; }

        /// <summary>
        /// Thời gian bắt đầu mở bài thi
        /// </summary>
        /// <example>2025-04-05T08:00:00Z</example>
        public DateTime? StartTime { get; set; }

        /// <summary>
        /// Thời gian kết thúc đóng bài thi
        /// </summary>
        /// <example>2025-04-15T23:59:59Z</example>
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt của bài thi
        /// </summary>
        /// <example>true</example>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Hiển thị kết quả sau khi làm bài
        /// </summary>
        /// <example>true</example>
        public bool ShowResult { get; set; } = true;

        /// <summary>
        /// Hiển thị đáp án sau khi làm bài
        /// </summary>
        /// <example>false</example>
        public bool ShowAnswers { get; set; } = false;

        /// <summary>
        /// Trộn câu hỏi khi hiển thị
        /// </summary>
        /// <example>true</example>
        public bool ShuffleQuestions { get; set; } = true;

        /// <summary>
        /// Trộn đáp án khi hiển thị (áp dụng cho câu hỏi trắc nghiệm một đáp án)
        /// </summary>
        /// <example>true</example>
        public bool ShuffleOptions { get; set; } = true;

        /// <summary>
        /// Cài đặt chấm tự động câu hỏi trả lời ngắn
        /// </summary>
        /// <example>true</example>
        public bool AutoGradeShortAnswer { get; set; } = true;

        /// <summary>
        /// Cài đặt mức điểm đạt (%) cho câu hỏi đúng-sai nhiều ý nếu trả lời đúng một phần
        /// </summary>
        /// <example>true</example>
        public bool AllowPartialGrading { get; set; } = true;

        /// <summary>
        /// Mã truy cập bài thi (nếu được bảo vệ)
        /// </summary>
        /// <example>abc123</example>
        public string AccessCode { get; set; }

        /// <summary>
        /// Cấu hình tính điểm (JSON)
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Danh sách ID câu hỏi đưa vào bài thi
        /// </summary>
        public List<ExamQuestionCreateDTO> Questions { get; set; }
    }

    /// <summary>
    /// DTO thêm câu hỏi vào bài thi
    /// </summary>
    public class ExamQuestionCreateDTO
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        /// <example>42</example>
        public int QuestionId { get; set; }

        /// <summary>
        /// Thứ tự câu hỏi trong bài thi
        /// </summary>
        /// <example>1</example>
        public int Order { get; set; }

        /// <summary>
        /// Điểm số cho câu hỏi trong bài thi
        /// </summary>
        /// <example>1.5</example>
        public decimal Score { get; set; }
    }

    /// <summary>
    /// Thống kê số lượng câu hỏi theo loại
    /// </summary>
    public class QuestionTypeCountDTO
    {
        /// <summary>
        /// Số câu hỏi trắc nghiệm một đáp án
        /// </summary>
        public int SingleChoiceCount { get; set; }

        /// <summary>
        /// Số câu hỏi đúng-sai nhiều ý
        /// </summary>
        public int TrueFalseCount { get; set; }

        /// <summary>
        /// Số câu hỏi trả lời ngắn
        /// </summary>
        public int ShortAnswerCount { get; set; }
    }

    /// <summary>
    /// DTO cấu hình tính điểm cho bài thi
    /// </summary>
    public class ExamScoringConfigDTO
    {
        /// <summary>
        /// Phương thức tính điểm ("sum": cộng điểm, "average": lấy trung bình)
        /// </summary>
        public string GradingMethod { get; set; } = "sum";

        /// <summary>
        /// Phương thức tính điểm một phần ("proportional": tính theo tỷ lệ, "all_or_nothing": đúng hết hoặc không điểm)
        /// </summary>
        public string PartialCreditMethod { get; set; } = "proportional";

        /// <summary>
        /// Phần trăm điểm trừ cho câu trả lời sai (0-100)
        /// </summary>
        public decimal PenaltyForWrongAnswer { get; set; } = 0;
    }

    /// <summary>
    /// DTO chứa thông tin chi tiết của một câu hỏi
    /// </summary>
    public class ExamQuestionDetailDTO
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID của liên kết giữa câu hỏi và bài thi
        /// </summary>
        public int ExamQuestionId { get; set; }

        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Loại câu hỏi: 1 = Trắc nghiệm một đáp án, 3 = Trả lời ngắn, 5 = Đúng-sai nhiều ý
        /// </summary>
        public int QuestionType { get; set; }

        /// <summary>
        /// Giải thích đáp án
        /// </summary>
        public string Explanation { get; set; }

        /// <summary>
        /// Thứ tự câu hỏi trong bài thi
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Điểm số của câu hỏi
        /// </summary>
        public decimal Score { get; set; }

        /// <summary>
        /// Danh sách các lựa chọn của câu hỏi
        /// </summary>
        public List<QuestionOptionDTO> Options { get; set; }
    }

    /// <summary>
    /// DTO chứa thông tin của một lựa chọn trong câu hỏi
    /// </summary>
    public class ExamQuestionOptionDTO
    {
        /// <summary>
        /// ID của lựa chọn
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Nội dung của lựa chọn
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Cờ báo hiệu lựa chọn đúng
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Thứ tự của lựa chọn
        /// </summary>
        public int OrderIndex { get; set; }
    }

    /// <summary>
    /// DTO chứa thông tin chi tiết của một bài thi kèm danh sách câu hỏi
    /// </summary>
    public class ExamDetailDTO : ExamListDTO
    {
        /// <summary>
        /// Cấu hình tính điểm (JSON)
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Danh sách câu hỏi trong bài thi
        /// </summary>
        public List<ExamQuestionDetailDTO> Questions { get; set; }
    }
}