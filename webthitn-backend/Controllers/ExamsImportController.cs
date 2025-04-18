using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    // Mở rộng ExamController để thêm chức năng import từ CSV
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Teacher")]
    public class ExamsImportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExamsImportController> _logger;

        /// <summary>
        /// Khởi tạo controller với các dependency
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="logger">Logger service</param>
        public ExamsImportController(ApplicationDbContext context, ILogger<ExamsImportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Import đề thi từ file CSV
        /// </summary>
        /// <remarks>
        /// API này cho phép import đề thi từ file CSV với định dạng sau:
        /// 
        /// - Dòng đầu tiên là tiêu đề cột: Title,Description,SubjectId,ExamTypeId,Duration,TotalScore,PassScore,MaxAttempts,StartTime,EndTime,...
        /// - Các dòng tiếp theo là thông tin của đề thi
        /// 
        /// Yêu cầu tối thiểu: Title (tiêu đề), SubjectId (ID môn học), ExamTypeId (ID loại đề thi), Duration (thời gian làm bài)
        /// 
        /// Định dạng thời gian: yyyy-MM-dd HH:mm:ss
        /// 
        /// Sample request:
        /// 
        ///     POST /api/exams/import
        ///     Form-Data:
        ///         csvFile: [file CSV]
        ///         skipHeader: true
        ///
        /// </remarks>
        /// <param name="csvFile">File CSV chứa thông tin đề thi</param>
        /// <param name="skipHeader">Bỏ qua dòng tiêu đề (mặc định: true)</param>
        /// <param name="delimiter">Ký tự phân cách (mặc định: dấu phẩy)</param>
        /// <returns>Thông tin về các đề thi đã import thành công</returns>
        /// <response code="200">Import thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="401">Không có quyền truy cập</response>
        /// <response code="500">Lỗi máy chủ</response>
        [HttpPost("import")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ImportExams(
            [FromForm] IFormFile csvFile,
            [FromForm] bool skipHeader = true,
            [FromForm] string delimiter = ",")
        {
            try
            {
                _logger.LogInformation("Bắt đầu import đề thi từ file CSV");

                if (csvFile == null || csvFile.Length == 0)
                {
                    return BadRequest(new { message = "Vui lòng chọn file CSV" });
                }

                if (Path.GetExtension(csvFile.FileName).ToLower() != ".csv")
                {
                    return BadRequest(new { message = "Chỉ hỗ trợ file CSV" });
                }

                // Lấy ID của người dùng hiện tại (từ token JWT)
                int currentUserId;
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("UserId") ?? User.FindFirst("userid");
                }

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out currentUserId) || currentUserId <= 0)
                {
                    _logger.LogWarning("Không xác định được người dùng hiện tại từ token");
                    return Unauthorized(new { message = "Không xác định được người dùng hiện tại" });
                }

                var importResults = new List<object>();
                var errors = new List<string>();
                int successCount = 0;
                int failedCount = 0;

                // Đọc file CSV
                using (var streamReader = new StreamReader(csvFile.OpenReadStream()))
                {
                    using (var csv = new CsvReader(streamReader, new CsvConfiguration(CultureInfo.InvariantCulture)
                    {
                        Delimiter = delimiter,
                        HasHeaderRecord = skipHeader
                    }))
                    {
                        // Đọc tất cả các bản ghi
                        var records = csv.GetRecords<dynamic>().ToList();
                        _logger.LogInformation($"Đọc được {records.Count} bản ghi từ file CSV");

                        if (!records.Any())
                        {
                            return BadRequest(new { message = "File CSV không chứa dữ liệu" });
                        }

                        // Bắt đầu transaction
                        using var transaction = await _context.Database.BeginTransactionAsync();

                        try
                        {
                            foreach (var record in records)
                            {
                                try
                                {
                                    var examDto = new CreateExamDTO();
                                    var validationErrors = new List<string>();
                                    bool isValid = true;

                                    // Đọc các trường bắt buộc
                                    string title = null;
                                    if (TryGetValue(record, "Title", out title) && !string.IsNullOrEmpty(title))
                                    {
                                        examDto.Title = title;
                                    }
                                    else
                                    {
                                        validationErrors.Add("Tiêu đề (Title) không được để trống");
                                        isValid = false;
                                    }

                                    string description = null;
                                    if (TryGetValue(record, "Description", out description))
                                    {
                                        examDto.Description = description;
                                    }
                                    else
                                    {
                                        examDto.Description = string.Empty;
                                    }

                                    int subjectId = 0;
                                    string subjectIdStr = null;
                                    if (TryGetValue(record, "SubjectId", out subjectIdStr) &&
                                        int.TryParse(subjectIdStr, out subjectId) && subjectId > 0)
                                    {
                                        examDto.SubjectId = subjectId;
                                    }
                                    else
                                    {
                                        validationErrors.Add("ID môn học (SubjectId) không hợp lệ");
                                        isValid = false;
                                    }

                                    int examTypeId = 0;
                                    string examTypeIdStr = null;
                                    if (TryGetValue(record, "ExamTypeId", out examTypeIdStr) &&
                                        int.TryParse(examTypeIdStr, out examTypeId) && examTypeId > 0)
                                    {
                                        examDto.ExamTypeId = examTypeId;
                                    }
                                    else
                                    {
                                        validationErrors.Add("ID loại đề thi (ExamTypeId) không hợp lệ");
                                        isValid = false;
                                    }

                                    int duration = 0;
                                    string durationStr = null;
                                    if (TryGetValue(record, "Duration", out durationStr) &&
                                        int.TryParse(durationStr, out duration) && duration > 0)
                                    {
                                        examDto.Duration = duration;
                                    }
                                    else
                                    {
                                        validationErrors.Add("Thời gian làm bài (Duration) phải lớn hơn 0");
                                        isValid = false;
                                    }

                                    // Đọc các trường không bắt buộc
                                    decimal totalScore = 10;
                                    string totalScoreStr = null;
                                    if (TryGetValue(record, "TotalScore", out totalScoreStr) &&
                                        decimal.TryParse(totalScoreStr, out totalScore) && totalScore > 0)
                                    {
                                        examDto.TotalScore = totalScore;
                                    }
                                    else
                                    {
                                        examDto.TotalScore = 10; // Giá trị mặc định
                                    }

                                    decimal passScore = totalScore * 0.5m;
                                    string passScoreStr = null;
                                    if (TryGetValue(record, "PassScore", out passScoreStr) &&
                                        decimal.TryParse(passScoreStr, out passScore))
                                    {
                                        examDto.PassScore = passScore;
                                    }
                                    else
                                    {
                                        examDto.PassScore = totalScore * 0.5m; // Mặc định là 50% điểm tối đa
                                    }

                                    int maxAttempts = 1;
                                    string maxAttemptsStr = null;
                                    if (TryGetValue(record, "MaxAttempts", out maxAttemptsStr) &&
                                        int.TryParse(maxAttemptsStr, out maxAttempts) && maxAttempts > 0)
                                    {
                                        examDto.MaxAttempts = maxAttempts;
                                    }
                                    else
                                    {
                                        examDto.MaxAttempts = 1; // Mặc định 1 lần thi
                                    }

                                    string startTimeStr = null;
                                    if (TryGetValue(record, "StartTime", out startTimeStr))
                                    {
                                        DateTime startTime;
                                        if (DateTime.TryParse(startTimeStr, out startTime))
                                        {
                                            examDto.StartTime = startTime;
                                        }
                                    }

                                    string endTimeStr = null;
                                    if (TryGetValue(record, "EndTime", out endTimeStr))
                                    {
                                        DateTime endTime;
                                        if (DateTime.TryParse(endTimeStr, out endTime))
                                        {
                                            examDto.EndTime = endTime;
                                        }
                                    }

                                    bool isActive = true;
                                    string isActiveStr = null;
                                    if (TryGetValue(record, "IsActive", out isActiveStr) &&
                                        bool.TryParse(isActiveStr, out isActive))
                                    {
                                        examDto.IsActive = isActive;
                                    }
                                    else
                                    {
                                        examDto.IsActive = true; // Mặc định kích hoạt
                                    }

                                    bool showResult = true;
                                    string showResultStr = null;
                                    if (TryGetValue(record, "ShowResult", out showResultStr) &&
                                        bool.TryParse(showResultStr, out showResult))
                                    {
                                        examDto.ShowResult = showResult;
                                    }
                                    else
                                    {
                                        examDto.ShowResult = true; // Mặc định hiển thị kết quả
                                    }

                                    bool showAnswers = false;
                                    string showAnswersStr = null;
                                    if (TryGetValue(record, "ShowAnswers", out showAnswersStr) &&
                                        bool.TryParse(showAnswersStr, out showAnswers))
                                    {
                                        examDto.ShowAnswers = showAnswers;
                                    }
                                    else
                                    {
                                        examDto.ShowAnswers = false; // Mặc định không hiển thị đáp án
                                    }

                                    bool shuffleQuestions = true;
                                    string shuffleQuestionsStr = null;
                                    if (TryGetValue(record, "ShuffleQuestions", out shuffleQuestionsStr) &&
                                        bool.TryParse(shuffleQuestionsStr, out shuffleQuestions))
                                    {
                                        examDto.ShuffleQuestions = shuffleQuestions;
                                    }
                                    else
                                    {
                                        examDto.ShuffleQuestions = true; // Mặc định trộn câu hỏi
                                    }

                                    bool shuffleOptions = true;
                                    string shuffleOptionsStr = null;
                                    if (TryGetValue(record, "ShuffleOptions", out shuffleOptionsStr) &&
                                        bool.TryParse(shuffleOptionsStr, out shuffleOptions))
                                    {
                                        examDto.ShuffleOptions = shuffleOptions;
                                    }
                                    else
                                    {
                                        examDto.ShuffleOptions = true; // Mặc định trộn đáp án
                                    }

                                    bool autoGradeShortAnswer = true;
                                    string autoGradeShortAnswerStr = null;
                                    if (TryGetValue(record, "AutoGradeShortAnswer", out autoGradeShortAnswerStr) &&
                                        bool.TryParse(autoGradeShortAnswerStr, out autoGradeShortAnswer))
                                    {
                                        examDto.AutoGradeShortAnswer = autoGradeShortAnswer;
                                    }
                                    else
                                    {
                                        examDto.AutoGradeShortAnswer = true; // Mặc định chấm tự động
                                    }

                                    bool allowPartialGrading = true;
                                    string allowPartialGradingStr = null;
                                    if (TryGetValue(record, "AllowPartialGrading", out allowPartialGradingStr) &&
                                        bool.TryParse(allowPartialGradingStr, out allowPartialGrading))
                                    {
                                        examDto.AllowPartialGrading = allowPartialGrading;
                                    }
                                    else
                                    {
                                        examDto.AllowPartialGrading = true; // Mặc định cho phép chấm một phần
                                    }

                                    string accessCode = null;
                                    if (TryGetValue(record, "AccessCode", out accessCode))
                                    {
                                        examDto.AccessCode = accessCode;
                                    }

                                    string scoringConfig = null;
                                    if (TryGetValue(record, "ScoringConfig", out scoringConfig) && !string.IsNullOrEmpty(scoringConfig))
                                    {
                                        examDto.ScoringConfig = scoringConfig;
                                    }
                                    else
                                    {
                                        examDto.ScoringConfig = "{\"gradingMethod\":\"sum\",\"partialCreditMethod\":\"proportional\",\"penaltyForWrongAnswer\":0}";
                                    }

                                    // Đọc danh sách câu hỏi (nếu có)
                                    List<ExamQuestionCreateDTO> questions = new List<ExamQuestionCreateDTO>();
                                    string questionIdsStr = null;
                                    if (TryGetValue(record, "QuestionIds", out questionIdsStr) && !string.IsNullOrEmpty(questionIdsStr))
                                    {
                                        List<int> questionIds = new List<int>();
                                        try
                                        {
                                            questionIds = questionIdsStr.Split(';')
                                                .Where(id => !string.IsNullOrWhiteSpace(id))
                                                .Select(id => int.Parse(id))
                                                .ToList();
                                        }
                                        catch (Exception ex)
                                        {
                                            validationErrors.Add($"QuestionIds không đúng định dạng: {ex.Message}");
                                            isValid = false;
                                        }

                                        if (isValid && questionIds.Any())
                                        {
                                            // Kiểm tra xem các câu hỏi có tồn tại không
                                            var existingQuestionIds = await _context.Questions
                                                .Where(q => questionIds.Contains(q.Id))
                                                .Select(q => q.Id)
                                                .ToListAsync();

                                            var missingQuestionIds = questionIds
                                                .Except(existingQuestionIds)
                                                .ToList();

                                            if (missingQuestionIds.Any())
                                            {
                                                validationErrors.Add($"Không tìm thấy câu hỏi với ID: {string.Join(", ", missingQuestionIds)}");
                                                isValid = false;
                                            }

                                            // Đọc điểm số cho từng câu hỏi (nếu có)
                                            decimal defaultScore = examDto.TotalScore / Math.Max(1, questionIds.Count);
                                            List<decimal> questionScores = new List<decimal>();

                                            string questionScoresStr = null;
                                            if (TryGetValue(record, "QuestionScores", out questionScoresStr) && !string.IsNullOrEmpty(questionScoresStr))
                                            {
                                                try
                                                {
                                                    questionScores = questionScoresStr.Split(';')
                                                        .Where(s => !string.IsNullOrWhiteSpace(s))
                                                        .Select(s => decimal.TryParse(s, out decimal score) ? score : defaultScore)
                                                        .ToList();
                                                }
                                                catch
                                                {
                                                    // Nếu có lỗi khi đọc điểm số, sử dụng điểm mặc định
                                                    questionScores = new List<decimal>();
                                                }
                                            }

                                            // Nếu số lượng điểm không khớp với số lượng câu hỏi, sử dụng điểm mặc định
                                            while (questionScores.Count < questionIds.Count)
                                            {
                                                questionScores.Add(defaultScore);
                                            }

                                            // Tạo danh sách câu hỏi cho đề thi
                                            for (int i = 0; i < questionIds.Count; i++)
                                            {
                                                if (existingQuestionIds.Contains(questionIds[i]))
                                                {
                                                    questions.Add(new ExamQuestionCreateDTO
                                                    {
                                                        QuestionId = questionIds[i],
                                                        Order = i + 1,
                                                        Score = i < questionScores.Count ? questionScores[i] : defaultScore
                                                    });
                                                }
                                            }
                                        }
                                    }

                                    // Kiểm tra lỗi trước khi tạo đề thi
                                    if (!isValid || validationErrors.Any())
                                    {
                                        failedCount++;
                                        errors.Add($"Đề thi '{title ?? "Không có tiêu đề"}': {string.Join(", ", validationErrors)}");
                                        continue;
                                    }

                                    // Kiểm tra môn học tồn tại
                                    var subject = await _context.Subjects.FindAsync(examDto.SubjectId);
                                    if (subject == null)
                                    {
                                        failedCount++;
                                        errors.Add($"Đề thi '{examDto.Title}': Không tìm thấy môn học với ID {examDto.SubjectId}");
                                        continue;
                                    }

                                    // Kiểm tra loại đề thi tồn tại
                                    var examType = await _context.ExamTypes.FindAsync(examDto.ExamTypeId);
                                    if (examType == null)
                                    {
                                        failedCount++;
                                        errors.Add($"Đề thi '{examDto.Title}': Không tìm thấy loại đề thi với ID {examDto.ExamTypeId}");
                                        continue;
                                    }

                                    // Tạo đối tượng Exam mới
                                    var exam = new Exam
                                    {
                                        Title = examDto.Title.Trim(),
                                        Description = examDto.Description?.Trim() ?? "",
                                        SubjectId = examDto.SubjectId,
                                        ExamTypeId = examDto.ExamTypeId,
                                        Duration = examDto.Duration,
                                        TotalScore = examDto.TotalScore,
                                        PassScore = examDto.PassScore,
                                        MaxAttempts = examDto.MaxAttempts,
                                        StartTime = examDto.StartTime,
                                        EndTime = examDto.EndTime,
                                        IsActive = examDto.IsActive,
                                        ShowResult = examDto.ShowResult,
                                        ShowAnswers = examDto.ShowAnswers,
                                        ShuffleQuestions = examDto.ShuffleQuestions,
                                        ShuffleOptions = examDto.ShuffleOptions,
                                        AutoGradeShortAnswer = examDto.AutoGradeShortAnswer,
                                        AllowPartialGrading = examDto.AllowPartialGrading,
                                        AccessCode = examDto.AccessCode?.Trim(),
                                        CreatorId = currentUserId,
                                        CreatedAt = DateTime.UtcNow,
                                        ScoringConfig = examDto.ScoringConfig
                                    };

                                    // Lưu bài thi
                                    _context.Exams.Add(exam);
                                    await _context.SaveChangesAsync();
                                    _logger.LogInformation($"Đã lưu bài thi, ID: {exam.Id}");

                                    // Nếu có danh sách câu hỏi, lưu câu hỏi vào đề thi
                                    if (questions.Any())
                                    {
                                        foreach (var questionDTO in questions)
                                        {
                                            var examQuestion = new ExamQuestion
                                            {
                                                ExamId = exam.Id,
                                                QuestionId = questionDTO.QuestionId,
                                                OrderIndex = questionDTO.Order,
                                                Score = questionDTO.Score
                                            };

                                            _context.ExamQuestions.Add(examQuestion);
                                        }

                                        await _context.SaveChangesAsync();
                                        _logger.LogInformation($"Đã lưu {questions.Count} câu hỏi trong bài thi ID: {exam.Id}");
                                    }

                                    // Thêm kết quả thành công
                                    successCount++;
                                    importResults.Add(new
                                    {
                                        id = exam.Id,
                                        title = exam.Title,
                                        questionCount = questions.Count
                                    });
                                }
                                catch (Exception ex)
                                {
                                    failedCount++;
                                    errors.Add($"Lỗi xử lý bản ghi: {ex.Message}");
                                }
                            }

                            await transaction.CommitAsync();
                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync();
                            _logger.LogError($"Lỗi khi import đề thi: {ex.Message}, Stack trace: {ex.StackTrace}");
                            return StatusCode(500, new { message = "Đã xảy ra lỗi khi import đề thi", error = ex.Message });
                        }
                    }
                }

                return Ok(new
                {
                    message = "Import đề thi hoàn tất",
                    totalRecords = successCount + failedCount,
                    successCount,
                    failedCount,
                    importedExams = importResults,
                    errors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi import đề thi: {ex.Message}, Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi import đề thi", error = ex.Message });
            }
        }

        /// <summary>
        /// Phương thức hỗ trợ để lấy giá trị từ dynamic object
        /// </summary>
        private bool TryGetValue(dynamic record, string propertyName, out string value)
        {
            value = null;
            try
            {
                // Xử lý CsvHelper dynamic object
                var dictionary = record as IDictionary<string, object>;
                if (dictionary != null)
                {
                    if (dictionary.TryGetValue(propertyName, out object objVal) && objVal != null)
                    {
                        value = objVal.ToString();
                        return !string.IsNullOrEmpty(value);
                    }
                }

                // Xử lý trực tiếp từ dynamic object
                value = record[propertyName]?.ToString();
                return !string.IsNullOrEmpty(value);
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Tải mẫu file CSV để import đề thi
        /// </summary>
        /// <returns>File CSV mẫu</returns>
        [HttpGet("import/template")]
        public IActionResult GetImportTemplate()
        {
            _logger.LogInformation("Tải mẫu file CSV để import đề thi");

            var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "exam_import_template.csv");

            // Nếu file mẫu không tồn tại, tạo file mẫu mới
            if (!System.IO.File.Exists(templatePath))
            {
                // Tạo thư mục Templates nếu chưa tồn tại
                var templateDir = Path.Combine(Directory.GetCurrentDirectory(), "Templates");
                if (!Directory.Exists(templateDir))
                {
                    Directory.CreateDirectory(templateDir);
                }

                // Tạo nội dung mẫu
                var templateContent =
                    "Title,Description,SubjectId,ExamTypeId,Duration,TotalScore,PassScore,MaxAttempts,StartTime,EndTime,IsActive,ShowResult,ShowAnswers,ShuffleQuestions,ShuffleOptions,AutoGradeShortAnswer,AllowPartialGrading,AccessCode,QuestionIds,QuestionScores\n" +
                    "\"Kiểm tra giữa kỳ Toán\",\"Bài kiểm tra kiến thức cơ bản về đạo hàm và tích phân\",1,2,45,10,5,2,2025-04-20 08:00:00,2025-04-30 23:59:59,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,\"math123\",\"1;2;3;4;5\",\"2;1;2;2;3\"\n" +
                    "\"Kiểm tra cuối kỳ Vật lý\",\"Bài kiểm tra kiến thức nâng cao về cơ học và điện từ học\",2,3,90,20,10,1,2025-05-01 08:00:00,2025-05-10 23:59:59,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,\"physics123\",\"6;7;8;9;10\",\"4;4;4;4;4\"";

                System.IO.File.WriteAllText(templatePath, templateContent);
            }

            var bytes = System.IO.File.ReadAllBytes(templatePath);
            return File(bytes, "text/csv", "exam_import_template.csv");
        }
    }
}