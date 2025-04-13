using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.Models;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Services
{
    /// <summary>
    /// Service xử lý nghiệp vụ liên quan đến bài thi và kết quả thi
    /// </summary>
    public class ExamService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Khởi tạo đối tượng ExamService
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="httpContextAccessor">HTTP Context Accessor</param>
        public ExamService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Bắt đầu làm bài thi cho học sinh
        /// </summary>
        /// <param name="studentId">ID của học sinh</param>
        /// <param name="examId">ID của bài thi</param>
        /// <returns>Kết quả bài thi mới được tạo</returns>
        public async Task<ExamResult> StartExamAsync(int studentId, int examId)
        {
            // Kiểm tra xem bài thi có tồn tại và đang mở không
            var exam = await _context.Exams
                .FirstOrDefaultAsync(e => e.Id == examId && e.IsActive);

            if (exam == null)
            {
                throw new Exception("Không tìm thấy bài thi hoặc bài thi đã bị khóa");
            }

            // Kiểm tra thời gian làm bài nếu có giới hạn
            if (exam.StartTime.HasValue && DateTime.UtcNow < exam.StartTime.Value)
            {
                throw new Exception("Bài thi chưa được mở");
            }

            if (exam.EndTime.HasValue && DateTime.UtcNow > exam.EndTime.Value)
            {
                throw new Exception("Bài thi đã kết thúc");
            }

            // Kiểm tra xem học sinh có đang làm bài thi khác không
            var ongoingExam = await _context.ExamResults
                .FirstOrDefaultAsync(er => er.StudentId == studentId && !er.IsCompleted);

            if (ongoingExam != null)
            {
                throw new Exception("Bạn đang làm bài thi khác. Vui lòng hoàn thành hoặc hủy bài thi đó trước.");
            }

            // Đếm số lần đã làm bài này
            var attemptCount = await _context.ExamResults
                .CountAsync(er => er.StudentId == studentId && er.ExamId == examId);

            // Kiểm tra số lần làm tối đa
            if (exam.MaxAttempts > 0 && attemptCount >= exam.MaxAttempts)
            {
                throw new Exception($"Bạn đã làm bài thi này đủ số lần cho phép ({exam.MaxAttempts} lần)");
            }

            // Lấy thông tin IP và thiết bị
            string ipAddress = "";
            string userAgent = "";

            if (_httpContextAccessor.HttpContext != null)
            {
                ipAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
                userAgent = _httpContextAccessor.HttpContext.Request.Headers["User-Agent"].ToString() ?? "";
            }

            // Tạo kết quả bài thi mới
            var examResult = new ExamResult
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
                DeviceInfo = userAgent
            };

            _context.ExamResults.Add(examResult);
            await _context.SaveChangesAsync();

            // Lấy danh sách câu hỏi và tạo các đối tượng StudentAnswer
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
            return examResult;
        }

        /// <summary>
        /// Nộp bài thi
        /// </summary>
        /// <param name="studentId">ID của học sinh</param>
        /// <param name="examId">ID của bài thi</param>
        /// <param name="answers">Danh sách câu trả lời</param>
        /// <param name="timeSpent">Thời gian làm bài (giây)</param>
        /// <param name="isManuallySubmitted">Nộp bài tự nguyện hay hết thời gian tự nộp</param>
        /// <returns>Kết quả bài thi sau khi nộp</returns>
        public async Task<ExamResult> SubmitExamAsync(int studentId, int examId, List<StudentAnswerDTO> answers, int timeSpent, bool isManuallySubmitted = true)
        {
            // Kiểm tra xem học sinh có đang làm bài thi này không
            var examResult = await _context.ExamResults
                .Include(er => er.Exam)
                .FirstOrDefaultAsync(er => er.StudentId == studentId && er.ExamId == examId && !er.IsCompleted);

            if (examResult == null)
            {
                throw new Exception("Không tìm thấy bài thi đang làm");
            }

            // Cập nhật thông tin kết quả
            examResult.IsCompleted = true;
            examResult.CompletedAt = DateTime.UtcNow;
            examResult.Duration = timeSpent;
            examResult.IsSubmittedManually = isManuallySubmitted;

            // Lấy thông tin về các câu hỏi trong bài thi
            var examQuestions = await _context.ExamQuestions
                .Where(eq => eq.ExamId == examId)
                .Include(eq => eq.Question)
                    .ThenInclude(q => q.Options)
                .ToDictionaryAsync(eq => eq.QuestionId, eq => eq);

            // Xử lý từng câu trả lời
            foreach (var answer in answers)
            {
                if (!examQuestions.TryGetValue(answer.QuestionId, out var examQuestion))
                    continue;

                // Tìm câu trả lời của học sinh
                var studentAnswer = await _context.StudentAnswers
                    .FirstOrDefaultAsync(sa =>
                        sa.ExamResultId == examResult.Id &&
                        sa.QuestionId == answer.QuestionId);

                if (studentAnswer == null)
                    continue;

                var question = examQuestion.Question;
                bool requiresManualReview = false;

                // Cập nhật trạng thái câu trả lời
                studentAnswer.Status = 1; // Đã trả lời
                studentAnswer.AnsweredAt = DateTime.UtcNow;
                studentAnswer.IsFlagged = answer.IsFlagged;

                // Xử lý dựa trên loại câu hỏi
                switch (question.QuestionType)
                {
                    case 1: // Trắc nghiệm một đáp án
                        if (answer.SelectedOptionId.HasValue)
                        {
                            studentAnswer.SelectedOptionId = answer.SelectedOptionId;

                            // Kiểm tra câu trả lời đúng
                            var option = question.Options
                                .FirstOrDefault(o => o.Id == answer.SelectedOptionId);

                            if (option != null)
                            {
                                studentAnswer.IsCorrect = option.IsCorrect;
                                if (option.IsCorrect)
                                {
                                    studentAnswer.Score = examQuestion.Score;
                                }
                            }
                        }
                        break;

                    case 5: // Đúng-sai nhiều ý
                        if (answer.TrueFalseAnswers != null && answer.TrueFalseAnswers.Any())
                        {
                            studentAnswer.TrueFalseAnswersDictionary = answer.TrueFalseAnswers;

                            // Đánh giá câu trả lời đúng-sai sẽ được thực hiện trong phương thức UpdateScore
                            studentAnswer.UpdateScore();
                        }
                        break;

                    case 3: // Trả lời ngắn
                        if (!string.IsNullOrWhiteSpace(answer.TextAnswer))
                        {
                            studentAnswer.TextAnswer = answer.TextAnswer;
                            requiresManualReview = true;

                            // Tạo thông tin đánh giá ban đầu
                            studentAnswer.ShortAnswerEvaluationInfo = new ShortAnswerEvaluationInfo
                            {
                                OriginalAnswer = answer.TextAnswer,
                                RequiresManualReview = true
                            };
                        }
                        break;
                }

                studentAnswer.RequiresManualReview = requiresManualReview;
                studentAnswer.ModifiedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Tính toán điểm số
            await CalculateScoreAsync(examResult.Id);

            return await _context.ExamResults
                .Include(er => er.StudentAnswers)
                .FirstOrDefaultAsync(er => er.Id == examResult.Id);
        }

        /// <summary>
        /// Tính điểm cho bài thi dựa trên câu trả lời
        /// </summary>
        /// <param name="examResultId">ID kết quả bài thi</param>
        /// <returns>Thành công hay không</returns>
        public async Task<bool> CalculateScoreAsync(int examResultId)
        {
            var examResult = await _context.ExamResults
                .Include(er => er.Exam)
                .Include(er => er.StudentAnswers)
                    .ThenInclude(sa => sa.Question)
                        .ThenInclude(q => q.Options)
                .Include(er => er.StudentAnswers)
                    .ThenInclude(sa => sa.ExamQuestion)
                .FirstOrDefaultAsync(er => er.Id == examResultId);

            if (examResult == null)
                return false;

            // Cập nhật điểm cho từng câu trả lời
            decimal totalScore = 0;

            foreach (var answer in examResult.StudentAnswers)
            {
                // Đảm bảo rằng MaxScore luôn có giá trị từ ExamQuestion
                if (answer.ExamQuestion != null)
                {
                    answer.MaxScore = answer.ExamQuestion.Score;
                }

                switch (answer.Question?.QuestionType ?? 0)
                {
                    case 1: // Trắc nghiệm một đáp án
                        // Điểm đã được tính trong quá trình nộp bài
                        totalScore += answer.Score;
                        break;

                    case 5: // Đúng-sai nhiều ý
                        // Thực hiện cập nhật điểm nếu cần
                        if (!answer.IsCorrect && !answer.IsPartiallyCorrect)
                        {
                            answer.UpdateScore();
                        }
                        totalScore += answer.Score;
                        break;

                    case 3: // Trả lời ngắn
                        // Câu trả lời ngắn cần được chấm thủ công
                        answer.RequiresManualReview = true;
                        break;
                }
            }

            // Cập nhật thống kê
            examResult.UpdateStatistics();

            // Cập nhật điểm tổng
            examResult.Score = totalScore;

            // Tính điểm phần trăm và đánh giá đạt/không đạt
            examResult.CalculatePercentageAndStatus();

            // Cập nhật trạng thái chấm điểm
            if (examResult.PendingManualGradeCount > 0)
            {
                examResult.GradingStatus = 4; // Đang chờ chấm tay cho câu hỏi trả lời ngắn
            }
            else
            {
                examResult.GradingStatus = 1; // Đã chấm tự động
                examResult.GradedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Chấm điểm thủ công cho câu trả lời ngắn
        /// </summary>
        /// <param name="gradeItems">Danh sách thông tin chấm điểm</param>
        /// <param name="teacherId">ID của giáo viên chấm điểm</param>
        /// <param name="comment">Nhận xét của giáo viên</param>
        /// <returns>Kết quả bài thi sau khi chấm</returns>
        public async Task<ExamResult> GradeManuallyAsync(List<ManualGradeDTO> gradeItems, int teacherId, string comment = "")
        {
            if (gradeItems == null || !gradeItems.Any())
                throw new ArgumentException("Danh sách câu trả lời cần chấm không được để trống");

            // Lấy ID của kết quả bài thi từ câu trả lời đầu tiên
            var firstAnswerId = gradeItems.First().AnswerId;
            var studentAnswer = await _context.StudentAnswers
                .Include(sa => sa.ExamResult)
                .FirstOrDefaultAsync(sa => sa.Id == firstAnswerId);

            if (studentAnswer == null)
                throw new Exception("Không tìm thấy câu trả lời");

            var examResultId = studentAnswer.ExamResultId;

            // Lấy kết quả bài thi
            var examResult = await _context.ExamResults
                .Include(er => er.StudentAnswers)
                .FirstOrDefaultAsync(er => er.Id == examResultId);

            if (examResult == null)
                throw new Exception("Không tìm thấy kết quả bài thi");

            // Kiểm tra xem bài thi có được hoàn thành không
            if (!examResult.IsCompleted)
                throw new Exception("Bài thi chưa được hoàn thành nên không thể chấm điểm");

            // Chấm điểm từng câu trả lời
            foreach (var gradeItem in gradeItems)
            {
                var answer = await _context.StudentAnswers
                    .FirstOrDefaultAsync(sa => sa.Id == gradeItem.AnswerId && sa.ExamResultId == examResultId);

                if (answer != null)
                {
                    // Cập nhật điểm và trạng thái
                    answer.Score = gradeItem.Score;
                    answer.IsCorrect = gradeItem.IsCorrect;
                    answer.IsPartiallyCorrect = gradeItem.IsPartiallyCorrect;
                    answer.RequiresManualReview = false;
                    answer.TeacherNote = gradeItem.Comment;

                    // Nếu là câu trả lời ngắn, cập nhật thông tin đánh giá
                    if (!string.IsNullOrEmpty(answer.TextAnswer))
                    {
                        var evaluationInfo = answer.ShortAnswerEvaluationInfo;
                        evaluationInfo.IsExactMatch = gradeItem.IsCorrect;
                        evaluationInfo.IsPartialMatch = gradeItem.IsPartiallyCorrect;
                        evaluationInfo.RequiresManualReview = false;
                        evaluationInfo.SimilarityScore = gradeItem.IsCorrect ? 100 : (gradeItem.IsPartiallyCorrect ? 50 : 0);

                        answer.ShortAnswerEvaluationInfo = evaluationInfo;
                    }
                }
            }

            // Cập nhật thông tin chấm điểm
            examResult.TeacherComment = comment;
            examResult.GradedById = teacherId;
            examResult.GradedAt = DateTime.UtcNow;

            // Tính lại thống kê và điểm
            examResult.UpdateStatistics();

            // Cập nhật trạng thái chấm bài
            if (examResult.PendingManualGradeCount > 0)
            {
                examResult.GradingStatus = 3; // Đã chấm kết hợp (tự động + thủ công)
            }
            else
            {
                examResult.GradingStatus = 2; // Đã chấm thủ công
            }

            // Tính lại điểm tổng
            decimal totalScore = examResult.StudentAnswers.Sum(sa => sa.Score);
            examResult.Score = totalScore;

            // Tính điểm phần trăm và đánh giá đạt/không đạt
            examResult.CalculatePercentageAndStatus();

            await _context.SaveChangesAsync();
            return examResult;
        }
    }

    /// <summary>
    /// DTO cho câu trả lời của học sinh
    /// </summary>
    public class StudentAnswerDTO
    {
        /// <summary>
        /// ID của câu hỏi
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// ID của đáp án được chọn (cho câu hỏi trắc nghiệm)
        /// </summary>
        public int? SelectedOptionId { get; set; }

        /// <summary>
        /// Câu trả lời văn bản (cho câu hỏi trả lời ngắn)
        /// </summary>
        public string TextAnswer { get; set; }

        /// <summary>
        /// Câu trả lời đúng-sai nhiều ý
        /// </summary>
        public Dictionary<string, bool> TrueFalseAnswers { get; set; }

        /// <summary>
        /// Đánh dấu xem lại câu hỏi
        /// </summary>
        public bool IsFlagged { get; set; }
    }

    /// <summary>
    /// DTO cho chấm điểm thủ công
    /// </summary>
    public class ManualGradeDTO
    {
        /// <summary>
        /// ID của câu trả lời
        /// </summary>
        public int AnswerId { get; set; }

        /// <summary>
        /// Điểm cho câu trả lời
        /// </summary>
        public decimal Score { get; set; }

        /// <summary>
        /// Câu trả lời có đúng hoàn toàn không
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Câu trả lời có đúng một phần không
        /// </summary>
        public bool IsPartiallyCorrect { get; set; }

        /// <summary>
        /// Nhận xét của giáo viên
        /// </summary>
        public string Comment { get; set; }
    }
}