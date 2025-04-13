using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.Models;

namespace webthitn_backend.Services
{
    /// <summary>
    /// Service quản lý phiên làm bài thi
    /// </summary>
    public class ExamSessionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Khởi tạo service
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="httpContextAccessor">HTTP Context Accessor</param>
        public ExamSessionService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Tạo phiên làm bài thi mới
        /// </summary>
        /// <param name="studentId">ID học sinh</param>
        /// <param name="examId">ID bài thi</param>
        /// <returns>Phiên thi mới được tạo</returns>
        public async Task<ExamSession> CreateSessionAsync(int studentId, int examId)
        {
            // Lấy thông tin trình duyệt và IP
            string browserInfo = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString() ?? "";
            string ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "";

            // Kiểm tra bài thi tồn tại và đang mở
            var exam = await _context.Exams
                .FirstOrDefaultAsync(e => e.Id == examId && e.IsActive);

            if (exam == null)
            {
                throw new Exception("Bài thi không tồn tại hoặc không khả dụng");
            }

            // Tạo kết quả bài thi mới nếu cần
            ExamResult examResult = null;

            // Kiểm tra xem có kết quả bài thi đang làm dở không
            examResult = await _context.ExamResults
                .FirstOrDefaultAsync(er => er.ExamId == examId &&
                                      er.StudentId == studentId &&
                                      !er.IsCompleted);

            if (examResult == null)
            {
                // Đếm số lần làm bài
                var attemptCount = await _context.ExamResults
                    .CountAsync(er => er.StudentId == studentId && er.ExamId == examId);

                // Kiểm tra số lần làm tối đa
                if (exam.MaxAttempts > 0 && attemptCount >= exam.MaxAttempts)
                {
                    throw new Exception($"Bạn đã làm bài thi này đủ số lần cho phép ({exam.MaxAttempts} lần)");
                }

                // Tạo kết quả bài thi mới
                examResult = new ExamResult
                {
                    ExamId = examId,
                    StudentId = studentId,
                    StartedAt = DateTime.UtcNow,
                    IsCompleted = false,
                    Duration = 0,
                    Score = 0,
                    CorrectAnswers = 0,
                    TotalQuestions = 0,
                    AnsweredQuestions = 0,
                    AttemptNumber = attemptCount + 1,
                    GradingStatus = 0,
                    IsSubmittedManually = false,
                    IsPassed = false,
                    IPAddress = ipAddress,
                    DeviceInfo = browserInfo
                };

                _context.ExamResults.Add(examResult);
                await _context.SaveChangesAsync();
            }

            // Tạo phiên làm bài
            var session = new ExamSession
            {
                ExamId = examId,
                StudentId = studentId,
                ExamResultId = examResult.Id,
                StartTime = DateTime.UtcNow,
                BrowserInfo = browserInfo,
                IPAddress = ipAddress,
                IsActive = true,
                LastActivityTime = DateTime.UtcNow
            };

            _context.ExamSessions.Add(session);
            await _context.SaveChangesAsync();

            // Nếu là phiên mới hoàn toàn, tạo các StudentAnswer
            if (examResult.TotalQuestions == 0)
            {
                // Lấy danh sách câu hỏi trong bài thi
                var examQuestions = await _context.ExamQuestions
                    .Where(eq => eq.ExamId == examId)
                    .Include(eq => eq.Question)
                    .OrderBy(eq => eq.OrderIndex)
                    .ToListAsync();

                // Tạo StudentAnswer cho mỗi câu hỏi
                foreach (var examQuestion in examQuestions)
                {
                    var studentAnswer = new StudentAnswer
                    {
                        ExamResultId = examResult.Id,
                        ExamQuestionId = examQuestion.Id,
                        QuestionId = examQuestion.QuestionId,
                        QuestionOrder = examQuestion.OrderIndex,
                        MaxScore = examQuestion.Score,
                        Score = 0,
                        Status = 0, // Chưa trả lời
                        IsCorrect = false
                    };

                    _context.StudentAnswers.Add(studentAnswer);
                }

                // Cập nhật tổng số câu hỏi
                examResult.TotalQuestions = examQuestions.Count;

                await _context.SaveChangesAsync();
            }

            return session;
        }

        /// <summary>
        /// Kết thúc phiên làm bài thi
        /// </summary>
        /// <param name="sessionId">ID phiên làm bài</param>
        /// <param name="isCompleted">Đã hoàn thành bài thi</param>
        /// <returns>Thành công hay không</returns>
        public async Task<bool> EndSessionAsync(int sessionId, bool isCompleted = false)
        {
            var session = await _context.ExamSessions
                .Include(s => s.ExamResult)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.IsActive);

            if (session == null)
                return false;

            session.IsActive = false;
            session.EndTime = DateTime.UtcNow;

            // Nếu học sinh hoàn thành bài thi, cập nhật kết quả
            if (isCompleted && session.ExamResult != null && !session.ExamResult.IsCompleted)
            {
                session.ExamResult.IsCompleted = true;
                session.ExamResult.CompletedAt = DateTime.UtcNow;
                session.ExamResult.Duration = (int)(session.ExamResult.CompletedAt.Value - session.ExamResult.StartedAt).TotalSeconds;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Cập nhật thời gian hoạt động mới nhất của phiên làm bài
        /// </summary>
        /// <param name="sessionId">ID phiên làm bài</param>
        /// <returns>Thành công hay không</returns>
        public async Task<bool> UpdateSessionActivityAsync(int sessionId)
        {
            var session = await _context.ExamSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.IsActive);

            if (session == null)
                return false;

            session.LastActivityTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}