using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Services
{
    public class ExamGradingService : IExamGradingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExamGradingService> _logger;

        public ExamGradingService(ApplicationDbContext context, ILogger<ExamGradingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Chấm điểm và lưu kết quả bài thi
        /// </summary>
        public async Task<ExamResult> GradeAndSaveExamResult(SubmitExamDTO submitDto, int userId)
        {
            try
            {
                // Lấy thông tin bài thi
                var exam = await _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.ExamType)
                    .Include(e => e.ExamQuestions)
                        .ThenInclude(eq => eq.Question)
                            .ThenInclude(q => q.Options)
                    .FirstOrDefaultAsync(e => e.Id == submitDto.ExamId);

                if (exam == null)
                {
                    _logger.LogWarning($"Không tìm thấy bài thi ID: {submitDto.ExamId}");
                    return null;
                }

                // Xác định số lần làm bài
                int attemptNumber = await _context.ExamResults
                    .CountAsync(er => er.ExamId == submitDto.ExamId && er.StudentId == userId) + 1;

                // Tính thời gian làm bài (giây)
                int durationInSeconds = (int)(submitDto.EndTime - submitDto.StartTime).TotalSeconds;

                // Bắt đầu transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Tạo kết quả thi mới
                    var examResult = new ExamResult
                    {
                        ExamId = submitDto.ExamId,
                        StudentId = userId,
                        StartedAt = submitDto.StartTime,
                        CompletedAt = submitDto.EndTime,
                        Score = 0, // Sẽ cập nhật sau khi tính điểm
                        Duration = durationInSeconds,
                        GradingStatus = 0, // 0: Pending, 1: Completed, 2: In Review
                        IsCompleted = true,
                        IsPassed = false, // Sẽ cập nhật sau khi tính điểm
                        AttemptNumber = attemptNumber,
                        IsSubmittedManually = submitDto.IsSubmittedManually,
                        TeacherComment = null,
                        CorrectAnswers = 0, // Sẽ cập nhật sau khi tính điểm
                        AnsweredQuestions = 0, // Sẽ cập nhật sau khi tính điểm
                        TotalQuestions = exam.ExamQuestions.Count,
                        PendingManualGradeCount = 0, // Sẽ cập nhật sau khi tính điểm
                        PercentageScore = 0 // Sẽ cập nhật sau khi tính điểm
                    };

                    _context.ExamResults.Add(examResult);
                    await _context.SaveChangesAsync();

                    // Biến lưu thống kê
                    decimal totalScore = 0;
                    int correctAnswers = 0;
                    int partiallyCorrectAnswers = 0;
                    int pendingManualGrades = 0;
                    int answeredQuestions = 0;

                    // Dictionary để ánh xạ QuestionId với ExamQuestionId và Score
                    var questionScoreMap = exam.ExamQuestions.ToDictionary(
                        eq => eq.QuestionId,
                        eq => new { ExamQuestionId = eq.Id, Score = eq.Score, OrderIndex = eq.OrderIndex }
                    );

                    // Danh sách các đối tượng StudentAnswer để lưu
                    var studentAnswers = new List<StudentAnswer>();

                    // Duyệt qua từng câu trả lời để chấm điểm
                    foreach (var answer in submitDto.Answers)
                    {
                        answeredQuestions++;

                        if (!questionScoreMap.TryGetValue(answer.QuestionId, out var questionInfo))
                        {
                            continue; // Bỏ qua câu hỏi không thuộc bài thi
                        }

                        // Lấy thông tin câu hỏi và đáp án
                        var examQuestion = exam.ExamQuestions.FirstOrDefault(eq => eq.QuestionId == answer.QuestionId);
                        if (examQuestion == null || examQuestion.Question == null)
                        {
                            continue;
                        }

                        var question = examQuestion.Question;

                        // Tạo đối tượng StudentAnswer
                        var studentAnswer = new StudentAnswer
                        {
                            ExamResultId = examResult.Id,
                            QuestionId = answer.QuestionId,
                            ExamQuestionId = questionInfo.ExamQuestionId,
                            QuestionOrder = questionInfo.OrderIndex,
                            AnswerTime = (int)(answer.EndTime - answer.StartTime).TotalSeconds,
                            Score = 0, // Khởi tạo điểm ban đầu là 0
                            MaxScore = questionInfo.Score,
                            IsCorrect = false,
                            IsPartiallyCorrect = false,
                            RequiresManualReview = false,
                            Status = 0, // 0: Chưa chấm, 1: Đúng, 2: Đúng một phần, 3: Sai
                            // Lưu trực tiếp giá trị câu trả lời
                            SelectedOptionId = answer.SelectedOptionId,
                            TextAnswer = answer.TextAnswer,
                            TrueFalseAnswers = answer.TrueFalseAnswers
                        };

                        // Xử lý điểm số dựa trên loại câu hỏi
                        var needsReview = false;
                        switch (question.QuestionType)
                        {
                            case 1: // Một đáp án
                                GradeSingleChoiceAnswer(question, answer, studentAnswer);
                                break;
                            case 2: // Đúng-sai nhiều ý
                                GradeTrueFalseAnswer(question, answer, studentAnswer);
                                break;
                            case 3: // Trả lời ngắn
                                needsReview = GradeShortAnswer(question, answer, studentAnswer, exam.AutoGradeShortAnswer);
                                break;
                        }

                        if (needsReview)
                        {
                            pendingManualGrades++;
                        }

                        // Cập nhật trạng thái
                        if (studentAnswer.IsCorrect)
                        {
                            correctAnswers++;
                            studentAnswer.Status = 1; // Đúng
                        }
                        else if (studentAnswer.IsPartiallyCorrect)
                        {
                            partiallyCorrectAnswers++;
                            studentAnswer.Status = 2; // Đúng một phần
                        }
                        else
                        {
                            studentAnswer.Status = 3; // Sai
                        }

                        // Cộng điểm vào tổng điểm
                        totalScore += studentAnswer.Score;

                        // Lưu câu trả lời
                        studentAnswers.Add(studentAnswer);
                    }

                    // Lưu tất cả câu trả lời
                    _context.StudentAnswers.AddRange(studentAnswers);
                    await _context.SaveChangesAsync();

                    // Cập nhật điểm tổng và trạng thái cho kết quả thi
                    examResult.Score = totalScore;
                    examResult.CorrectAnswers = correctAnswers;
                    examResult.PartiallyCorrectAnswers = partiallyCorrectAnswers;
                    examResult.AnsweredQuestions = answeredQuestions;
                    examResult.PendingManualGradeCount = pendingManualGrades;

                    // Tính điểm phần trăm
                    if (exam.TotalScore > 0)
                    {
                        examResult.PercentageScore = Math.Round(totalScore * 100 / exam.TotalScore, 2);
                    }

                    // Xác định trạng thái đạt/không đạt
                    if (pendingManualGrades > 0)
                    {
                        examResult.GradingStatus = 2; // In Review
                    }
                    else
                    {
                        examResult.GradingStatus = 1; // Completed
                    }

                    if (exam.PassScore.HasValue)
                    {
                        examResult.IsPassed = totalScore >= exam.PassScore.Value;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return examResult;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi trong transaction chấm điểm: {ex.Message}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi chấm điểm bài thi: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Lấy chi tiết kết quả bài thi
        /// </summary>
        public async Task<ExamResultDetailDTO> GetExamResultDetail(ExamResult examResult, bool showAllDetails)
        {
            try
            {
                // Lấy danh sách câu trả lời
                var studentAnswers = await _context.StudentAnswers
                    .Include(sa => sa.Question)
                    .Include(sa => sa.Question.Options)
                    .Where(sa => sa.ExamResultId == examResult.Id)
                    .OrderBy(sa => sa.QuestionOrder)
                    .ToListAsync();

                // Tính thời gian làm bài định dạng
                var durationFormatted = FormatDuration(examResult.Duration);

                // Kiểm tra xem có thể hiển thị đáp án không
                bool canShowAnswers = examResult.Exam.ShowResult;
                bool canShowCorrectAnswers = examResult.Exam.ShowAnswers;

                // Nếu có quyền admin/teacher, luôn hiển thị đáp án
                if (showAllDetails)
                {
                    canShowAnswers = true;
                    canShowCorrectAnswers = true;
                }

                // Tạo DTO chi tiết kết quả
                var resultDetail = new ExamResultDetailDTO
                {
                    Id = examResult.Id,
                    Exam = new ExamBasicDTO
                    {
                        Id = examResult.ExamId,
                        Title = examResult.Exam.Title,
                        Type = examResult.Exam.ExamType?.Name ?? "Bài thi",
                        Subject = new SubjectBasicDTO
                        {
                            Id = examResult.Exam.Subject.Id,
                            Name = examResult.Exam.Subject.Name,
                            Code = examResult.Exam.Subject.Code
                        }
                    },
                    Student = new UserBasicDTO
                    {
                        Id = examResult.Student.Id,
                        Username = examResult.Student.Username,
                        FullName = examResult.Student.FullName
                    },
                    Score = examResult.Score,
                    TotalScore = examResult.Exam.TotalScore,
                    PercentageScore = examResult.PercentageScore,
                    IsPassed = examResult.IsPassed,
                    PassScore = examResult.Exam.PassScore,
                    Duration = examResult.Duration,
                    DurationFormatted = durationFormatted,
                    CorrectAnswers = examResult.CorrectAnswers,
                    PartiallyCorrectAnswers = examResult.PartiallyCorrectAnswers,
                    TotalQuestions = examResult.TotalQuestions,
                    AnsweredQuestions = examResult.AnsweredQuestions,
                    PendingManualGradeCount = examResult.PendingManualGradeCount,
                    AttemptNumber = examResult.AttemptNumber,
                    IsCompleted = examResult.IsCompleted,
                    StartedAt = examResult.StartedAt,
                    CompletedAt = examResult.CompletedAt,
                    TeacherComment = examResult.TeacherComment,
                    IsSubmittedManually = examResult.IsSubmittedManually,
                    StudentAnswers = GetStudentAnswerDTOs(studentAnswers, canShowCorrectAnswers),
                    LevelStats = GetQuestionLevelStats(studentAnswers)
                };

                // Thêm thống kê nếu được phép xem kết quả
                if (canShowAnswers)
                {
                    resultDetail.QuestionTypeStats = GetQuestionTypeStats(studentAnswers);
                }

                return resultDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy chi tiết kết quả bài thi: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Xóa kết quả bài thi
        /// </summary>
        public async Task<bool> DeleteExamResult(ExamResult examResult)
        {
            try
            {
                // Bắt đầu transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Xóa các câu trả lời
                    _context.StudentAnswers.RemoveRange(examResult.StudentAnswers);
                    await _context.SaveChangesAsync();

                    // Xóa kết quả bài thi
                    _context.ExamResults.Remove(examResult);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Lỗi khi xóa kết quả bài thi trong transaction: {ex.Message}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa kết quả bài thi: {ex.Message}");
                return false;
            }
        }

        #region Helper Methods

        /// <summary>
        /// Chấm điểm cho câu trả lời trắc nghiệm một đáp án
        /// </summary>
        private void GradeSingleChoiceAnswer(Question question, AnswerSubmissionDTO answer, StudentAnswer studentAnswer)
        {
            // Kiểm tra xem câu trả lời có đáp án được chọn không
            if (!answer.SelectedOptionId.HasValue)
            {
                studentAnswer.IsCorrect = false;
                studentAnswer.Score = 0;
                return;
            }

            // Tìm đáp án đã chọn
            var selectedOption = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId.Value);
            if (selectedOption == null)
            {
                studentAnswer.IsCorrect = false;
                studentAnswer.Score = 0;
                return;
            }

            // Chấm điểm
            bool isCorrect = selectedOption.IsCorrect;
            studentAnswer.IsCorrect = isCorrect;
            studentAnswer.Score = isCorrect ? studentAnswer.MaxScore : 0;
        }

        /// <summary>
        /// Chấm điểm cho câu trả lời đúng-sai nhiều ý
        /// </summary>
        private void GradeTrueFalseAnswer(Question question, AnswerSubmissionDTO answer, StudentAnswer studentAnswer)
        {
            if (string.IsNullOrEmpty(answer.TrueFalseAnswers))
            {
                studentAnswer.IsCorrect = false;
                studentAnswer.Score = 0;
                return;
            }

            try
            {
                // Parse JSON câu trả lời
                var studentTrueFalseAnswers = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, bool>>(answer.TrueFalseAnswers);

                // Đếm số câu trả lời đúng
                int correctAnswersCount = 0;
                int totalQuestions = question.Options.Count(o => o.IsPartOfTrueFalseGroup);

                // Kiểm tra từng câu trả lời
                foreach (var tfOption in question.Options.Where(o => o.IsPartOfTrueFalseGroup))
                {
                    string groupIdString = tfOption.GroupId.ToString();
                    if (studentTrueFalseAnswers.ContainsKey(groupIdString))
                    {
                        bool studentAnswerVal = studentTrueFalseAnswers[groupIdString];
                        if (studentAnswerVal == tfOption.IsCorrect)
                        {
                            correctAnswersCount++;
                        }
                    }
                }

                // Tính điểm dựa trên số câu trả lời đúng
                decimal score = 0;
                if (totalQuestions > 0)
                {
                    score = (decimal)correctAnswersCount / totalQuestions;
                    decimal scaledScore = score * studentAnswer.MaxScore;

                    studentAnswer.IsCorrect = correctAnswersCount == totalQuestions;
                    studentAnswer.IsPartiallyCorrect = correctAnswersCount > 0 && correctAnswersCount < totalQuestions;
                    studentAnswer.Score = scaledScore;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xử lý câu trả lời đúng-sai nhiều ý: {ex.Message}");
                studentAnswer.IsCorrect = false;
                studentAnswer.Score = 0;
            }
        }

        /// <summary>
        /// Chấm điểm cho câu trả lời ngắn
        /// </summary>
        /// <returns>True nếu cần review thủ công</returns>
        private bool GradeShortAnswer(Question question, AnswerSubmissionDTO answer, StudentAnswer studentAnswer, bool autoGrade)
        {
            if (string.IsNullOrEmpty(answer.TextAnswer))
            {
                studentAnswer.IsCorrect = false;
                studentAnswer.Score = 0;
                studentAnswer.RequiresManualReview = false;
                return false;
            }

            // Nếu không cho phép chấm tự động, đánh dấu cần review thủ công
            if (!autoGrade)
            {
                studentAnswer.IsCorrect = false;
                studentAnswer.Score = 0;
                studentAnswer.RequiresManualReview = true;
                return true;
            }

            try
            {
                // Lấy danh sách đáp án đúng
                var correctAnswers = question.Options.Where(o => o.IsCorrect).ToList();
                if (!correctAnswers.Any())
                {
                    studentAnswer.RequiresManualReview = true;
                    return true;
                }

                // Tìm đáp án khớp nhất
                bool isExactMatch = false;
                bool isPartialMatch = false;
                decimal matchScore = 0;

                string studentAnswerText = answer.TextAnswer.Trim().ToLower();

                // So sánh với từng đáp án đúng
                foreach (var option in correctAnswers)
                {
                    string correctAnswer = option.Content.Trim().ToLower();

                    // Kiểm tra khớp chính xác
                    if (studentAnswerText == correctAnswer)
                    {
                        isExactMatch = true;
                        matchScore = option.ScorePercentage / 100m;
                        break;
                    }

                    // Kiểm tra khớp một phần
                    else if (studentAnswerText.Contains(correctAnswer) || correctAnswer.Contains(studentAnswerText))
                    {
                        isPartialMatch = true;
                        matchScore = option.ScorePercentage / 100m * 0.8m; // 80% điểm cho câu gần đúng
                    }
                }

                // Tính toán điểm
                decimal scaledScore = matchScore * studentAnswer.MaxScore;

                studentAnswer.IsCorrect = isExactMatch;
                studentAnswer.IsPartiallyCorrect = !isExactMatch && isPartialMatch;
                studentAnswer.Score = scaledScore;

                // Kiểm tra nếu không có kết quả khớp, đánh dấu cần review thủ công
                studentAnswer.RequiresManualReview = !isExactMatch && !isPartialMatch;
                return studentAnswer.RequiresManualReview;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xử lý câu trả lời ngắn: {ex.Message}");
                studentAnswer.IsCorrect = false;
                studentAnswer.Score = 0;
                studentAnswer.RequiresManualReview = true;
                return true;
            }
        }

        /// <summary>
        /// Tạo danh sách DTO cho câu trả lời của học sinh
        /// </summary>
        private List<StudentAnswerDTO> GetStudentAnswerDTOs(List<StudentAnswer> answers, bool showExplanation)
        {
            var result = new List<StudentAnswerDTO>();

            foreach (var answer in answers)
            {
                var answerDto = new StudentAnswerDTO
                {
                    Id = answer.Id,
                    QuestionId = answer.QuestionId,
                    QuestionContent = answer.Question?.Content ?? "Không tìm thấy câu hỏi",
                    QuestionType = GetQuestionTypeName(answer.Question?.QuestionType ?? 0),
                    QuestionTypeValue = answer.Question?.QuestionType ?? 0,
                    QuestionOrder = answer.QuestionOrder,
                    IsCorrect = answer.IsCorrect,
                    IsPartiallyCorrect = answer.IsPartiallyCorrect,
                    Score = answer.Score,
                    MaxScore = answer.MaxScore,
                    AnswerTime = answer.AnswerTime,
                    Status = answer.Status,
                    RequiresManualReview = answer.RequiresManualReview,
                    Explanation = showExplanation ? answer.Question?.Explanation : null,
                    TextAnswer = answer.TextAnswer,
                    SelectedOptionId = answer.SelectedOptionId,
                    SelectedOptions = new List<SelectedOptionDTO>(),
                    TrueFalseAnswers = new Dictionary<string, bool>()
                };

                // Xử lý chi tiết câu trả lời dựa trên loại câu hỏi
                if (answer.Question != null)
                {
                    ProcessAnswerDetails(answer, answerDto);
                }

                result.Add(answerDto);
            }

            return result;
        }

        /// <summary>
        /// Xử lý chi tiết câu trả lời dựa trên loại câu hỏi
        /// </summary>
        private void ProcessAnswerDetails(StudentAnswer answer, StudentAnswerDTO answerDto)
        {
            var question = answer.Question;

            switch (question.QuestionType)
            {
                case 1: // Một đáp án
                    if (answer.SelectedOptionId.HasValue)
                    {
                        var option = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId.Value);
                        if (option != null)
                        {
                            answerDto.SelectedOptions.Add(new SelectedOptionDTO
                            {
                                OptionId = option.Id,
                                Content = option.Content,
                                Label = option.Label,
                                IsCorrect = option.IsCorrect
                            });
                        }
                    }
                    break;

                case 2: // Đúng-sai nhiều ý
                    if (!string.IsNullOrEmpty(answer.TrueFalseAnswers))
                    {
                        try
                        {
                            answerDto.TrueFalseAnswers = System.Text.Json.JsonSerializer
                                .Deserialize<Dictionary<string, bool>>(answer.TrueFalseAnswers);

                            // Đếm số lượng đúng
                            if (question.Options.Any())
                            {
                                int correctCount = 0;
                                foreach (var opt in question.Options.Where(o => o.IsPartOfTrueFalseGroup))
                                {
                                    string groupId = opt.GroupId.ToString();
                                    if (answerDto.TrueFalseAnswers.ContainsKey(groupId) &&
                                        answerDto.TrueFalseAnswers[groupId] == opt.IsCorrect)
                                    {
                                        correctCount++;
                                    }
                                }
                                answerDto.TrueFalseCorrectCount = correctCount;
                            }
                        }
                        catch
                        {
                            answerDto.TrueFalseAnswers = new Dictionary<string, bool>();
                        }
                    }
                    break;

                case 3: // Trả lời ngắn
                    // Tạo đánh giá trả lời ngắn tự động dựa trên thông tin có sẵn
                    if (!string.IsNullOrEmpty(answer.TextAnswer))
                    {
                        var bestMatch = "";
                        // Tìm đáp án đúng để hiển thị cho người dùng
                        var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                        if (correctOption != null)
                        {
                            bestMatch = correctOption.Content;
                        }

                        answerDto.ShortAnswerEvaluation = new ShortAnswerEvaluationDTO
                        {
                            OriginalAnswer = answer.TextAnswer,
                            MatchedAnswer = bestMatch,
                            IsExactMatch = answer.IsCorrect,
                            IsPartialMatch = answer.IsPartiallyCorrect,
                            SimilarityScore = answer.IsCorrect ? 100 : (answer.IsPartiallyCorrect ? 80 : 0)
                        };
                    }
                    break;
            }
        }

        /// <summary>
        /// Tạo thống kê kết quả theo mức độ câu hỏi
        /// </summary>
        private List<QuestionLevelStatDTO> GetQuestionLevelStats(List<StudentAnswer> answers)
        {
            var result = new List<QuestionLevelStatDTO>();

            // Nhóm câu hỏi theo mức độ
            var levelGroups = answers
                .Where(a => a.Question?.Level != null)
                .GroupBy(a => new { LevelId = a.Question.Level.Id, LevelName = a.Question.Level.Name });

            foreach (var group in levelGroups)
            {
                var levelStat = new QuestionLevelStatDTO
                {
                    LevelId = group.Key.LevelId,
                    LevelName = group.Key.LevelName,
                    TotalQuestions = group.Count(),
                    CorrectAnswers = group.Count(a => a.IsCorrect),
                    PartiallyCorrectAnswers = group.Count(a => a.IsPartiallyCorrect)
                };

                // Tính tỷ lệ phần trăm
                if (levelStat.TotalQuestions > 0)
                {
                    decimal correctPoints = levelStat.CorrectAnswers + (levelStat.PartiallyCorrectAnswers * 0.5m);
                    levelStat.CorrectPercentage = Math.Round(100 * correctPoints / levelStat.TotalQuestions, 2);
                }

                result.Add(levelStat);
            }

            return result;
        }

        /// <summary>
        /// Tạo thống kê kết quả theo loại câu hỏi
        /// </summary>
        private QuestionTypeStatisticsDTO GetQuestionTypeStats(List<StudentAnswer> answers)
        {
            return new QuestionTypeStatisticsDTO
            {
                SingleChoice = GetQuestionTypeDetailStats(answers.Where(a => a.Question?.QuestionType == 1).ToList()),
                TrueFalse = GetQuestionTypeDetailStats(answers.Where(a => a.Question?.QuestionType == 2).ToList()),
                ShortAnswer = GetQuestionTypeDetailStats(answers.Where(a => a.Question?.QuestionType == 3).ToList())
            };
        }

        /// <summary>
        /// Tính toán chi tiết thống kê cho một loại câu hỏi cụ thể
        /// </summary>
        private QuestionTypeDetailDTO GetQuestionTypeDetailStats(List<StudentAnswer> answers)
        {
            if (answers == null || !answers.Any())
            {
                return new QuestionTypeDetailDTO
                {
                    Total = 0,
                    Correct = 0,
                    Partial = 0,
                    TotalScore = 0,
                    MaxScore = 0,
                    CorrectPercentage = 0
                };
            }

            decimal totalScore = answers.Sum(a => a.Score);
            decimal maxScore = answers.Sum(a => a.MaxScore);

            return new QuestionTypeDetailDTO
            {
                Total = answers.Count,
                Correct = answers.Count(a => a.IsCorrect),
                Partial = answers.Count(a => a.IsPartiallyCorrect),
                TotalScore = totalScore,
                MaxScore = maxScore,
                CorrectPercentage = maxScore > 0 ? Math.Round(100 * totalScore / maxScore, 2) : 0
            };
        }

        /// <summary>
        /// Định dạng thời gian từ giây sang định dạng phút:giây
        /// </summary>
        private string FormatDuration(int seconds)
        {
            var timeSpan = TimeSpan.FromSeconds(seconds);
            return timeSpan.Hours > 0
                ? $"{timeSpan.Hours}:{timeSpan.Minutes:D2}:{timeSpan.Seconds:D2}"
                : $"{timeSpan.Minutes:D2}:{timeSpan.Seconds:D2}";
        }

        /// <summary>
        /// Lấy tên loại câu hỏi từ giá trị số
        /// </summary>
        private string GetQuestionTypeName(int questionType)
        {
            return questionType switch
            {
                1 => "Một đáp án",
                2 => "Đúng-sai nhiều ý",
                3 => "Trả lời ngắn",
                4 => "Ghép đôi",
                _ => "Không xác định",
            };
        }

        public Task<bool> UpdateExamResult(int resultId, UpdateResultDTO updateDto, int reviewerId)
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}