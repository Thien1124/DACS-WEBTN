using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Filters; 

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
        /// Loại câu hỏi
        /// 1: Một đáp án (trắc nghiệm a,b,c,d)
        /// 3: Trả lời ngắn với nhiều đáp án có thể chấp nhận được
        /// 5: Đúng-sai nhiều ý (dùng cho trắc nghiệm đúng-sai 4 ý)
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
        /// Cấu hình tính điểm cho câu hỏi đúng-sai nhiều ý (JSON)
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Cấu hình cho câu hỏi trả lời ngắn (JSON)
        /// </summary>
        public string ShortAnswerConfig { get; set; }

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
        /// Ký hiệu tùy chỉnh (a, b, c, d hoặc khác) cho đáp án
        /// </summary>
        /// <example>a</example>
        public string Label { get; set; }

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
        [DefaultValue("")]
        public string MatchingValue { get; set; } = "";

        /// <summary>
        /// Đánh dấu nếu đây là một mục Đúng-Sai trong câu hỏi đúng-sai nhiều ý
        /// </summary>
        [DefaultValue(false)]
        public bool IsPartOfTrueFalseGroup { get; set; } = false;

        /// <summary>
        /// Nhóm đáp án (dùng cho câu hỏi đúng-sai nhiều ý)
        /// </summary>
        [DefaultValue(0)]
        public int? GroupId { get; set; } = 0;

        /// <summary>
        /// Mức điểm cho đáp án này (0-100%)
        /// </summary>
        /// <example>100</example>
        [DefaultValue(100)]
        public int ScorePercentage { get; set; } = 100;
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
        [Required(ErrorMessage = "Nội dung câu hỏi không được để trống")]
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
        [Required(ErrorMessage = "ID môn học không được để trống")]
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
        [Required(ErrorMessage = "ID mức độ câu hỏi không được để trống")]
        public int QuestionLevelId { get; set; }

        /// <summary>
        /// Loại câu hỏi
        /// 1: Một đáp án (trắc nghiệm a,b,c,d)
        /// 3: Trả lời ngắn với nhiều đáp án có thể chấp nhận được
        /// 5: Đúng-sai nhiều ý (dùng cho trắc nghiệm đúng-sai 4 ý)
        /// </summary>
        /// <example>1</example>
        [Required(ErrorMessage = "Loại câu hỏi không được để trống")]
        [Range(1, 5, ErrorMessage = "Loại câu hỏi phải từ 1 đến 5")]
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
        [Range(0.1, 10, ErrorMessage = "Điểm mặc định phải từ 0.1 đến 10")]
        [DefaultValue(1)]
        public decimal DefaultScore { get; set; } = 1;

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        /// <example>true</example>
        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Cấu hình tính điểm cho câu hỏi đúng-sai nhiều ý (JSON)
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Cấu hình cho câu hỏi trả lời ngắn (JSON)
        /// </summary>
        public string ShortAnswerConfig { get; set; }

        /// <summary>
        /// Danh sách các đáp án
        /// </summary>
        [Required(ErrorMessage = "Danh sách đáp án không được để trống")]
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
        [Required(ErrorMessage = "Nội dung đáp án không được để trống")]
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
        [DefaultValue(0)]
        public int OrderIndex { get; set; } = 0;

        /// <summary>
        /// Ký hiệu tùy chỉnh (a, b, c, d hoặc khác) cho đáp án
        /// </summary>
        /// <example>a</example>
        public string Label { get; set; }

        /// <summary>
        /// Giải thích cho đáp án
        /// </summary>
        /// <example>Đây là đáp án đúng vì...</example>
        public string Explanation { get; set; }

        /// <summary>
        /// Giá trị ghép đôi (cho câu hỏi ghép đôi)
        /// </summary>
        /// <example>Paris</example>
        [DefaultValue("")]
        public string MatchingValue { get; set; } = "";

        /// <summary>
        /// Đánh dấu nếu đây là một mục Đúng-Sai trong câu hỏi đúng-sai nhiều ý
        /// </summary>
        [DefaultValue(false)]
        public bool IsPartOfTrueFalseGroup { get; set; } = false;

        /// <summary>
        /// Nhóm đáp án (dùng cho câu hỏi đúng-sai nhiều ý)
        /// </summary>
        [DefaultValue(0)]
        public int? GroupId { get; set; } = 0;

        /// <summary>
        /// Mức điểm cho đáp án này (0-100%)
        /// </summary>
        /// <example>100</example>
        [Range(0, 100, ErrorMessage = "Phần trăm điểm phải từ 0 đến 100")]
        [DefaultValue(100)]
        public int ScorePercentage { get; set; } = 100;
    }

    /// <summary>
    /// DTO để cập nhật câu hỏi
    /// </summary>
    public class UpdateQuestionDTO
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
        public int? SubjectId { get; set; }

        /// <summary>
        /// ID chương
        /// </summary>
        /// <example>3</example>
        public int? ChapterId { get; set; }

        /// <summary>
        /// ID mức độ câu hỏi
        /// </summary>
        /// <example>3</example>
        public int? QuestionLevelId { get; set; }

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
        [Range(0.1, 10, ErrorMessage = "Điểm mặc định phải từ 0.1 đến 10")]
        public decimal? DefaultScore { get; set; }

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        /// <example>true</example>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Cấu hình tính điểm cho câu hỏi đúng-sai nhiều ý (JSON)
        /// </summary>
        public string ScoringConfig { get; set; }

        /// <summary>
        /// Cấu hình cho câu hỏi trả lời ngắn (JSON)
        /// </summary>
        public string ShortAnswerConfig { get; set; }

        /// <summary>
        /// Danh sách các đáp án (để cập nhật)
        /// </summary>
        public List<UpdateQuestionOptionDTO> Options { get; set; }
    }

    /// <summary>
    /// DTO để cập nhật đáp án
    /// </summary>
    public class UpdateQuestionOptionDTO
    {
        /// <summary>
        /// ID của đáp án (nếu cập nhật đáp án hiện có, không có ID sẽ tạo mới)
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
        /// Ký hiệu tùy chỉnh (a, b, c, d hoặc khác) cho đáp án
        /// </summary>
        /// <example>a</example>
        public string Label { get; set; }

        /// <summary>
        /// Giải thích cho đáp án
        /// </summary>
        /// <example>Đây là đáp án đúng vì...</example>
        public string Explanation { get; set; }

        /// <summary>
        /// Giá trị ghép đôi (cho câu hỏi ghép đôi)
        /// </summary>
        /// <example>Paris</example>
        [DefaultValue("")]
        public string MatchingValue { get; set; } = "";

        /// <summary>
        /// Đánh dấu nếu đây là một mục Đúng-Sai trong câu hỏi đúng-sai nhiều ý
        /// </summary>
        [DefaultValue(false)]
        public bool IsPartOfTrueFalseGroup { get; set; } = false;

        /// <summary>
        /// Nhóm đáp án (dùng cho câu hỏi đúng-sai nhiều ý)
        /// </summary>
        [DefaultValue(0)]
        public int? GroupId { get; set; } = 0;

        /// <summary>
        /// Mức điểm cho đáp án này (0-100%)
        /// </summary>
        /// <example>100</example>
        [Range(0, 100, ErrorMessage = "Phần trăm điểm phải từ 0 đến 100")]
        public int ScorePercentage { get; set; } = 100;
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
        /// 1: Một đáp án (trắc nghiệm a,b,c,d)
        /// 3: Trả lời ngắn với nhiều đáp án có thể chấp nhận được
        /// 5: Đúng-sai nhiều ý (dùng cho trắc nghiệm đúng-sai 4 ý)
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

    /// <summary>
    /// Cấu hình cho câu hỏi trả lời ngắn
    /// </summary>
    public class ShortAnswerConfigDTO
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

    /// <summary>
    /// Cấu hình tính điểm cho câu hỏi đúng-sai nhiều ý
    /// </summary>
    public class TrueFalseScoringConfigDTO
    {
        /// <summary>
        /// Điểm cho 1 câu đúng
        /// </summary>
        public decimal OneCorrect { get; set; } = 0.10m;

        /// <summary>
        /// Điểm cho 2 câu đúng
        /// </summary>
        public decimal TwoCorrect { get; set; } = 0.25m;

        /// <summary>
        /// Điểm cho 3 câu đúng
        /// </summary>
        public decimal ThreeCorrect { get; set; } = 0.50m;

        /// <summary>
        /// Điểm cho 4 câu đúng
        /// </summary>
        public decimal FourCorrect { get; set; } = 1.00m;
    }
}
public class OptionImportDTO
{
    public string Content { get; set; }
    public bool IsCorrect { get; set; }
    public string Label { get; set; }
    public int? GroupId { get; set; }
    public int? ScorePercentage { get; set; }
    // Không có Explanation trong DTO hiện tại
}

public class OptionExportDTO
{
    public string Content { get; set; }
    public bool IsCorrect { get; set; }
    public string Label { get; set; }
    public int GroupId { get; set; }
    public int ScorePercentage { get; set; }
}