using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Services
{
    public interface IExamGradingService
    {
        /// <summary>
        /// Chấm điểm và lưu kết quả bài thi
        /// </summary>
        Task<ExamResult> GradeAndSaveExamResult(SubmitExamDTO submitDto, int userId);

        /// <summary>
        /// Lấy chi tiết kết quả bài thi
        /// </summary>
        Task<ExamResultDetailDTO> GetExamResultDetail(ExamResult examResult, bool showAllDetails);

        /// <summary>
        /// Xóa kết quả bài thi
        /// </summary>
        Task<bool> DeleteExamResult(ExamResult examResult);

        /// <summary>
        /// Cập nhật kết quả bài thi (dành cho giáo viên chấm điểm)
        /// </summary>
        Task<bool> UpdateExamResult(int resultId, UpdateResultDTO updateDto, int reviewerId);
    }
}