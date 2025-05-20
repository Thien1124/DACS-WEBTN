using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Models.Users;
using WEBTHITN_Backend.Helpers;
using Newtonsoft.Json;

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// API để học sinh truy cập và làm bài thi
    /// </summary>
    [Route("api/student/exams")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentExamController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StudentExamController> _logger;

        /// <summary>
        /// Khởi tạo controller với các dependency
        /// </summary>
        public StudentExamController(ApplicationDbContext context, ILogger<StudentExamController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách kỳ thi chính thức mà học sinh được phân công
        /// </summary>
        /// <param name="status">Trạng thái kỳ thi (all, active, upcoming, completed)</param>
        /// <param name="page">Số trang</param>
        /// <param name="pageSize">Số bản ghi mỗi trang</param>
        /// <returns>Danh sách kỳ thi được phân công</returns>
        [HttpGet("assigned")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAssignedExams(
            [FromQuery] string status = "all",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                int studentId = GetCurrentUserId();
                _logger.LogInformation($"Lấy danh sách kỳ thi được phân công cho học sinh ID: {studentId}, Status: {status}");

                // Lấy danh sách kỳ thi được phân công
                var query = _context.OfficialExamStudents
                    .Include(oes => oes.OfficialExam)
                        .ThenInclude(oe => oe.Exam)
                            .ThenInclude(e => e.Subject)
                    .Include(oes => oes.OfficialExam)
                        .ThenInclude(oe => oe.Creator)
                    .Where(oes => oes.StudentId == studentId)
                    .AsQueryable();

                // Lọc theo trạng thái
                var now = DateTimeHelper.GetVietnamNow();
                switch (status.ToLower())
                {
                    case "active":
                        // Kỳ thi đang diễn ra
                        query = query.Where(oes =>
                            oes.OfficialExam.IsActive &&
                            (!oes.OfficialExam.StartTime.HasValue || oes.OfficialExam.StartTime.Value <= now) &&
                            (!oes.OfficialExam.EndTime.HasValue || oes.OfficialExam.EndTime.Value >= now));
                        break;

                    case "upcoming":
                        // Kỳ thi sắp diễn ra
                        query = query.Where(oes =>
                            oes.OfficialExam.IsActive &&
                            oes.OfficialExam.StartTime.HasValue &&
                            oes.OfficialExam.StartTime.Value > now);
                        break;

                    case "completed":
                        // Kỳ thi đã kết thúc
                        query = query.Where(oes =>
                            !oes.OfficialExam.IsActive ||
                            (oes.OfficialExam.EndTime.HasValue && oes.OfficialExam.EndTime.Value < now) ||
                            oes.HasTaken);
                        break;

                    case "not-taken":
                        // Kỳ thi chưa làm
                        query = query.Where(oes => !oes.HasTaken);
                        break;
                }

                // Đếm tổng số bản ghi
                int totalCount = await query.CountAsync();

                // Phân trang
                var examStudents = await query
                    .OrderByDescending(oes => oes.OfficialExam.StartTime ?? oes.OfficialExam.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Chuyển đổi dữ liệu
                var result = examStudents.Select(oes => new
                {
                    AssignmentId = oes.Id,
                    OfficialExam = new
                    {
                        Id = oes.OfficialExam.Id,
                        Title = oes.OfficialExam.Title,
                        Description = oes.OfficialExam.Description,
                        StartTime = oes.OfficialExam.StartTime,
                        EndTime = oes.OfficialExam.EndTime,
                        ClassroomName = oes.OfficialExam.ClassroomName,
                        IsActive = oes.OfficialExam.IsActive,
                        ResultsReleased = oes.OfficialExam.ResultsReleased
                    },
                    Exam = new
                    {
                        Id = oes.OfficialExam.Exam.Id,
                        Title = oes.OfficialExam.Exam.Title,
                        Duration = oes.OfficialExam.Exam.Duration,
                        TotalScore = oes.OfficialExam.Exam.TotalScore,
                        PassScore = oes.OfficialExam.Exam.PassScore,
                        Subject = oes.OfficialExam.Exam.Subject != null ? new
                        {
                            Id = oes.OfficialExam.Exam.Subject.Id,
                            Name = oes.OfficialExam.Exam.Subject.Name,
                            Code = oes.OfficialExam.Exam.Subject.Code
                        } : null
                    },
                    Creator = oes.OfficialExam.Creator != null ? new
                    {
                        Id = oes.OfficialExam.Creator.Id,
                        Username = oes.OfficialExam.Creator.Username,
                        FullName = oes.OfficialExam.Creator.FullName
                    } : null,
                    HasTaken = oes.HasTaken,
                    ExamResult = oes.ExamResult != null ? new
                    {
                        Id = oes.ExamResult.Id,
                        Score = oes.ExamResult.Score,
                        PercentageScore = oes.ExamResult.PercentageScore,
                        IsPassed = oes.ExamResult.IsPassed,
                        CompletedAt = oes.ExamResult.CompletedAt
                    } : null,
                    Status = GetExamStatus(oes.OfficialExam, oes.HasTaken),
                    CanTakeExam = CanStudentTakeExam(oes.OfficialExam, oes.HasTaken)
                }).ToList();

                return Ok(new
                {
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting assigned exams: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách kỳ thi" });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết kỳ thi để làm bài
        /// </summary>
        /// <param name="officialExamId">ID của kỳ thi chính thức</param>
        /// <returns>Thông tin chi tiết kỳ thi và đề thi</returns>
        [HttpGet("{officialExamId}/take")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> TakeExam(int officialExamId)
        {
            try
            {
                int studentId = GetCurrentUserId();
                _logger.LogInformation($"Học sinh {studentId} đang lấy đề thi {officialExamId}");

                // Kiểm tra xem học sinh có được phân công vào kỳ thi không
                var examStudent = await _context.OfficialExamStudents
                    .Include(oes => oes.OfficialExam)
                        .ThenInclude(oe => oe.Exam)
                    .FirstOrDefaultAsync(oes =>
                        oes.OfficialExamId == officialExamId &&
                        oes.StudentId == studentId);

                if (examStudent == null)
                {
                    return NotFound(new { message = "Bạn không được phân công vào kỳ thi này" });
                }

                // Kiểm tra xem học sinh đã làm bài chưa
                if (examStudent.HasTaken)
                {
                    return BadRequest(new { message = "Bạn đã hoàn thành bài thi này" });
                }

                // Kiểm tra thời gian thi
                var now = DateTimeHelper.GetVietnamNow();
                var officialExam = examStudent.OfficialExam;
                var startTimeVN = officialExam.StartTime.HasValue ? 
                    DateTime.SpecifyKind(officialExam.StartTime.Value, DateTimeKind.Utc).ToVietnamTime() : 
                    DateTime.MinValue;
                var endTimeVN = officialExam.EndTime.HasValue ? 
                    DateTime.SpecifyKind(officialExam.EndTime.Value, DateTimeKind.Utc).ToVietnamTime() : 
                    DateTime.MaxValue;
                if (!officialExam.IsActive)
                {
                    return BadRequest(new { message = "Kỳ thi này hiện không hoạt động" });
                }
                

                if (now < startTimeVN)
                {
                    return BadRequest(new { message = "Kỳ thi chưa bắt đầu", startTime = startTimeVN });
                }

                if (now > endTimeVN)
                {
                    return BadRequest(new { message = "Kỳ thi đã kết thúc", endTime = endTimeVN });
                }

                // Lấy đề thi và câu hỏi
                var exam = await _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.ExamType)
                    .FirstOrDefaultAsync(e => e.Id == officialExam.ExamId);

                if (exam == null)
                {
                    return NotFound(new { message = "Không tìm thấy đề thi" });
                }

                // Lấy danh sách câu hỏi của đề thi
                var examQuestions = await _context.ExamQuestions
                    .Include(eq => eq.Question)
                        .ThenInclude(q => q.Options.OrderBy(o => o.OrderIndex))
                    .Include(eq => eq.Question)
                        .ThenInclude(q => q.Level)
                    .Where(eq => eq.ExamId == exam.Id)
                    .OrderBy(eq => eq.OrderIndex)
                    .ToListAsync();

                // Xử lý hiển thị câu hỏi và đáp án
                var questions = new List<object>();

                foreach (var eq in examQuestions)
                {
                    if (eq.Question == null) continue;

                    // Lấy danh sách đáp án
                    var options = eq.Question.Options?
                        .Select(o => new
                        {
                            id = o.Id,
                            content = o.Content,
                            label = o.Label,
                            imagePath = o.ImagePath,
                            // Không trả về đáp án đúng
                            isCorrect = (bool?)null,
                            orderIndex = exam.ShuffleOptions ? 0 : o.OrderIndex
                        })
                        .ToList();

                    // Xáo trộn đáp án nếu cần
                    if (exam.ShuffleOptions && options != null)
                    {
                        options = options.OrderBy(o => Guid.NewGuid()).ToList();
                        // Gán lại OrderIndex sau khi xáo trộn
                        for (int i = 0; i < options.Count; i++)
                        {
                            options[i] = new
                            {
                                id = options[i].id,
                                content = options[i].content,
                                label = options[i].label,
                                imagePath = options[i].imagePath,
                                isCorrect = options[i].isCorrect,
                                orderIndex = i + 1
                            };
                        }
                    }

                    questions.Add(new
                    {
                        examQuestionId = eq.Id,
                        questionId = eq.QuestionId,
                        orderIndex = eq.OrderIndex,
                        score = eq.Score,
                        question = new
                        {
                            id = eq.Question.Id,
                            content = eq.Question.Content,
                            questionType = eq.Question.QuestionType,
                            imagePath = eq.Question.ImagePath,
                            level = eq.Question.Level != null ? new
                            {
                                id = eq.Question.Level.Id,
                                name = eq.Question.Level.Name,
                                value = eq.Question.Level.Value
                            } : null,
                            options = options
                        }
                    });
                }

                // Xáo trộn câu hỏi nếu cần
                if (exam.ShuffleQuestions)
                {
                    questions = questions.OrderBy(q => Guid.NewGuid()).ToList();
                }

                // Tạo exam session trong DB (nếu có sẵn bảng) hoặc sử dụng một cách khác để lưu trữ thông tin phiên làm bài
                var endTime = now.AddMinutes(exam.Duration);

                // Trả về thông tin đề thi và câu hỏi
                return Ok(new
                {
                    // Thông tin phiên làm bài
                    startTime = now,
                    endTime = endTime,
                    officialExam = new
                    {
                        id = officialExam.Id,
                        title = officialExam.Title,
                        description = officialExam.Description
                    },
                    exam = new
                    {
                        id = exam.Id,
                        title = exam.Title,
                        description = exam.Description,
                        duration = exam.Duration,
                        totalScore = exam.TotalScore,
                        passScore = exam.PassScore,
                        shuffleQuestions = exam.ShuffleQuestions,
                        shuffleOptions = exam.ShuffleOptions,
                        subject = exam.Subject != null ? new
                        {
                            id = exam.Subject.Id,
                            name = exam.Subject.Name,
                            code = exam.Subject.Code
                        } : null,
                        examType = exam.ExamType != null ? new
                        {
                            id = exam.ExamType.Id,
                            name = exam.ExamType.Name
                        } : null
                    },
                    questions = questions,
                    totalQuestions = questions.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error taking exam: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy đề thi" });
            }
        }
        /// <summary>
        /// Nộp bài thi
        /// </summary>
        [HttpPost("{officialExamId}/submit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SubmitExam(int officialExamId, [FromBody] StudentSubmitExamDTO model)
        {
            try
            {
                int studentId = GetCurrentUserId();
                _logger.LogInformation($"Học sinh {studentId} đang nộp bài thi {officialExamId}");

                // Kiểm tra xem học sinh có được phân công vào kỳ thi không
                var officialExamStudent = await _context.OfficialExamStudents
                    .Include(oes => oes.OfficialExam)
                        .ThenInclude(oe => oe.Exam)
                    .FirstOrDefaultAsync(oes =>
                        oes.OfficialExamId == officialExamId &&
                        oes.StudentId == studentId);

                if (officialExamStudent == null)
                {
                    return NotFound(new { message = "Bạn không được phân công vào kỳ thi này" });
                }

                // Kiểm tra xem học sinh đã làm bài chưa
                if (officialExamStudent.HasTaken)
                {
                    return BadRequest(new { message = "Bạn đã nộp bài thi này" });
                }

                // Kiểm tra thời gian làm bài
                var now = DateTimeHelper.GetVietnamNow();
                var officialExam = officialExamStudent.OfficialExam;
                var exam = officialExam.Exam;

                if (!officialExam.IsActive)
                {
                    return BadRequest(new { message = "Kỳ thi này hiện không hoạt động" });
                }

                if (officialExam.EndTime.HasValue && now > officialExam.EndTime.Value)
                {
                    _logger.LogWarning($"Học sinh {studentId} nộp bài thi {officialExamId} quá thời gian");
                    // Vẫn cho phép nộp bài nhưng ghi log
                }

                // Bắt đầu transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Lấy danh sách câu hỏi và đáp án
                    var examQuestions = await _context.ExamQuestions
                        .Include(eq => eq.Question)
                            .ThenInclude(q => q.Options)
                        .Where(eq => eq.ExamId == exam.Id)
                        .ToListAsync();

                    // Tính điểm bài làm
                    decimal totalScore = 0;
                    int correctAnswers = 0;
                    int totalQuestions = examQuestions.Count;
                    int answeredQuestions = 0;

                    // Tạo thống kê về loại câu hỏi
                    var questionTypeStats = new Dictionary<int, int>();

                    // Kiểm tra và ghi log tất cả các câu trả lời để gỡ lỗi
                    _logger.LogInformation($"Đang xử lý {model.Answers.Count} câu trả lời cho bài thi {officialExamId}");
                    foreach (var answer in model.Answers)
                    {
                        _logger.LogInformation($"Xử lý câu trả lời: ExamQuestionId={answer.ExamQuestionId}, SelectedOptionId={answer.SelectedOptionId}, TextAnswer={answer.TextAnswer ?? "null"}");
                    }

                    // Kiểm tra và ghi log tất cả các câu hỏi trong đề thi để gỡ lỗi
                    _logger.LogInformation($"Đề thi có {examQuestions.Count} câu hỏi");
                    foreach (var eq in examQuestions)
                    {
                        _logger.LogInformation($"Câu hỏi trong đề: Id={eq.Id}, QuestionId={eq.QuestionId}, ExamId={eq.ExamId}");

                        // Thêm thống kê về loại câu hỏi
                        if (eq.Question != null)
                        {
                            int questionType = eq.Question.QuestionType;
                            if (questionTypeStats.ContainsKey(questionType))
                            {
                                questionTypeStats[questionType]++;
                            }
                            else
                            {
                                questionTypeStats[questionType] = 1;
                            }
                        }
                    }

                    // Chuyển đổi thống kê thành JSON
                    string questionTypeStatistics = Newtonsoft.Json.JsonConvert.SerializeObject(questionTypeStats);
                    _logger.LogInformation($"Thống kê loại câu hỏi: {questionTypeStatistics}");

                    // Kiểm tra các câu trả lời để tính điểm
                    foreach (var answer in model.Answers)
                    {
                        // Tìm câu hỏi tương ứng
                        var examQuestion = examQuestions.FirstOrDefault(eq => eq.Id == answer.ExamQuestionId);
                        if (examQuestion == null)
                        {
                            _logger.LogWarning($"Không tìm thấy câu hỏi với Id={answer.ExamQuestionId} trong đề thi");
                            continue;
                        }

                        if (examQuestion.Question == null)
                        {
                            _logger.LogWarning($"Câu hỏi Id={answer.ExamQuestionId} không có dữ liệu Question");
                            continue;
                        }

                        // Đánh dấu đã trả lời câu hỏi
                        answeredQuestions++;

                        // Xác định câu trả lời đúng hay sai và tính điểm
                        bool isCorrect = false;
                        decimal score = 0;

                        switch (examQuestion.Question.QuestionType)
                        {
                            case 1: // Multiple choice
                                    // Kiểm tra đáp án đúng
                                var correctOption = examQuestion.Question.Options?.FirstOrDefault(o => o.IsCorrect);
                                if (correctOption != null && answer.SelectedOptionId == correctOption.Id)
                                {
                                    isCorrect = true;
                                    score = examQuestion.Score;
                                    correctAnswers++;
                                }
                                break;

                            case 3: // Short answer
                                    // Đối với câu trả lời ngắn, cần chấm bằng tay hoặc dùng auto-grade nếu có
                                    // Tạm thời không tính điểm
                                break;

                            case 5: // True/False
                                    // Kiểm tra đáp án đúng (tương tự multiple choice)
                                var correctTFOption = examQuestion.Question.Options?.FirstOrDefault(o => o.IsCorrect);
                                if (correctTFOption != null && answer.SelectedOptionId == correctTFOption.Id)
                                {
                                    isCorrect = true;
                                    score = examQuestion.Score;
                                    correctAnswers++;
                                }
                                break;
                        }

                        // Ghi log kết quả kiểm tra câu trả lời
                        _logger.LogInformation($"Kết quả câu {answer.ExamQuestionId}: isCorrect={isCorrect}, score={score}");

                        // Cộng điểm
                        totalScore += score;
                    }

                    // Tính toán kết quả
                    decimal percentageScore = exam.TotalScore > 0
                        ? (totalScore / exam.TotalScore) * 100
                        : 0;
                    bool isPassed = exam.PassScore.HasValue && totalScore >= exam.PassScore.Value;

                    // Tính thời gian làm bài (giả sử bắt đầu làm bài từ exam.Duration phút trước)
                    var startedAt = now.AddMinutes(-exam.Duration);
                    int duration = (int)Math.Round((now - startedAt).TotalMinutes);

                    // Ghi log thông tin kết quả
                    _logger.LogInformation($"Thông tin kết quả: Score={totalScore}, PercentageScore={percentageScore}, IsPassed={isPassed}, AnsweredQuestions={answeredQuestions}, CorrectAnswers={correctAnswers}");

                    // Tạo kết quả bài thi mới
                    var examResult = new ExamResult
                    {
                        StudentId = studentId,
                        ExamId = exam.Id,
                        Score = totalScore,
                        PercentageScore = percentageScore,
                        IsPassed = isPassed,
                        CompletedAt = now,
                        // Thêm các thuộc tính bắt buộc theo mô hình dữ liệu hiện tại
                        AnsweredQuestions = answeredQuestions,
                        AttemptNumber = 1, // Lần thi đầu tiên
                        GradingStatus = 1, // Giả sử 1 là "AutoGraded" - cần điều chỉnh theo enum thực tế của bạn
                        IsSubmittedManually = true,
                        IsCompleted = true,
                        StartedAt = startedAt,
                        CorrectAnswers = correctAnswers,
                        Duration = duration,
                        TotalQuestions = totalQuestions,
                        QuestionTypeStatistics = questionTypeStatistics // Thêm trường này để tránh lỗi NULL
                    };

                    // Ghi log trước khi lưu đối tượng
                    _logger.LogInformation($"Chuẩn bị lưu kết quả bài thi cho học sinh {studentId}, kỳ thi {officialExamId}");

                    // Lưu kết quả bài thi
                    _context.ExamResults.Add(examResult);
                    await _context.SaveChangesAsync();

                    // Ghi log sau khi lưu đối tượng
                    _logger.LogInformation($"Đã lưu kết quả bài thi với Id={examResult.Id}");

                    // Cập nhật thông tin học sinh đã làm bài
                    officialExamStudent.HasTaken = true;
                    officialExamStudent.ExamResultId = examResult.Id;
                    _context.OfficialExamStudents.Update(officialExamStudent);
                    await _context.SaveChangesAsync();

                    // Commit transaction
                    await transaction.CommitAsync();
                    _logger.LogInformation($"Transaction đã được commit thành công");

                    // Trả về kết quả
                    return Ok(new
                    {
                        message = "Nộp bài thi thành công",
                        result = new
                        {
                            id = examResult.Id,
                            score = examResult.Score,
                            totalScore = exam.TotalScore,
                            percentageScore = examResult.PercentageScore,
                            correctAnswers = examResult.CorrectAnswers,
                            totalQuestions = examResult.TotalQuestions,
                            answeredQuestions = examResult.AnsweredQuestions,
                            isPassed = examResult.IsPassed,
                            completedAt = examResult.CompletedAt,

                            // Chỉ hiển thị chi tiết đáp án nếu đề thi cho phép
                            showResult = officialExam.ResultsReleased || exam.ShowResult,
                            showAnswers = exam.ShowAnswers && (officialExam.ResultsReleased || exam.ShowResult)
                        }
                    });
                }
                catch (Exception ex)
                {
                    // Rollback transaction nếu có lỗi
                    await transaction.RollbackAsync();
                    _logger.LogError($"Error processing exam submission: {ex.Message}");
                    _logger.LogError($"Stack trace: {ex.StackTrace}");

                    // Ghi log inner exception nếu có
                    if (ex.InnerException != null)
                    {
                        _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                        _logger.LogError($"Inner exception stack trace: {ex.InnerException.StackTrace}");
                    }

                    // Ở môi trường development, trả về thông tin chi tiết về lỗi
#if DEBUG
                    return StatusCode(500, new
                    {
                        message = "Đã xảy ra lỗi khi xử lý bài thi",
                        error = ex.Message,
                        innerError = ex.InnerException?.Message,
                        stackTrace = ex.StackTrace
                    });
#else
            throw;
#endif
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error submitting exam: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");

                // Ghi log inner exception nếu có
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                    _logger.LogError($"Inner exception stack trace: {ex.InnerException.StackTrace}");
                }

                // Ở môi trường development, trả về thông tin chi tiết về lỗi
#if DEBUG
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi nộp bài thi",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
#else
        return StatusCode(500, new { message = "Đã xảy ra lỗi khi nộp bài thi" });
#endif
            }
        }

        /// <summary>
        /// Lấy kết quả bài thi
        /// </summary>
        /// <param name="officialExamId">ID của kỳ thi chính thức</param>
        /// <returns>Kết quả bài thi</returns>
        [HttpGet("{officialExamId}/result")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetExamResult(int officialExamId)
        {
            try
            {
                int studentId = GetCurrentUserId();
                _logger.LogInformation($"Học sinh {studentId} đang xem kết quả kỳ thi {officialExamId}");

                // Kiểm tra xem học sinh có được phân công vào kỳ thi không và đã làm bài chưa
                var examStudent = await _context.OfficialExamStudents
                    .Include(oes => oes.OfficialExam)
                        .ThenInclude(oe => oe.Exam)
                    .Include(oes => oes.ExamResult)
                    .FirstOrDefaultAsync(oes =>
                        oes.OfficialExamId == officialExamId &&
                        oes.StudentId == studentId &&
                        oes.HasTaken);

                if (examStudent == null)
                {
                    return NotFound(new { message = "Không tìm thấy kết quả bài thi hoặc bạn chưa làm bài này" });
                }

                // Kiểm tra quyền xem kết quả
                var officialExam = examStudent.OfficialExam;
                var exam = officialExam.Exam;

                bool canViewResult = officialExam.ResultsReleased || exam.ShowResult;
                if (!canViewResult)
                {
                    return BadRequest(new { message = "Kết quả bài thi chưa được công bố" });
                }

                // Lấy kết quả bài thi
                var examResult = examStudent.ExamResult;
                if (examResult == null)
                {
                    return NotFound(new { message = "Không tìm thấy kết quả bài thi" });
                }

                // Tạo response kết quả cơ bản
                var result = new
                {
                    id = examResult.Id,
                    score = examResult.Score,
                    totalScore = exam.TotalScore,
                    percentageScore = examResult.PercentageScore,
                    answeredQuestions = examResult.AnsweredQuestions,
                    correctAnswers = examResult.CorrectAnswers,
                    totalQuestions = examResult.TotalQuestions,
                    isPassed = examResult.IsPassed,
                    duration = examResult.Duration,
                    completedAt = examResult.CompletedAt,
                    startedAt = examResult.StartedAt,
                    showAnswers = exam.ShowAnswers && canViewResult
                };

                return Ok(new { result });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting exam result: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy kết quả bài thi" });
            }
        }

        /// <summary>
        /// Lấy danh sách kết quả thi của học sinh
        /// </summary>
        /// <param name="page">Số trang</param>
        /// <param name="pageSize">Số bản ghi mỗi trang</param>
        /// <returns>Danh sách kết quả thi</returns>
        [HttpGet("results")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetExamResults(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                int studentId = GetCurrentUserId();
                _logger.LogInformation($"Lấy danh sách kết quả thi của học sinh {studentId}");

                // Lấy danh sách kết quả thi
                var query = _context.OfficialExamStudents
                    .Include(oes => oes.OfficialExam)
                        .ThenInclude(oe => oe.Exam)
                            .ThenInclude(e => e.Subject)
                    .Include(oes => oes.ExamResult)
                    .Where(oes =>
                        oes.StudentId == studentId &&
                        oes.HasTaken &&
                        oes.ExamResult != null &&
                        (oes.OfficialExam.ResultsReleased || oes.OfficialExam.Exam.ShowResult))
                    .AsQueryable();

                // Đếm tổng số bản ghi
                int totalCount = await query.CountAsync();

                // Phân trang
                var examResults = await query
                    .OrderByDescending(oes => oes.ExamResult.CompletedAt ?? DateTime.MinValue)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Chuyển đổi dữ liệu
                var result = examResults.Select(oes => new
                {
                    OfficialExam = new
                    {
                        Id = oes.OfficialExam.Id,
                        Title = oes.OfficialExam.Title,
                        ClassroomName = oes.OfficialExam.ClassroomName
                    },
                    Exam = new
                    {
                        Id = oes.OfficialExam.Exam.Id,
                        Title = oes.OfficialExam.Exam.Title,
                        TotalScore = oes.OfficialExam.Exam.TotalScore,
                        PassScore = oes.OfficialExam.Exam.PassScore,
                        Subject = oes.OfficialExam.Exam.Subject != null ? new
                        {
                            Id = oes.OfficialExam.Exam.Subject.Id,
                            Name = oes.OfficialExam.Exam.Subject.Name,
                            Code = oes.OfficialExam.Exam.Subject.Code
                        } : null
                    },
                    Result = oes.ExamResult != null ? new
                    {
                        Id = oes.ExamResult.Id,
                        Score = oes.ExamResult.Score,
                        PercentageScore = oes.ExamResult.PercentageScore,
                        CorrectAnswers = oes.ExamResult.CorrectAnswers,
                        TotalQuestions = oes.ExamResult.TotalQuestions,
                        IsPassed = oes.ExamResult.IsPassed,
                        CompletedAt = oes.ExamResult.CompletedAt,
                        Duration = oes.ExamResult.Duration
                    } : null,
                    ShowAnswers = oes.OfficialExam.Exam.ShowAnswers &&
                        (oes.OfficialExam.ResultsReleased || oes.OfficialExam.Exam.ShowResult)
                }).ToList();

                return Ok(new
                {
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting exam results: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách kết quả thi" });
            }
        }

        // Helper methods
        private string GetExamStatus(OfficialExam officialExam, bool hasTaken)
        {
            if (hasTaken)
                return "Đã làm";

            if (!officialExam.IsActive)
                return "Không hoạt động";

            var now = DateTimeHelper.GetVietnamNow();
            var startTimeVN = officialExam.StartTime.HasValue ?
               DateTime.SpecifyKind(officialExam.StartTime.Value, DateTimeKind.Utc).ToVietnamTime() :
               DateTime.MinValue;

            var endTimeVN = officialExam.EndTime.HasValue ?
                DateTime.SpecifyKind(officialExam.EndTime.Value, DateTimeKind.Utc).ToVietnamTime() :
                DateTime.MaxValue;
            if (now < startTimeVN)
                return "Chưa mở";

            if (now > endTimeVN)
                return "Đã đóng";

            return "Đang mở";
        }

        private bool CanStudentTakeExam(OfficialExam officialExam, bool hasTaken)
        {
            if (hasTaken || !officialExam.IsActive)
                return false;

            var now = DateTimeHelper.GetVietnamNow();
    
            var startTimeVN = officialExam.StartTime.HasValue ?
                DateTime.SpecifyKind(officialExam.StartTime.Value, DateTimeKind.Utc).ToVietnamTime() :
                DateTime.MinValue;

            var endTimeVN = officialExam.EndTime.HasValue ?
                DateTime.SpecifyKind(officialExam.EndTime.Value, DateTimeKind.Utc).ToVietnamTime() :
                DateTime.MaxValue;

            if (now < startTimeVN)
                return false;

            if (now > endTimeVN)
                return false;

            return true;
        }

        private int GetCurrentUserId()
        {
            int currentUserId = 0;
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst("UserId");

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                currentUserId = userId;
            }

            return currentUserId;
        }
    }

    // DTO classes for student exams
    public class StudentSubmitExamDTO
    {
        public List<StudentSubmitAnswerDTO> Answers { get; set; } = new List<StudentSubmitAnswerDTO>();
    }

    public class StudentSubmitAnswerDTO
    {
        public int ExamQuestionId { get; set; }
        public int? SelectedOptionId { get; set; }
        public string TextAnswer { get; set; }
    }
}