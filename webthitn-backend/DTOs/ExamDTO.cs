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
}