using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// Controller quản lý kết quả bài thi, bao gồm các chức năng xem kết quả và chấm điểm
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExamResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Khởi tạo controller với database context
        /// </summary>
        /// <param name="context">Database context</param>
        public ExamResultsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách kết quả thi của một học sinh
        /// </summary>
        /// <param name="studentId">Id của học sinh</param>
        /// <returns>Danh sách kết quả thi của học sinh</returns>
        /// <remarks>
        /// - Học sinh chỉ có thể xem kết quả của chính mình
        /// - Admin và giáo viên có thể xem kết quả của bất kỳ học sinh nào
        /// </remarks>
        /// <response code="200">Trả về danh sách kết quả thi</response>
        /// <response code="403">Không có quyền truy cập</response>
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Teacher,Student")]
        public async Task<IActionResult> GetStudentResults(int studentId)
        {
            // Kiểm tra quyền truy cập
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);
            var userRole = User.FindFirst("role")?.Value;

            if (userRole != "Admin" && userRole != "Teacher" && currentUserId != studentId)
            {
                return Forbid("Bạn không có quyền xem kết quả thi của học sinh này");
            }

            var results = await _context.ExamResults
                .Where(er => er.StudentId == studentId)
                .Include(er => er.Exam)
                    .ThenInclude(e => e.Subject)
                .Include(er => er.GradedBy)
                .OrderByDescending(er => er.StartedAt) // Thay đổi từ StartTime sang StartedAt
                .Select(er => new
                {
                    er.Id,
                    er.ExamId,
                    ExamTitle = er.Exam.Title,
                    SubjectName = er.Exam.Subject.Name,
                    StartTime = er.StartedAt, // Thay đổi từ StartTime sang StartedAt
                    EndTime = er.CompletedAt, // Thay đổi từ EndTime sang CompletedAt
                    er.Score,
                    er.IsCompleted,
                    er.GradingStatus,
                    GradedBy = er.GradedBy != null ? er.GradedBy.FullName : null,
                    er.GradedAt,
                    er.TeacherComment
                })
                .ToListAsync();

            return Ok(results);
        }

        /// <summary>
        /// Lấy danh sách kết quả thi của một bài thi
        /// </summary>
        /// <param name="examId">Id của bài thi</param>
        /// <returns>Danh sách kết quả của bài thi</returns>
        /// <remarks>
        /// Chỉ dành cho Admin và giáo viên
        /// </remarks>
        /// <response code="200">Trả về danh sách kết quả thi theo bài thi</response>
        [HttpGet("exam/{examId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetExamResults(int examId)
        {
            var results = await _context.ExamResults
                .Where(er => er.ExamId == examId)
                .Include(er => er.Student)
                .Include(er => er.GradedBy)
                .OrderByDescending(er => er.StartedAt) // Thay đổi từ StartTime sang StartedAt
                .Select(er => new
                {
                    er.Id,
                    er.StudentId,
                    StudentName = er.Student.FullName,
                    StartTime = er.StartedAt, // Thay đổi từ StartTime sang StartedAt
                    EndTime = er.CompletedAt, // Thay đổi từ EndTime sang CompletedAt
                    er.Score,
                    er.IsCompleted,
                    er.GradingStatus,
                    GradedBy = er.GradedBy != null ? er.GradedBy.FullName : null,
                    er.GradedAt,
                    er.TeacherComment
                })
                .ToListAsync();

            return Ok(results);
        }

        /// <summary>
        /// Lấy chi tiết kết quả thi bao gồm câu hỏi và câu trả lời
        /// </summary>
        /// <param name="id">Id của kết quả thi</param>
        /// <returns>Chi tiết kết quả thi</returns>
        /// <remarks>
        /// - Học sinh chỉ có thể xem kết quả của chính mình
        /// - Admin và giáo viên có thể xem kết quả của bất kỳ học sinh nào
        /// </remarks>
        /// <response code="200">Trả về chi tiết kết quả thi</response>
        /// <response code="403">Không có quyền truy cập</response>
        /// <response code="404">Không tìm thấy kết quả thi</response>
        [HttpGet("{id}/detail")]
        [Authorize(Roles = "Admin,Teacher,Student")]
        public async Task<IActionResult> GetExamResultDetail(int id)
        {
            var examResult = await _context.ExamResults
                .Include(er => er.Exam)
                .Include(er => er.Student)
                .Include(er => er.GradedBy)
                .Include(er => er.StudentAnswers)
                    .ThenInclude(sa => sa.Question)
                        .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(er => er.Id == id);

            if (examResult == null)
            {
                return NotFound("Kết quả thi không tồn tại");
            }

            // Kiểm tra quyền truy cập
            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);
            var userRole = User.FindFirst("role")?.Value;

            if (userRole != "Admin" && userRole != "Teacher" && currentUserId != examResult.StudentId)
            {
                return Forbid("Bạn không có quyền xem kết quả thi này");
            }

            // Chuyển đổi thành đối tượng trả về
            var result = new
            {
                examResult.Id,
                examResult.ExamId,
                ExamTitle = examResult.Exam.Title,
                ExamDescription = examResult.Exam.Description,
                SubjectId = examResult.Exam.SubjectId,
                SubjectName = examResult.Exam.Subject.Name,
                ExamTypeId = examResult.Exam.ExamTypeId,
                ExamTypeName = examResult.Exam.ExamType.Name,
                examResult.StudentId,
                StudentName = examResult.Student.FullName,
                StartTime = examResult.StartedAt, // Thay đổi từ StartTime sang StartedAt
                EndTime = examResult.CompletedAt, // Thay đổi từ EndTime sang CompletedAt
                examResult.Score,
                examResult.IsCompleted,
                examResult.GradingStatus,
                examResult.GradedById,
                GradedByName = examResult.GradedBy != null ? examResult.GradedBy.FullName : null,
                examResult.GradedAt,
                examResult.TeacherComment,
                Answers = examResult.StudentAnswers.Select(sa => new
                {
                    sa.Id,
                    sa.QuestionId,
                    QuestionText = sa.Question.Content, // Thay đổi từ QuestionText sang Content
                    QuestionType = sa.Question.QuestionType,
                    sa.SelectedOptionId,
                    AnswerText = sa.TextAnswer, // Thay đổi từ AnswerText sang TextAnswer nếu cần
                    sa.IsCorrect,
                    sa.Score,
                    Options = sa.Question.Options.Select(o => new
                    {
                        o.Id,
                        OptionText = o.Content, // Thay đổi từ OptionText sang Content
                        o.IsCorrect
                    })
                }).ToList()
            };

            return Ok(result);
        }

        /// <summary>
        /// Chấm điểm kết quả bài thi
        /// </summary>
        /// <param name="id">Id của kết quả thi cần chấm</param>
        /// <param name="request">Dữ liệu chấm điểm</param>
        /// <returns>Kết quả chấm điểm</returns>
        /// <remarks>
        /// Chỉ dành cho Admin và giáo viên
        /// </remarks>
        /// <response code="200">Chấm điểm thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="404">Không tìm thấy kết quả thi</response>
        [HttpPost("grade/{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GradeExamResult(int id, [FromBody] GradeExamResultRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var examResult = await _context.ExamResults
                .Include(er => er.StudentAnswers)
                .FirstOrDefaultAsync(er => er.Id == id);

            if (examResult == null)
            {
                return NotFound("Kết quả thi không tồn tại");
            }

            var currentUserId = int.Parse(User.FindFirst("uid")?.Value);

            // Cập nhật thông tin chấm điểm
            examResult.GradedById = currentUserId;
            examResult.GradedAt = DateTime.UtcNow;
            examResult.TeacherComment = request.TeacherComment;
            examResult.GradingStatus = 2; // Đã chấm

            // Nếu có điểm số mới
            if (request.Score.HasValue)
            {
                examResult.Score = (decimal)request.Score.Value; // Chuyển đổi từ double sang decimal nếu cần
            }

            // Cập nhật điểm cho từng câu hỏi nếu có
            if (request.QuestionScores != null && request.QuestionScores.Any())
            {
                foreach (var questionScore in request.QuestionScores)
                {
                    var studentAnswer = examResult.StudentAnswers
                        .FirstOrDefault(sa => sa.QuestionId == questionScore.QuestionId);

                    if (studentAnswer != null)
                    {
                        studentAnswer.Score = (decimal)questionScore.Score; // Chuyển đổi từ double sang decimal nếu cần
                        studentAnswer.IsCorrect = questionScore.IsCorrect;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Chấm điểm thành công" });
        }
    }

    /// <summary>
    /// DTO cho request chấm điểm bài thi
    /// </summary>
    public class GradeExamResultRequest
    {
        /// <summary>
        /// Điểm số mới cho bài thi (nếu có)
        /// </summary>
        public double? Score { get; set; }

        /// <summary>
        /// Nhận xét của giáo viên
        /// </summary>
        public string TeacherComment { get; set; }

        /// <summary>
        /// Danh sách điểm cho từng câu hỏi
        /// </summary>
        public List<QuestionScoreDTO> QuestionScores { get; set; }
    }

    /// <summary>
    /// DTO cho điểm số của một câu hỏi
    /// </summary>
    public class QuestionScoreDTO
    {
        /// <summary>
        /// Id của câu hỏi
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// Điểm số cho câu hỏi
        /// </summary>
        public double Score { get; set; }

        /// <summary>
        /// Đánh dấu câu trả lời là đúng hay sai
        /// </summary>
        public bool IsCorrect { get; set; }
    }
}