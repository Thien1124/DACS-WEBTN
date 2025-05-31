using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

namespace webthitn_backend.Controllers
{
    [Route("api/tests")]
    [ApiController]
    [Authorize]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TestController> _logger;

        public TestController(ApplicationDbContext context, ILogger<TestController> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Phương thức helper để lấy userId từ claims 
        /// </summary>
        /// <returns>User ID hoặc giá trị mặc định nếu không tìm thấy</returns>
        private int GetUserIdFromClaims()
        {
            try
            {
                // In ra tất cả claims để debug
                _logger.LogInformation($"Token chứa {User.Claims.Count()} claims");
                foreach (var claim in User.Claims)
                {
                    _logger.LogInformation($"Claim: {claim.Type} = {claim.Value}");
                }
                // Cách 1: Tìm claim cụ thể "userId" (trường hợp này trong token của bạn)
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId");
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int parsedId))
                {
                    _logger.LogInformation($"✅ Tìm thấy userId từ claim 'userId': {parsedId}");
                    return parsedId;
                }

                // Cách 2: Đọc trực tiếp từ token trong header
                Request.Headers.TryGetValue("Authorization", out var authHeader);
                string token = authHeader.ToString();

                if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    token = token.Substring("Bearer ".Length);
                    var handler = new JwtSecurityTokenHandler();
                    if (handler.CanReadToken(token))
                    {
                        var jwtToken = handler.ReadJwtToken(token);
                        var directClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "userId");
                        if (directClaim != null && int.TryParse(directClaim.Value, out int directId))
                        {
                            _logger.LogInformation($"✅ Tìm thấy userId trực tiếp từ token: {directId}");
                            return directId;
                        }
                    }
                }

                // Từ ví dụ token của bạn, tôi thấy userId nằm trong loại "simple userID"
                var simpleUserIdClaim = User.FindFirst("userId");
                if (simpleUserIdClaim != null && int.TryParse(simpleUserIdClaim.Value, out int simpleId))
                {
                    _logger.LogInformation($"✅ Tìm thấy userId từ claim đơn giản: {simpleId}");
                    return simpleId;
                }

                _logger.LogWarning("⚠️ Không tìm thấy userId trong token, thử phương án cuối cùng");

                // Phát hiện userId từ bất kỳ claim nào có dạng số nguyên
                foreach (var claim in User.Claims)
                {
                    if (int.TryParse(claim.Value, out int potentialId) && potentialId > 0)
                    {
                        _logger.LogInformation($"✅ Phát hiện userId từ claim {claim.Type}: {potentialId}");
                        return potentialId;
                    }
                }

                _logger.LogWarning("⚠️ Không thể xác định userId, sử dụng giá trị mặc định 15");
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi trích xuất userId từ token");
                return 0;
            }
        }
        /// <summary>
        /// Phương thức cải tiến để trích xuất userId từ JWT token
        /// </summary>
        private int ImprovedUserIdExtraction()
        {
            try
            {
                // In ra thông tin xác thực
                _logger.LogInformation($"User.Identity.IsAuthenticated: {User.Identity.IsAuthenticated}");

                // Cách 1: Từ claims
                var userClaims = User.Claims.ToList();
                _logger.LogInformation($"Tổng số claims: {userClaims.Count}");

                foreach (var claim in userClaims)
                {
                    _logger.LogInformation($"Claim: '{claim.Type}' = '{claim.Value}'");

                    // Tìm claim có chứa "user" và "id" trong tên claim (không phân biệt hoa thường)
                    if ((claim.Type.ToLower().Contains("user") && claim.Type.ToLower().Contains("id")) ||
                        claim.Type.ToLower() == "userid" ||
                        claim.Type.ToLower() == "sub")
                    {
                        if (int.TryParse(claim.Value, out int parsedId))
                        {
                            _logger.LogInformation($"✅ Tìm thấy userId từ claim '{claim.Type}': {parsedId}");
                            return parsedId;
                        }
                    }
                }

                // Cách 2: Trích xuất trực tiếp từ token
                Request.Headers.TryGetValue("Authorization", out var authHeader);
                string token = authHeader.ToString();

                if (!string.IsNullOrEmpty(token) && token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    token = token.Substring("Bearer ".Length);
                    var handler = new JwtSecurityTokenHandler();

                    if (handler.CanReadToken(token))
                    {
                        var jwtToken = handler.ReadJwtToken(token);
                        _logger.LogInformation($"JWT Token có tổng số {jwtToken.Claims.Count()} claims");

                        foreach (var claim in jwtToken.Claims)
                        {
                            _logger.LogInformation($"JWT Claim: '{claim.Type}' = '{claim.Value}'");

                            // Cố gắng tìm userId trong nhiều định dạng khác nhau
                            if (claim.Type.Equals("userId", StringComparison.OrdinalIgnoreCase) ||
                                claim.Type.Equals("user_id", StringComparison.OrdinalIgnoreCase) ||
                                claim.Type.Equals("sub", StringComparison.OrdinalIgnoreCase) ||
                                claim.Type.Equals("nameidentifier", StringComparison.OrdinalIgnoreCase))
                            {
                                if (int.TryParse(claim.Value, out int parsedId))
                                {
                                    _logger.LogInformation($"✅ Trích xuất thành công userId={parsedId} từ JWT token");
                                    return parsedId;
                                }
                            }
                        }
                    }
                }

                // Nếu không tìm thấy, trả về giá trị mặc định
                _logger.LogWarning("⚠️ Không thể xác định userId, sử dụng giá trị mặc định");
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi trích xuất userId");
                return 0;
            }
        }
        /// <summary>
        /// API để kiểm tra thông tin token hiện tại
        /// </summary>
        [HttpGet("token-info")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetTokenInfo()
        {
            var claims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList();
            var roles = User.Claims.Where(c => c.Type == ClaimTypes.Role || c.Type == "role").Select(c => c.Value).ToList();
            var userId = GetUserIdFromClaims();

            // Lấy thông tin từ header Authorization
            Request.Headers.TryGetValue("Authorization", out var authHeaderValue);
            string token = null;
            if (!string.IsNullOrEmpty(authHeaderValue) && authHeaderValue.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = authHeaderValue.ToString().Substring("Bearer ".Length).Trim();
            }

            return Ok(new
            {
                UserId = userId,
                IsAuthenticated = User.Identity.IsAuthenticated,
                AuthenticationType = User.Identity.AuthenticationType,
                Claims = claims,
                Roles = roles,
                AuthHeader = authHeaderValue.ToString(),
                TokenFirstChars = !string.IsNullOrEmpty(token) ? token.Substring(0, Math.Min(token.Length, 20)) + "..." : null
            });
        }
        /// <summary>
        /// Phương thức trích xuất trực tiếp không phụ thuộc ASP.NET Core Identity
        /// </summary>
        private int DirectTokenParsing()
        {
            try
            {
                // Lấy token từ header
                if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
                {
                    _logger.LogWarning("Không tìm thấy Authorization header");
                    return 0;
                }

                string token = authHeader.ToString();
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("Authorization header rỗng");
                    return 0;
                }

                // Loại bỏ tiền tố "Bearer"
                if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    token = token.Substring("Bearer ".Length);
                }

                // Kiểm tra token có định dạng đúng không
                var tokenParts = token.Split('.');
                if (tokenParts.Length != 3)
                {
                    _logger.LogWarning("Token không đúng định dạng JWT (cần 3 phần)");
                    return 0;
                }

                // Giải mã phần payload (phần thứ hai) của token
                string payloadBase64 = tokenParts[1];

                // Đảm bảo độ dài chuỗi base64 là bội số của 4
                int padding = payloadBase64.Length % 4;
                if (padding > 0)
                {
                    payloadBase64 += new string('=', 4 - padding);
                }

                // Chuyển Base64Url thành Base64 tiêu chuẩn
                payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');

                // Giải mã payload
                var payloadBytes = Convert.FromBase64String(payloadBase64);
                var payloadJson = System.Text.Encoding.UTF8.GetString(payloadBytes);

                // Parse JSON
                var payloadData = System.Text.Json.JsonDocument.Parse(payloadJson);

                // Tìm claim userId
                if (payloadData.RootElement.TryGetProperty("userId", out var userIdElement))
                {
                    if (int.TryParse(userIdElement.GetString(), out int userId))
                    {
                        _logger.LogInformation($"Giải mã token thành công, userId = {userId}");
                        return userId;
                    }
                }

                // Tìm claim sub (subject) nếu không có userId
                if (payloadData.RootElement.TryGetProperty("sub", out var subElement))
                {
                    if (int.TryParse(subElement.GetString(), out int userId))
                    {
                        _logger.LogInformation($"Lấy userId từ claim sub, userId = {userId}");
                        return userId;
                    }
                }

                _logger.LogWarning("Không tìm thấy userId trong payload của token");
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi giải mã trực tiếp token");
                return 0;
            }
        }

        /// <summary>
        /// Kiểm tra và xử lý token thủ công
        /// </summary>
        [HttpGet("debug-token")]
        [AllowAnonymous]
        public IActionResult DebugToken()
        {
            try
            {
                Request.Headers.TryGetValue("Authorization", out var authHeader);
                string tokenStr = authHeader.ToString();

                if (string.IsNullOrEmpty(tokenStr))
                {
                    return BadRequest(new { Success = false, Message = "Không có token trong header" });
                }

                if (tokenStr.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    tokenStr = tokenStr.Substring("Bearer ".Length);
                }

                var handler = new JwtSecurityTokenHandler();
                if (!handler.CanReadToken(tokenStr))
                {
                    return BadRequest(new { Success = false, Message = "Token không hợp lệ" });
                }

                var token = handler.ReadJwtToken(tokenStr);
                var claims = token.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList();

                var userId = ImprovedUserIdExtraction();

                return Ok(new
                {
                    Success = true,
                    Claims = claims,
                    ClaimCount = claims.Count,
                    ExtractedUserId = userId,
                    ExpiresAt = token.ValidTo,
                    IsExpired = token.ValidTo < DateTime.UtcNow,
                    OriginalToken = tokenStr.Substring(0, 20) + "..." // Just show beginning for security
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "Lỗi xử lý token", Error = ex.Message });
            }
        }

        /// <summary>
        /// Tạo đề thi theo cấu trúc độ khó
        /// </summary>
        /// <remarks>
        /// API này cho phép tạo đề thi dựa trên cấu trúc độ khó, phân bổ câu hỏi theo tỷ lệ người dùng cung cấp
        /// </remarks>
        [HttpPost("structured")]
        [Authorize(Roles = "Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateStructuredTest([FromBody] CreateStructuredTestDTO model)
        {
            try
            {
                _logger.LogInformation("Bắt đầu tạo đề thi theo cấu trúc");

                if (model == null)
                {
                    return BadRequest(new { Success = false, Message = "Dữ liệu không hợp lệ" });
                }

                // Validate dữ liệu đầu vào
                var validationErrors = new Dictionary<string, string>();

                if (string.IsNullOrWhiteSpace(model.Title))
                {
                    validationErrors.Add("title", "Tiêu đề đề thi không được để trống");
                }

                if (model.SubjectId <= 0)
                {
                    validationErrors.Add("subjectId", "ID môn học không hợp lệ");
                }

                if (model.ExamTypeId <= 0)
                {
                    validationErrors.Add("examTypeId", "ID loại đề thi không hợp lệ");
                }

                if (model.Duration <= 0)
                {
                    validationErrors.Add("duration", "Thời gian làm bài phải lớn hơn 0");
                }

                if (model.TotalScore <= 0)
                {
                    validationErrors.Add("totalScore", "Tổng điểm phải lớn hơn 0");
                }

                if (model.Criteria == null || model.Criteria.Count == 0)
                {
                    validationErrors.Add("criteria", "Cần ít nhất một tiêu chí phân bổ câu hỏi");
                }

                // Validate từng tiêu chí
                if (model.Criteria != null)
                {
                    for (int i = 0; i < model.Criteria.Count; i++)
                    {
                        var criterion = model.Criteria[i];
                        if (criterion.Count <= 0)
                        {
                            validationErrors.Add($"criteria[{i}].count", "Số lượng câu hỏi phải lớn hơn 0");
                        }
                        if (criterion.Score <= 0)
                        {
                            validationErrors.Add($"criteria[{i}].score", "Điểm số phải lớn hơn 0");
                        }
                    }
                }

                if (validationErrors.Count > 0)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Đề thi không hợp lệ: {validationErrors.Count} lỗi được tìm thấy",
                        ValidationErrors = validationErrors
                    });
                }

                // Xác định userId từ token
                int userId = 0;
                userId = GetUserIdFromClaims();
                
                if (userId == 0)
                {
                    userId = ImprovedUserIdExtraction();
                }

                if (userId == 0)
                {
                    userId = DirectTokenParsing();
                }

                if (userId <= 0)
                {
                    _logger.LogError("❌ Không thể xác định userId từ token");
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không thể xác định người dùng từ token. Vui lòng đăng nhập lại."
                    });
                }

                _logger.LogInformation($"✅ Sử dụng userId: {userId}");

                // Kiểm tra user có tồn tại trong database không
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"⚠️ User ID {userId} không tồn tại trong database, nhưng vẫn tiếp tục");
                }
                else
                {
                    _logger.LogInformation($"✅ Tìm thấy user: {userId} ({user.Username})");
                }

                // Kiểm tra tổng điểm từ các tiêu chí
                var totalCount = model.Criteria.Sum(c => c.Count);
                var totalDifficulty = model.Criteria.Sum(c => c.Count * c.Score);

                if (totalDifficulty != model.TotalScore)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Tổng điểm từ các tiêu chí ({totalDifficulty}) không bằng tổng điểm đề thi ({model.TotalScore})"
                    });
                }

                // Kiểm tra môn học tồn tại không
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy môn học với ID {model.SubjectId}" });
                }

                // Kiểm tra loại đề thi tồn tại không
                var examType = await _context.ExamTypes.FindAsync(model.ExamTypeId);
                if (examType == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy loại đề thi với ID {model.ExamTypeId}" });
                }

                // Bắt đầu transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Tạo AccessCode ngẫu nhiên
                    string accessCode = GenerateRandomAccessCode();

                    // Tạo các cấu hình mặc định
                    string scoringConfig = "{\"default_score\": 1.0, \"partial_credit\": true}";

                    // Tạo đề thi
                    var exam = new Exam
                    {
                        Title = model.Title,
                        Description = model.Description ?? "",
                        SubjectId = model.SubjectId,
                        ExamTypeId = model.ExamTypeId,
                        CreatorId = userId,
                        Duration = model.Duration,
                        TotalScore = model.TotalScore,
                        PassScore = model.PassScore,
                        ShuffleQuestions = model.ShuffleQuestions,
                        ShowResult = model.ShowResult ?? true,
                        ShowAnswers = model.ShowAnswers ?? false,
                        AutoGradeShortAnswer = model.AutoGradeShortAnswer ?? true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        AccessCode = accessCode,
                        ScoringConfig = scoringConfig,
                        IsActive = true,
                    };

                    _context.Exams.Add(exam);
                    await _context.SaveChangesAsync();

                    var warnings = new List<string>();
                    var selectedQuestions = new List<Question>();
                    var random = new Random();

                    // Chọn câu hỏi theo từng tiêu chí
                    foreach (var criterion in model.Criteria)
                    {
                        _logger.LogInformation($"Xử lý tiêu chí: Level={criterion.LevelId}, Type={criterion.QuestionType}, " +
                                              $"Chapter={criterion.ChapterId}, Topic={criterion.Topic ?? "(không có)"}, Count={criterion.Count}");

                        // Tìm các câu hỏi thỏa mãn tiêu chí
                        var query = _context.Questions
                            .Where(q => q.SubjectId == model.SubjectId && q.IsActive);

                        // Áp dụng các bộ lọc
                        if (criterion.LevelId > 0)
                        {
                            query = query.Where(q => q.QuestionLevelId == criterion.LevelId);
                            _logger.LogInformation($"Lọc theo cấp độ {criterion.LevelId}");
                        }

                        if (criterion.QuestionType > 0)
                        {
                            query = query.Where(q => q.QuestionType == criterion.QuestionType);
                            _logger.LogInformation($"Lọc theo loại câu hỏi {criterion.QuestionType}");
                        }

                        if (criterion.ChapterId > 0)
                        {
                            query = query.Where(q => q.ChapterId == criterion.ChapterId);
                            _logger.LogInformation($"Lọc theo chương {criterion.ChapterId}");
                        }

                        if (!string.IsNullOrWhiteSpace(criterion.Topic))
                        {
                            query = query.Where(q => q.Tags.Contains(criterion.Topic));
                            _logger.LogInformation($"Lọc theo chủ đề '{criterion.Topic}'");
                        }

                        // Lấy tất cả câu hỏi khả dụng cho tiêu chí này
                        var availableQuestions = await query.ToListAsync();
                        _logger.LogInformation($"Tìm thấy {availableQuestions.Count} câu hỏi khả dụng cho tiêu chí này");

                        // Kiểm tra nếu không có đủ câu hỏi
                        if (availableQuestions.Count < criterion.Count)
                        {
                            // Nếu không đủ câu hỏi theo tiêu chí nghiêm ngặt, thử nới lỏng
                            _logger.LogWarning($"Không đủ câu hỏi ({availableQuestions.Count}/{criterion.Count}), đang nới lỏng tiêu chí...");

                            // Nới lỏng tiêu chí: chỉ giữ lại môn học và trạng thái hoạt động
                            var relaxedQuery = _context.Questions
                                .Where(q => q.SubjectId == model.SubjectId && q.IsActive);

                            // Ưu tiên theo thứ tự: QuestionType > LevelId > ChapterId > Topic
                            if (criterion.QuestionType > 0)
                            {
                                var typeQuery = relaxedQuery.Where(q => q.QuestionType == criterion.QuestionType);
                                if (await typeQuery.CountAsync() >= criterion.Count)
                                {
                                    availableQuestions = await typeQuery.ToListAsync();
                                    warnings.Add($"Đã nới lỏng tiêu chí để chỉ lọc theo loại câu hỏi {criterion.QuestionType}");
                                }
                            }

                            if (availableQuestions.Count < criterion.Count && criterion.LevelId > 0)
                            {
                                var levelQuery = relaxedQuery.Where(q => q.QuestionLevelId == criterion.LevelId);
                                if (await levelQuery.CountAsync() >= criterion.Count)
                                {
                                    availableQuestions = await levelQuery.ToListAsync();
                                    warnings.Add($"Đã nới lỏng tiêu chí để chỉ lọc theo cấp độ {criterion.LevelId}");
                                }
                            }

                            // Nếu vẫn không đủ, lấy tất cả câu hỏi của môn học
                            if (availableQuestions.Count < criterion.Count)
                            {
                                availableQuestions = await relaxedQuery.ToListAsync();
                                warnings.Add($"Đã nới lỏng hoàn toàn tiêu chí, chỉ lọc theo môn học");
                            }

                            // Nếu vẫn không đủ câu hỏi
                            if (availableQuestions.Count < criterion.Count)
                            {
                                await transaction.RollbackAsync();
                                return BadRequest(new
                                {
                                    Success = false,
                                    Message = $"Không đủ câu hỏi cho tiêu chí (cần {criterion.Count}, chỉ có {availableQuestions.Count})"
                                });
                            }
                        }

                        // Loại bỏ các câu hỏi đã được chọn trước đó
                        var unusedQuestions = availableQuestions
                            .Where(q => !selectedQuestions.Any(sq => sq.Id == q.Id))
                            .ToList();

                        // Nếu không đủ câu hỏi chưa sử dụng, có thể cho phép trùng lặp
                        if (unusedQuestions.Count < criterion.Count)
                        {
                            _logger.LogWarning($"Không đủ câu hỏi chưa sử dụng ({unusedQuestions.Count}/{criterion.Count}), sử dụng lại một số câu hỏi");
                            unusedQuestions = availableQuestions; // Cho phép trùng lặp
                            warnings.Add("Một số câu hỏi có thể được sử dụng nhiều lần do không đủ câu hỏi phù hợp");
                        }

                        // THAY ĐỔI CHÍNH: Chỉ chọn đúng số lượng câu hỏi theo yêu cầu
                        var selectedForThisCriterion = unusedQuestions
                            .OrderBy(q => random.Next()) // Random sắp xếp
                            .Take(criterion.Count) // Chỉ lấy đúng số lượng cần thiết
                            .ToList();

                        _logger.LogInformation($"Đã chọn {selectedForThisCriterion.Count} câu hỏi cho tiêu chí này");

                        // Thêm vào danh sách câu hỏi đã chọn
                        selectedQuestions.AddRange(selectedForThisCriterion);
                    }

                    // Kiểm tra nếu không có câu hỏi nào được chọn
                    if (selectedQuestions.Count == 0)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new
                        {
                            Success = false,
                            Message = "Đề thi phải có ít nhất một câu hỏi"
                        });
                    }

                    _logger.LogInformation($"Tổng cộng đã chọn {selectedQuestions.Count} câu hỏi cho đề thi");

                    // Thêm các câu hỏi vào đề thi
                    int orderIndex = 1;
                    decimal actualTotalScore = 0;

                    foreach (var question in selectedQuestions)
                    {
                        // Tìm tiêu chí tương ứng với câu hỏi này
                        var criterion = model.Criteria.FirstOrDefault(c =>
                            (c.LevelId <= 0 || c.LevelId == question.QuestionLevelId) &&
                            (c.QuestionType <= 0 || c.QuestionType == question.QuestionType) &&
                            (c.ChapterId <= 0 || c.ChapterId == question.ChapterId) &&
                            (string.IsNullOrWhiteSpace(c.Topic) || question.Tags.Contains(c.Topic))
                        );

                        // Sử dụng điểm từ tiêu chí hoặc điểm mặc định
                        decimal score = criterion?.Score ?? question.DefaultScore;
                        actualTotalScore += score;

                        // Tạo ExamQuestion
                        var examQuestion = new ExamQuestion
                        {
                            ExamId = exam.Id,
                            QuestionId = question.Id,
                            Score = score,
                            OrderIndex = orderIndex++
                        };

                        _context.ExamQuestions.Add(examQuestion);
                    }

                    // Cập nhật lại tổng điểm thực tế
                    exam.TotalScore = actualTotalScore;
                    
                    // Lưu thay đổi
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Tạo kết quả trả về
                    var result = new
                    {
                        Success = true,
                        Message = "Tạo đề thi thành công",
                        Data = new
                        {
                            ExamId = exam.Id,
                            Title = exam.Title,
                            QuestionCount = selectedQuestions.Count,
                            RequestedQuestionCount = totalCount,
                            TotalScore = exam.TotalScore,
                            RequestedTotalScore = model.TotalScore,
                            AccessCode = exam.AccessCode,
                            SelectedQuestions = selectedQuestions.Select(q => new
                            {
                                Id = q.Id,
                                Content = q.Content.Length > 100 ? q.Content.Substring(0, 100) + "..." : q.Content,
                                QuestionType = q.QuestionType,
                                QuestionTypeName = GetQuestionTypeName(q.QuestionType),
                                Level = q.Level?.Name,
                                Chapter = q.Chapter?.Name,
                                Tags = q.Tags,
                                Score = model.Criteria.FirstOrDefault(c =>
                                    (c.LevelId <= 0 || c.LevelId == q.QuestionLevelId) &&
                                    (c.QuestionType <= 0 || c.QuestionType == q.QuestionType) &&
                                    (c.ChapterId <= 0 || c.ChapterId == q.ChapterId) &&
                                    (string.IsNullOrWhiteSpace(c.Topic) || q.Tags.Contains(c.Topic))
                                )?.Score ?? q.DefaultScore
                            }).ToList(),
                            CriteriaBreakdown = model.Criteria.Select(c => new
                            {
                                Criterion = new
                                {
                                    LevelId = c.LevelId,
                                    QuestionType = c.QuestionType,
                                    QuestionTypeName = c.QuestionType > 0 ? GetQuestionTypeName(c.QuestionType) : "Tất cả",
                                    ChapterId = c.ChapterId,
                                    Topic = c.Topic,
                                    RequestedCount = c.Count,
                                    Score = c.Score
                                },
                                ActualCount = selectedQuestions.Count(q =>
                                    (c.LevelId <= 0 || c.LevelId == q.QuestionLevelId) &&
                                    (c.QuestionType <= 0 || c.QuestionType == q.QuestionType) &&
                                    (c.ChapterId <= 0 || c.ChapterId == q.ChapterId) &&
                                    (string.IsNullOrWhiteSpace(c.Topic) || q.Tags.Contains(c.Topic))
                                )
                            }).ToList(),
                            Warnings = warnings
                        }
                    };

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Lỗi khi tạo đề thi theo cấu trúc");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đề thi theo cấu trúc");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi tạo đề thi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy đề thi theo chủ đề
        /// </summary>
        /// <remarks>   
        /// API này cho phép lấy các đề thi theo chủ đề cụ thể
        /// </remarks>
        [HttpGet("topic/{topic}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTestsByTopic(string topic, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation($"Lấy đề thi theo chủ đề: {topic}");

                // Validate
                if (string.IsNullOrWhiteSpace(topic))
                {
                    return BadRequest(new { Success = false, Message = "Chủ đề không được để trống" });
                }

                // Chuẩn hóa page và pageSize
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;
                if (pageSize > 50) pageSize = 50;

                // Tìm tất cả các câu hỏi có tag chứa chủ đề
                var questionsWithTopic = await _context.Questions
                    .Where(q => q.Tags.Contains(topic))
                    .Select(q => q.Id)
                    .ToListAsync();

                // Tìm các đề thi có câu hỏi thuộc chủ đề này
                var query = _context.Exams
                    .Include(e => e.Subject)
                    .Include(e => e.ExamType)
                    .Include(e => e.Creator)
                    .Include(e => e.ExamQuestions)
                    .Where(e => e.ExamQuestions.Any(eq => questionsWithTopic.Contains(eq.QuestionId)))
                    .OrderByDescending(e => e.CreatedAt)
                    .AsQueryable();

                // Đếm tổng số đề thi
                var totalCount = await query.CountAsync();

                // Phân trang
                var exams = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (!exams.Any())
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy đề thi nào với chủ đề '{topic}'" });
                }

                // Tính toán thông tin thêm
                var result = exams.Select(e => new
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    Subject = new { Id = e.Subject.Id, Name = e.Subject.Name, Code = e.Subject.Code },
                    ExamType = new { Id = e.ExamType.Id, Name = e.ExamType.Name },
                    Creator = new { Id = e.Creator.Id, Username = e.Creator.Username, FullName = e.Creator.FullName },
                    Duration = e.Duration,
                    TotalScore = e.TotalScore,
                    PassScore = e.PassScore,
                    QuestionCount = e.ExamQuestions.Count,
                    CreatedAt = e.CreatedAt,
                    TopicRelevance = e.ExamQuestions.Count(eq => questionsWithTopic.Contains(eq.QuestionId)) * 100.0 / e.ExamQuestions.Count
                }).ToList();

                return Ok(new
                {
                    Success = true,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy đề thi theo chủ đề: {topic}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy đề thi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Tạo đề ôn tập tùy chọn
        /// </summary>
        /// <remarks>
        /// API này cho phép tạo đề ôn tập theo các tùy chọn của người dùng
        /// </remarks>
        [HttpPost("practice")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreatePracticeTest([FromBody] CreatePracticeTestDTO model)
        {
            try
            {
                _logger.LogInformation("Bắt đầu tạo đề ôn tập tùy chọn");

                if (model == null)
                {
                    return BadRequest(new { Success = false, Message = "Dữ liệu không hợp lệ" });
                }

                // Validate dữ liệu đầu vào
                var validationErrors = new Dictionary<string, string>();

                if (model.SubjectId <= 0)
                {
                    validationErrors.Add("subjectId", "ID môn học không hợp lệ");
                }

                if (model.QuestionCount <= 0 || model.QuestionCount > 100)
                {
                    validationErrors.Add("questionCount", "Số lượng câu hỏi phải nằm trong khoảng 1-100");
                }

                if (!string.IsNullOrWhiteSpace(model.Title) && model.Title.Length > 200)
                {
                    validationErrors.Add("title", "Tiêu đề không được vượt quá 200 ký tự");
                }

                if (validationErrors.Count > 0)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Đề thi không hợp lệ: {validationErrors.Count} lỗi được tìm thấy",
                        ValidationErrors = validationErrors
                    });
                }

                // Xác định userId từ token
                int userId = GetUserIdFromClaims();
                if (userId == 0) userId = ImprovedUserIdExtraction();
                if (userId == 0) userId = DirectTokenParsing();

                if (userId <= 0)
                {
                    _logger.LogError("❌ Không thể xác định userId từ token");
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không xác định được người dùng",
                        ValidationErrors = new Dictionary<string, string> { { "user", "Không xác định được người dùng" } }
                    });
                }

                // Kiểm tra user và subject tồn tại
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Người dùng không tồn tại trong hệ thống"
                    });
                }

                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy môn học với ID {model.SubjectId}" });
                }

                // Tìm loại đề thi "Ôn tập" hoặc tạo mới nếu chưa có
                var practiceExamType = await _context.ExamTypes
                    .FirstOrDefaultAsync(et => et.Name.Contains("Ôn tập") || et.Name.Contains("Practice"));
                
                if (practiceExamType == null)
                {
                    // Tạo loại đề thi ôn tập nếu chưa có
                    practiceExamType = new ExamType
                    {
                        Name = "Đề ôn tập",
                        Description = "Đề thi dành cho luyện tập",
                        
                    };
                    _context.ExamTypes.Add(practiceExamType);
                    await _context.SaveChangesAsync();
                }

                // Xây dựng query câu hỏi với các bộ lọc
                var query = _context.Questions
                    .Where(q => q.SubjectId == model.SubjectId && q.IsActive);

                // Áp dụng các bộ lọc tùy chọn
                if (model.LevelId.HasValue && model.LevelId > 0)
                {
                    var levelFilterQuery = query.Where(q => q.QuestionLevelId == model.LevelId);
                    var levelCount = await levelFilterQuery.CountAsync();
                    
                    if (levelCount >= model.QuestionCount)
                    {
                        query = levelFilterQuery;
                        _logger.LogInformation($"Áp dụng lọc theo level {model.LevelId}");
                    }
                }

                if (model.QuestionTypes != null && model.QuestionTypes.Any())
                {
                    var typeFilterQuery = query.Where(q => model.QuestionTypes.Contains(q.QuestionType));
                    var typeCount = await typeFilterQuery.CountAsync();
                    
                    if (typeCount >= model.QuestionCount)
                    {
                        query = typeFilterQuery;
                        _logger.LogInformation($"Áp dụng lọc theo loại câu hỏi");
                    }
                }

                if (model.ChapterIds != null && model.ChapterIds.Any())
                {
                    var chapterFilterQuery = query.Where(q => q.ChapterId.HasValue && model.ChapterIds.Contains(q.ChapterId.Value));
                    var chapterCount = await chapterFilterQuery.CountAsync();
                    
                    if (chapterCount >= model.QuestionCount)
                    {
                        query = chapterFilterQuery;
                        _logger.LogInformation($"Áp dụng lọc theo chương");
                    }
                }

                if (!string.IsNullOrWhiteSpace(model.Topic))
                {
                    var topicFilterQuery = query.Where(q => q.Tags != null && q.Tags.Contains(model.Topic));
                    var topicCount = await topicFilterQuery.CountAsync();
                    
                    if (topicCount >= model.QuestionCount)
                    {
                        query = topicFilterQuery;
                        _logger.LogInformation($"Áp dụng lọc theo chủ đề '{model.Topic}'");
                    }
                }

                // Lấy tất cả câu hỏi khả dụng
                var availableQuestions = await query.ToListAsync();

                if (!availableQuestions.Any())
                {
                    var fallbackQuestions = await _context.Questions
                        .Where(q => q.SubjectId == model.SubjectId && q.IsActive)
                        .ToListAsync();

                    if (!fallbackQuestions.Any())
                    {
                        return NotFound(new 
                        { 
                            Success = false, 
                            Message = $"Môn học không có câu hỏi nào khả dụng"
                        });
                    }
                    availableQuestions = fallbackQuestions;
                }

                if (availableQuestions.Count < model.QuestionCount)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Chỉ có {availableQuestions.Count} câu hỏi khả dụng, không đủ số lượng yêu cầu ({model.QuestionCount})"
                    });
                }

                // Chọn ngẫu nhiên câu hỏi
                var random = new Random();
                var selectedQuestions = availableQuestions
                    .OrderBy(q => random.Next())
                    .Take(model.QuestionCount)
                    .ToList();

                // Tạo title tự động nếu chưa có
                string practiceTitle = !string.IsNullOrWhiteSpace(model.Title) 
                    ? model.Title 
                    : $"Đề ôn tập {subject.Name} ({model.QuestionCount} câu) - {DateTime.Now:dd/MM/yyyy HH:mm}";

                // Tính tổng điểm
                decimal totalScore = selectedQuestions.Sum(q => q.DefaultScore);

                // **THAY ĐỔI CHÍNH: LUU VÀO BẢNG EXAMS**
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // Tạo đề thi trong bảng Exams
                    var exam = new Exam
                    {
                        Title = practiceTitle,
                        Description = "Đề thi ôn tập được tạo tự động",
                        SubjectId = model.SubjectId,
                        ExamTypeId = practiceExamType.Id,
                        CreatorId = userId,
                        Duration = 60, // Thời gian mặc định 60 phút
                        TotalScore = totalScore,
                        PassScore = totalScore * 0.5m, // 50% để đạt
                        IsActive = true,
                        ShowResult = true,
                        ShowAnswers = true,
                        ShuffleQuestions = true,
                        ShuffleOptions = true,
                        AutoGradeShortAnswer = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        AccessCode = GenerateRandomAccessCode(),
                        ScoringConfig = "{\"default_score\": 1.0}"
                    };

                    _context.Exams.Add(exam);
                    await _context.SaveChangesAsync();

                    // Thêm câu hỏi vào đề thi
                    int orderIndex = 1;
                    foreach (var question in selectedQuestions)
                    {
                        var examQuestion = new ExamQuestion
                        {
                            ExamId = exam.Id,
                            QuestionId = question.Id,
                            Score = question.DefaultScore,
                            OrderIndex = orderIndex++
                        };
                        _context.ExamQuestions.Add(examQuestion);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation($"✅ Đã tạo đề thi ôn tập ID: {exam.Id}");

                    // Trả về kết quả
                    var result = new
                    {
                        Success = true,
                        Message = "Tạo đề ôn tập thành công",
                        Data = new
                        {
                            ExamId = exam.Id, // Trả về ID thật của đề thi
                            PracticeId = exam.Id, // Giữ compatibility với frontend
                            Title = exam.Title,
                            Subject = new { Id = subject.Id, Name = subject.Name, Code = subject.Code },
                            QuestionCount = selectedQuestions.Count,
                            RequestedCount = model.QuestionCount,
                            TotalScore = totalScore,
                            AccessCode = exam.AccessCode,
                            CreatedAt = exam.CreatedAt,
                            CreatedBy = new { Id = user.Id, Username = user.Username, FullName = user.FullName },
                            
                            // Thống kê về các loại câu hỏi
                            QuestionTypes = selectedQuestions.GroupBy(q => q.QuestionType)
                                .Select(g => new
                                {
                                    Type = g.Key,
                                    TypeName = GetQuestionTypeName(g.Key),
                                    Count = g.Count()
                                }).ToList(),

                            // Thống kê về cấp độ
                            Levels = selectedQuestions.Where(q => q.QuestionLevelId > 0)
                                .GroupBy(q => q.QuestionLevelId)
                                .Select(g => new
                                {
                                    LevelId = g.Key,
                                    LevelName = g.Key.ToString(),
                                    Count = g.Count()
                                }).ToList(),

                            // Danh sách câu hỏi (tóm tắt)
                            Questions = selectedQuestions.Select(q => new
                            {
                                Id = q.Id,
                                Content = q.Content.Length > 100 ? q.Content.Substring(0, 100) + "..." : q.Content,
                                QuestionType = q.QuestionType,
                                TypeName = GetQuestionTypeName(q.QuestionType),
                                Score = q.DefaultScore
                            }).ToList()
                        }
                    };

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Lỗi khi lưu đề thi ôn tập");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đề ôn tập tùy chọn");
                return StatusCode(500, new { 
                    Success = false, 
                    Message = "Đã xảy ra lỗi khi tạo đề ôn tập", 
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// API tạm thời cho đề ôn tập với userId cố định - Dùng khi API chính gặp vấn đề
        /// </summary>
        [HttpPost("practice-fixed")]
        [AllowAnonymous]
        public async Task<IActionResult> CreatePracticeTestFixed([FromBody] CreatePracticeTestDTO model)
        {
            try
            {
                _logger.LogInformation("Bắt đầu tạo đề ôn tập tùy chọn với userId cố định");

                if (model == null)
                {
                    return BadRequest(new { Success = false, Message = "Dữ liệu không hợp lệ" });
                }

                // Validate dữ liệu đầu vào
                var validationErrors = new Dictionary<string, string>();

                if (model.SubjectId <= 0)
                {
                    validationErrors.Add("subjectId", "ID môn học không hợp lệ");
                }

                if (model.QuestionCount <= 0 || model.QuestionCount > 100)
                {
                    validationErrors.Add("questionCount", "Số lượng câu hỏi phải nằm trong khoảng 1-100");
                }

                if (validationErrors.Count > 0)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Đề thi không hợp lệ: {validationErrors.Count} lỗi được tìm thấy",
                        ValidationErrors = validationErrors
                    });
                }

                // SỬ DỤNG USER ID CỐ ĐỊNH
                int userId = 15;
                _logger.LogWarning($"Sử dụng userId cố định: {userId}");

                // Kiểm tra môn học tồn tại không
                var subject = await _context.Subjects.FindAsync(model.SubjectId);
                if (subject == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy môn học với ID {model.SubjectId}" });
                }

                // Xây dựng query câu hỏi dựa trên điều kiện lọc
                var query = _context.Questions
                    .Where(q => q.SubjectId == model.SubjectId && q.IsActive);

                // Lọc theo mức độ nếu có
                if (model.LevelId > 0)
                {
                    query = query.Where(q => q.QuestionLevelId == model.LevelId);
                }

                // Lọc theo loại câu hỏi
                if (model.QuestionTypes != null && model.QuestionTypes.Any())
                {
                    query = query.Where(q => model.QuestionTypes.Contains(q.QuestionType));
                }

                // Lọc theo chương
                if (model.ChapterIds != null && model.ChapterIds.Any())
                {
                    query = query.Where(q => model.ChapterIds.Contains((int)q.ChapterId));
                }

                // Lọc theo chủ đề
                if (!string.IsNullOrWhiteSpace(model.Topic))
                {
                    query = query.Where(q => q.Tags.Contains(model.Topic));
                }

                // Tìm những câu hỏi phù hợp
                var availableQuestions = await query.ToListAsync();

                // Kiểm tra nếu không có đủ câu hỏi
                if (!availableQuestions.Any())
                {
                    return NotFound(new { Success = false, Message = "Không tìm thấy câu hỏi phù hợp với tiêu chí đã chọn" });
                }

                if (availableQuestions.Count < model.QuestionCount)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"Chỉ có {availableQuestions.Count} câu hỏi khả dụng, không đủ số lượng yêu cầu ({model.QuestionCount})"
                    });
                }

                // Chọn ngẫu nhiên câu hỏi
                var random = new Random();
                var selectedQuestions = availableQuestions
                    .OrderBy(q => random.Next())
                    .Take(model.QuestionCount)
                    .ToList();

                // Tạo đề ôn tập
                var practiceExam = new PracticeExam
                {
                    SubjectId = model.SubjectId,
                    UserId = userId,
                    QuestionCount = selectedQuestions.Count,
                    LevelId = model.LevelId > 0 ? model.LevelId : (int?)null,
                    Topic = model.Topic,
                    CreatedAt = DateTime.UtcNow,
                    Questions = string.Join(",", selectedQuestions.Select(q => q.Id)),
                    IsCompleted = false
                };

                _context.PracticeExams.Add(practiceExam);
                await _context.SaveChangesAsync();

                // Tính điểm tối đa
                decimal totalScore = selectedQuestions.Sum(q => q.DefaultScore);

                // Tạo kết quả trả về
                var result = new
                {
                    Success = true,
                    Message = "Tạo đề ôn tập thành công",
                    Data = new
                    {
                        PracticeId = practiceExam.Id,
                        Title = practiceExam.Title, // Thêm title vào response
                        Subject = new { Id = subject.Id, Name = subject.Name, Code = subject.Code },
                        QuestionCount = selectedQuestions.Count,
                        RequestedCount = model.QuestionCount,
                        TotalScore = totalScore,
                        
                        // Thống kê về các loại câu hỏi được chọn
                        QuestionTypes = selectedQuestions.GroupBy(q => q.QuestionType)
                            .Select(g => new
                            {
                                Type = g.Key,
                                TypeName = GetQuestionTypeName(g.Key),
                                Count = g.Count()
                            }).ToList(),

                        // Thống kê về cấp độ
                        Levels = selectedQuestions.Where(q => q.QuestionLevelId > 0)
                            .GroupBy(q => q.QuestionLevelId)
                            .Select(g => new
                            {
                                LevelId = g.Key,
                                LevelName = g.Key.ToString(), // Có thể join với Level table nếu cần
                                Count = g.Count()
                            }).ToList(),

                        // Thống kê về chương
                        Chapters = selectedQuestions.Where(q => q.ChapterId.HasValue)
                            .GroupBy(q => q.ChapterId)
                            .Select(g => new
                            {
                                ChapterId = g.Key,
                                ChapterTitle = g.Key.ToString(), // Có thể join với Chapter table nếu cần
                                Count = g.Count()
                            }).ToList(),

                        // Danh sách câu hỏi (tóm tắt)
                        Questions = selectedQuestions.Select(q => new
                        {
                            Id = q.Id,
                            Content = q.Content.Length > 100 ? q.Content.Substring(0, 100) + "..." : q.Content,
                            QuestionType = q.QuestionType,
                            TypeName = GetQuestionTypeName(q.QuestionType),
                            Score = q.DefaultScore
                        }).ToList()
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đề ôn tập tùy chọn");
                return StatusCode(500, new { 
                    Success = false, 
                    Message = "Đã xảy ra lỗi khi tạo đề ôn tập", 
                    Error = ex.Message,
                    StackTrace = ex.StackTrace // Chỉ trong development
                });
            }
        }

        /// <summary>
        /// API đơn giản để tạo đề ôn tập khi API chính gặp vấn đề
        /// </summary>
        [HttpPost("simple-practice")]
        [AllowAnonymous]
        public async Task<IActionResult> SimplePractice([FromBody] SimplePracticeDTO model)
        {
            try
            {
                _logger.LogInformation("Bắt đầu xử lý SimplePractice");

                // Luôn sử dụng userId cố định
                int userId = 15;

                // Kiểm tra các giá trị đầu vào cơ bản
                if (model == null || model.SubjectId <= 0 || model.QuestionCount <= 0)
                {
                    return BadRequest(new { Success = false, Message = "Dữ liệu không hợp lệ" });
                }

                // Tìm các câu hỏi phù hợp điều kiện
                var questions = await _context.Questions
                    .Where(q => q.SubjectId == model.SubjectId && q.IsActive)
                    .ToListAsync();

                if (!questions.Any())
                {
                    return BadRequest(new { Success = false, Message = $"Không tìm thấy câu hỏi nào cho môn học ID {model.SubjectId}" });
                }

                if (questions.Count < model.QuestionCount)
                {
                    return BadRequest(new { Success = false, Message = $"Không đủ câu hỏi ({questions.Count}/{model.QuestionCount})" });
                }

                // Lọc câu hỏi theo chủ đề nếu có
                if (!string.IsNullOrEmpty(model.Topic))
                {
                    var filteredQuestions = questions.Where(q => q.Tags != null && q.Tags.Contains(model.Topic)).ToList();
                    if (filteredQuestions.Count >= model.QuestionCount)
                    {
                        questions = filteredQuestions;
                    }
                    else
                    {
                        _logger.LogInformation($"Không đủ câu hỏi có chủ đề '{model.Topic}', sử dụng tất cả câu hỏi có sẵn");
                    }
                }

                // Chọn ngẫu nhiên
                var random = new Random();
                var selectedQuestions = questions
                    .OrderBy(q => random.Next())
                    .Take(model.QuestionCount)
                    .ToList();

                // Tạo đề ôn tập
                var practice = new PracticeExam
                {
                    SubjectId = model.SubjectId,
                    UserId = userId,
                    QuestionCount = selectedQuestions.Count,
                    Topic = model.Topic,
                    CreatedAt = DateTime.UtcNow,
                    Questions = string.Join(",", selectedQuestions.Select(q => q.Id)),
                    IsCompleted = false
                };

                _context.PracticeExams.Add(practice);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Success = true,
                    Message = "Tạo đề ôn tập thành công",
                    PracticeId = practice.Id,
                    QuestionCount = selectedQuestions.Count,
                    Questions = selectedQuestions.Select(q => new
                    {
                        Id = q.Id,
                        Content = q.Content,
                        QuestionType = q.QuestionType,
                        TypeName = GetQuestionTypeName(q.QuestionType)
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đề ôn tập đơn giản");
                return StatusCode(500, new { Success = false, Message = "Lỗi khi tạo đề ôn tập", Error = ex.Message });
            }
        }

        /// <summary>
        /// API kiểm tra để xác nhận controller hoạt động đúng
        /// </summary>
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new
            {
                Success = true,
                Message = "TestController hoạt động bình thường",
                Timestamp = DateTime.UtcNow,
                ServerInfo = Environment.MachineName
            });
        }

        /// <summary>
        /// Lấy lịch sử luyện đề ôn tập của người dùng
        /// </summary>
        /// <remarks>
        /// API này cho phép lấy lịch sử luyện đề ôn tập của một người dùng cụ thể
        /// </remarks>
        [HttpGet("history/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPracticeHistory(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation($"Lấy lịch sử luyện đề ôn tập của người dùng: {userId}");

                // Lấy user id từ token sử dụng phương thức helper đã được sửa
                int currentUserId = GetUserIdFromClaims();

                // Kiểm tra quyền truy cập - chỉ được xem lịch sử của chính mình hoặc admin
                if (currentUserId != userId && !User.IsInRole("Admin"))
                {
                    return StatusCode(403, new { Success = false, Message = "Bạn không có quyền xem lịch sử của người dùng khác" });
                }

                // Chuẩn hóa page và pageSize
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;
                if (pageSize > 50) pageSize = 50;

                // Kiểm tra người dùng tồn tại
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { Success = false, Message = $"Không tìm thấy người dùng với ID {userId}" });
                }

                // Lấy lịch sử ôn tập
                var query = _context.PracticeExams
                    .Include(p => p.Subject)
                    .Include(p => p.Level)
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.CreatedAt);

                // Đếm tổng số bản ghi
                var totalCount = await query.CountAsync();

                // Phân trang
                var practices = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (!practices.Any())
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Không có lịch sử luyện đề ôn tập nào",
                        TotalCount = 0,
                        Page = page,
                        PageSize = pageSize,
                        TotalPages = 0,
                        Data = new List<object>()
                    });
                }

                // Tính tỷ lệ hoàn thành và các thống kê khác
                var results = new List<object>();

                foreach (var practice in practices)
                {
                    // Lấy danh sách ID câu hỏi
                    var questionIds = practice.Questions.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(id => int.Parse(id))
                        .ToList();

                    // Lấy thông tin bài làm nếu đã hoàn thành
                    PracticeResult practiceResult = null;
                    if (practice.IsCompleted)
                    {
                        practiceResult = await _context.PracticeResults
                            .FirstOrDefaultAsync(r => r.PracticeExamId == practice.Id);
                    }

                    results.Add(new
                    {
                        Id = practice.Id,
                        Subject = new { Id = practice.Subject.Id, Name = practice.Subject.Name, Code = practice.Subject.Code },
                        Level = practice.Level != null ? new { Id = practice.Level.Id, Name = practice.Level.Name } : null,
                        QuestionCount = practice.QuestionCount,
                        Topic = practice.Topic,
                        CreatedAt = practice.CreatedAt,
                        IsCompleted = practice.IsCompleted,
                        CompletionStats = practiceResult != null ? new
                        {
                            Score = practiceResult.Score,
                            MaxScore = practiceResult.MaxScore,
                            CorrectAnswers = practiceResult.CorrectAnswers,
                            CompletedAt = practiceResult.CompletedAt,
                            CompletionTime = practiceResult.CompletionTime,
                            PercentageScore = practiceResult.MaxScore > 0
                                ? Math.Round(practiceResult.Score * 100 / practiceResult.MaxScore, 2)
                                : 0
                        } : null
                    });
                }

                // Tạo kết quả trả về
                var result = new
                {
                    Success = true,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Data = results
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy lịch sử luyện đề ôn tập của người dùng: {userId}");
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi lấy lịch sử luyện đề ôn tập", Error = ex.Message });
            }
        }

        #region Helper Methods

        /// <summary>
        /// Lấy tên loại câu hỏi từ mã số
        /// </summary>
        private string GetQuestionTypeName(int questionType)
        {
            return questionType switch
            {
                1 => "Trắc nghiệm một đáp án",
                2 => "Đúng-sai nhiều ý",
                3 => "Trả lời ngắn",
                _ => "Không xác định",
            };
        }

        /// <summary>
        /// Tạo mã truy cập ngẫu nhiên cho đề thi
        /// </summary>
        private string GenerateRandomAccessCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var code = new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            // Kiểm tra xem code đã tồn tại chưa
            while (_context.Exams.Any(e => e.AccessCode == code))
            {
                code = new string(Enumerable.Repeat(chars, 8)
                    .Select(s => s[random.Next(s.Length)]).ToArray());
            }

            return code;
        }
        #endregion
    }

    /// <summary>
    /// DTO đơn giản cho API tạo đề ôn tập khi API chính gặp vấn đề
    /// </summary>
    public class SimplePracticeDTO
    {
        public int SubjectId { get; set; }
        public int QuestionCount { get; set; }
        public string Topic { get; set; }
    }

    /// <summary>
    /// DTO cho API kiểm tra token
    /// </summary>
    public class TokenVerificationRequest
    {
        public string Token { get; set; }
    }
}