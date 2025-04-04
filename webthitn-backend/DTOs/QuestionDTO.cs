using System;
using System.Collections.Generic;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO hiển thị thông tin câu hỏi trong danh sách
    /// </summary>
    public class QuestionListDTO
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        /// <example>Tính giới hạn của hàm số f(x) = sin(x)/x khi x tiến đến 0</example>
        public string Content { get; set; }

        /// <summary>
        /// Loại câu hỏi
        /// </summary>
        /// <example>Một đáp án</example>
        public string QuestionType { get; set; }

        /// <summary>
        /// Mức độ câu hỏi
        /// </summary>
        /// <example>Vận dụng</example>
        public string Level { get; set; }

        /// <summary>
        /// Điểm mặc định
        /// </summary>
        /// <example>1</example>
        public decimal DefaultScore { get; set; }

        /// <summary>
        /// Thông tin môn học
        /// </summary>
        public required SubjectBasicDTO Subject { get; set; }

        /// <summary>
        /// Thông tin chương
        /// </summary>
        public ChapterBasicDTO Chapter { get; set; }

        /// <summary>
        /// Tags của câu hỏi
        /// </summary>
        /// <example>giới hạn,đạo hàm</example>
        public string Tags { get; set; }

        /// <summary>
        /// Số lượng đáp án
        /// </summary>
        /// <example>4</example>
        public int OptionsCount { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        /// <example>true</example>
        public bool IsActive { get; set; }

        /// <summary>
        /// Thời gian tạo
        /// </summary>
        /// <example>2025-04-03T13:18:47Z</example>
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO hiển thị chi tiết câu hỏi
    /// </summary>
    public class QuestionDetailDTO
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        /// <example>Tính giới hạn của hàm số f(x) = sin(x)/x khi x tiến đến 0</example>
        public string Content { get; set; }

        /// <summary>
        /// Giải thích cho câu hỏi
        /// </summary>
        /// <example>Áp dụng định lý L'Hospital ta có giới hạn bằng 1</example>
        public string Explanation { get; set; }

        /// <summary>
        /// ID môn học
        /// </summary>
        /// <example>1</example>
        public int SubjectId { get; set; }

        /// <summary>
        /// ID chương
        /// </summary>
        /// <example>3</example>
        public int? ChapterId { get; set; }

        /// <summary>
        /// ID mức độ câu hỏi
        /// </summary>
        /// <example>3</example>
        public int QuestionLevelId { get; set; }

        /// <summary>
        /// Loại câu hỏi (1: Một đáp án, 2: Nhiều đáp án, 3: Điền từ, 4: Ghép đôi)
        /// </summary>
        /// <example>1</example>
        public int QuestionType { get; set; }

        /// <summary>
        /// Tags của câu hỏi
        /// </summary>
        /// <example>giới hạn,đạo hàm</example>
        public string Tags { get; set; }

        /// <summary>
        /// Thời gian làm câu hỏi gợi ý (giây)
        /// </summary>
        /// <example>60</example>
        public int? SuggestedTime { get; set; }

        /// <summary>
        /// Điểm mặc định
        /// </summary>
        /// <example>1</example>
        public decimal DefaultScore { get; set; }

        /// <summary>
        /// Có đường dẫn đến hình ảnh hay không
        /// </summary>
        /// <example>true</example>
        public bool HasImage { get; set; }

        /// <summary>
        /// Đường dẫn hình ảnh
        /// </summary>
        /// <example>/uploads/questions/image1.png</example>
        public string ImagePath { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        /// <example>true</example>
        public bool IsActive { get; set; }

        /// <summary>
        /// Thông tin môn học
        /// </summary>
        public required SubjectBasicDTO Subject { get; set; }

        /// <summary>
        /// Thông tin chương
        /// </summary>
        public ChapterBasicDTO Chapter { get; set; }

        /// <summary>
        /// Thông tin mức độ
        /// </summary>
        public QuestionLevelDTO Level { get; set; }

        /// <summary>
        /// Thông tin người tạo
        /// </summary>
        public UserBasicDTO Creator { get; set; }

        /// <summary>
        /// Danh sách đáp án
        /// </summary>
        public IEnumerable<QuestionOptionDTO> Options { get; set; }
    }

    /// <summary>
    /// DTO cho mức độ câu hỏi
    /// </summary>
    public class QuestionLevelDTO
    {
        /// <summary>
        /// ID của mức độ
        /// </summary>
        /// <example>3</example>
        public int Id { get; set; }

        /// <summary>
        /// Tên mức độ
        /// </summary>
        /// <example>Vận dụng thấp</example>
        public string Name { get; set; }

        /// <summary>
        /// Giá trị số của mức độ
        /// </summary>
        /// <example>3</example>
        public int Value { get; set; }

        /// <summary>
        /// Mô tả mức độ
        /// </summary>
        /// <example>Câu hỏi mức độ vận dụng thấp</example>
        public string Description { get; set; }
    }

    /// <summary>
    /// DTO cho đáp án câu hỏi
    /// </summary>
    public class QuestionOptionDTO
    {
        /// <summary>
        /// ID của đáp án
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Nội dung đáp án
        /// </summary>
        /// <example>1</example>
        public string Content { get; set; }

        /// <summary>
        /// Đánh dấu đáp án đúng
        /// </summary>
        /// <example>true</example>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Thứ tự hiển thị
        /// </summary>
        /// <example>1</example>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Đường dẫn hình ảnh (nếu có)
        /// </summary>
        /// <example>/uploads/options/image1.png</example>
        public string ImagePath { get; set; }

        /// <summary>
        /// Giải thích cho đáp án
        /// </summary>
        /// <example>Đây là đáp án đúng vì...</example>
        public string Explanation { get; set; }

        /// <summary>
        /// Giá trị ghép đôi (cho câu hỏi ghép đôi)
        /// </summary>
        /// <example>Paris</example>
        public string MatchingValue { get; set; }
    }

    /// <summary>
    /// DTO để tạo mới câu hỏi
    /// </summary>
    public class CreateQuestionDTO
    {
        /// <summary>
        /// Nội dung câu hỏi
        /// </summary>
        /// <example>Tính giới hạn của hàm số f(x) = sin(x)/x khi x tiến đến 0</example>
        public string Content { get; set; }

        /// <summary>
        /// Giải thích cho câu hỏi
        /// </summary>
        /// <example>Áp dụng định lý L'Hospital ta có giới hạn bằng 1</example>
        public string Explanation { get; set; }

        /// <summary>
        /// ID môn học
        /// </summary>
        /// <example>1</example>
        public int SubjectId { get; set; }

        /// <summary>
        /// ID chương (không bắt buộc)
        /// </summary>
        /// <example>3</example>
        public int? ChapterId { get; set; }

        /// <summary>
        /// ID mức độ câu hỏi
        /// </summary>
        /// <example>3</example>
        public int QuestionLevelId { get; set; }

        /// <summary>
        /// Loại câu hỏi (1: Một đáp án, 2: Nhiều đáp án, 3: Điền từ, 4: Ghép đôi)
        /// </summary>
        /// <example>1</example>
        public int QuestionType { get; set; }

        /// <summary>
        /// Tags của câu hỏi, phân cách bởi dấu phẩy
        /// </summary>
        /// <example>giới hạn,đạo hàm</example>
        public string Tags { get; set; }

        /// <summary>
        /// Thời gian làm câu hỏi gợi ý (giây)
        /// </summary>
        /// <example>60</example>
        public int? SuggestedTime { get; set; }

        /// <summary>
        /// Điểm mặc định
        /// </summary>
        /// <example>1</example>
        public decimal DefaultScore { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        /// <example>true</example>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Danh sách các đáp án
        /// </summary>
        public List<CreateQuestionOptionDTO> Options { get; set; }
    }

    /// <summary>
    /// DTO để tạo mới đáp án
    /// </summary>
    public class CreateQuestionOptionDTO
    {
        /// <summary>
        /// Nội dung đáp án
        /// </summary>
        /// <example>1</example>
        public string Content { get; set; }

        /// <summary>
        /// Đánh dấu đáp án đúng
        /// </summary>
        /// <example>true</example>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Thứ tự hiển thị
        /// </summary>
        /// <example>1</example>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Giải thích cho đáp án
        /// </summary>
        /// <example>Đây là đáp án đúng vì...</example>
        public string Explanation { get; set; }

        /// <summary>
        /// Giá trị ghép đôi (cho câu hỏi ghép đôi)
        /// </summary>
        /// <example>Paris</example>
        public string MatchingValue { get; set; }
    }

    /// <summary>
    /// Tham số truyền vào khi lọc câu hỏi
    /// </summary>
    public class QuestionFilterDTO
    {
        /// <summary>
        /// ID của môn học cần lọc
        /// </summary>
        /// <example>1</example>
        public int? SubjectId { get; set; }

        /// <summary>
        /// ID của chương cần lọc
        /// </summary>
        /// <example>3</example>
        public int? ChapterId { get; set; }

        /// <summary>
        /// ID của mức độ cần lọc
        /// </summary>
        /// <example>3</example>
        public int? QuestionLevelId { get; set; }

        /// <summary>
        /// Loại câu hỏi cần lọc
        /// </summary>
        /// <example>1</example>
        public int? QuestionType { get; set; }

        /// <summary>
        /// Trang hiện tại
        /// </summary>
        /// <example>1</example>
        public int Page { get; set; } = 1;

        /// <summary>
        /// Số lượng bản ghi mỗi trang
        /// </summary>
        /// <example>20</example>
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// Chỉ lấy các câu hỏi đang hoạt động
        /// </summary>
        /// <example>true</example>
        public bool ActiveOnly { get; set; } = true;

        /// <summary>
        /// Tags cần lọc
        /// </summary>
        /// <example>giới hạn</example>
        public string Tags { get; set; }

        /// <summary>
        /// Từ khóa tìm kiếm (nội dung câu hỏi)
        /// </summary>
        /// <example>giới hạn</example>
        public string SearchTerm { get; set; }
    }
}