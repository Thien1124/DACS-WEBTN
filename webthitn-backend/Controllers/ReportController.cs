using System;
using System.Collections.Generic;
using System.Globalization;
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

namespace webthitn_backend.Controllers
{
    /// <summary>
    /// API để cung cấp báo cáo và thống kê hệ thống
    /// </summary>
    [Route("api/reports")]
    [ApiController]
    [Authorize(Roles = "Admin,Teacher")]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReportController> _logger;

        public ReportController(ApplicationDbContext context, ILogger<ReportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy báo cáo tổng quan về các kỳ thi trong hệ thống
        /// </summary>
        /// <param name="startDate">Ngày bắt đầu thống kê (định dạng yyyy-MM-dd)</param>
        /// <param name="endDate">Ngày kết thúc thống kê (định dạng yyyy-MM-dd)</param>
        /// <returns>Báo cáo tổng quan</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string classroomName = null,
            [FromQuery] int? subjectId = null)
        {
            try
            {
                _logger.LogInformation($"Lấy báo cáo kỳ thi: StartDate={startDate}, EndDate={endDate}, ClassroomName={classroomName}, SubjectId={subjectId}");

                // Xác định khoảng thời gian báo cáo
                var start = startDate ?? DateTimeHelper.GetVietnamNow().AddMonths(-1);
                var end = endDate ?? DateTimeHelper.GetVietnamNow();

                // Làm tròn về đầu ngày và cuối ngày
                start = new DateTime(start.Year, start.Month, start.Day, 0, 0, 0);
                end = new DateTime(end.Year, end.Month, end.Day, 23, 59, 59);

                // Thống kê chung
                var officialExamQuery = _context.OfficialExams
                    .Include(oe => oe.Exam)
                        .ThenInclude(e => e.Subject)
                    .AsQueryable();

                // Lọc theo thời gian
                officialExamQuery = officialExamQuery.Where(oe => oe.CreatedAt >= start && oe.CreatedAt <= end);

                // Lọc theo lớp học
                if (!string.IsNullOrEmpty(classroomName))
                {
                    officialExamQuery = officialExamQuery.Where(oe => oe.ClassroomName == classroomName);
                }

                // Lọc theo môn học
                if (subjectId.HasValue)
                {
                    officialExamQuery = officialExamQuery.Where(oe => oe.Exam.SubjectId == subjectId.Value);
                }

                // Lấy danh sách kỳ thi
                var officialExams = await officialExamQuery.ToListAsync();
                var examIds = officialExams.Select(oe => oe.Id).ToList();

                // Thống kê học sinh tham gia kỳ thi
                var studentStats = await _context.OfficialExamStudents
                    .Where(oes => examIds.Contains(oes.OfficialExamId))
                    .GroupBy(oes => oes.OfficialExamId)
                    .Select(g => new
                    {
                        OfficialExamId = g.Key,
                        AssignedCount = g.Count(),
                        CompletedCount = g.Count(oes => oes.HasTaken),
                        PassedCount = g.Count(oes => oes.HasTaken && oes.ExamResult != null && oes.ExamResult.IsPassed)
                    })
                    .ToDictionaryAsync(x => x.OfficialExamId, x => new
                    {
                        x.AssignedCount,
                        x.CompletedCount,
                        x.PassedCount
                    });

                // Tổng hợp thông tin kỳ thi
                var examReports = officialExams.Select(oe =>
                {
                    var stats = studentStats.ContainsKey(oe.Id)
                        ? studentStats[oe.Id]
                        : new { AssignedCount = 0, CompletedCount = 0, PassedCount = 0 };

                    double passRate = stats.CompletedCount > 0
                        ? Math.Round((double)stats.PassedCount / stats.CompletedCount * 100, 2)
                        : 0;

                    double completionRate = stats.AssignedCount > 0
                        ? Math.Round((double)stats.CompletedCount / stats.AssignedCount * 100, 2)
                        : 0;

                    return new
                    {
                        Id = oe.Id,
                        Title = oe.Title,
                        ExamTitle = oe.Exam?.Title,
                        SubjectName = oe.Exam?.Subject?.Name,
                        SubjectCode = oe.Exam?.Subject?.Code,
                        ClassroomName = oe.ClassroomName,
                        StartTime = oe.StartTime,
                        EndTime = oe.EndTime,
                        CreatedAt = oe.CreatedAt,
                        Status = GetOfficialExamStatus(oe),
                        AssignedStudents = stats.AssignedCount,
                        CompletedExams = stats.CompletedCount,
                        PassedExams = stats.PassedCount,
                        CompletionRate = completionRate,
                        PassRate = passRate
                    };
                }).ToList();

                // Thống kê tổng hợp
                var totalExams = officialExams.Count;
                var totalAssignedStudents = examReports.Sum(r => r.AssignedStudents);
                var totalCompletedExams = examReports.Sum(r => r.CompletedExams);
                var totalPassedExams = examReports.Sum(r => r.PassedExams);

                double overallCompletionRate = totalAssignedStudents > 0
                    ? Math.Round((double)totalCompletedExams / totalAssignedStudents * 100, 2)
                    : 0;

                double overallPassRate = totalCompletedExams > 0
                    ? Math.Round((double)totalPassedExams / totalCompletedExams * 100, 2)
                    : 0;

                // Thống kê theo lớp học
                var classroomStats = examReports
                    .GroupBy(r => r.ClassroomName ?? "Không có lớp")
                    .Select(g => new
                    {
                        ClassroomName = g.Key,
                        ExamCount = g.Count(),
                        AssignedStudents = g.Sum(r => r.AssignedStudents),
                        CompletedExams = g.Sum(r => r.CompletedExams),
                        PassedExams = g.Sum(r => r.PassedExams),
                        AveragePassRate = g.Sum(r => r.CompletedExams) > 0
                            ? Math.Round((double)g.Sum(r => r.PassedExams) / g.Sum(r => r.CompletedExams) * 100, 2)
                            : 0
                    })
                    .OrderByDescending(s => s.ExamCount)
                    .ToList();

                // Thống kê theo môn học
                var subjectStats = examReports
                    .GroupBy(r => new { SubjectName = r.SubjectName ?? "Không có môn học", SubjectCode = r.SubjectCode })
                    .Select(g => new
                    {
                        SubjectName = g.Key.SubjectName,
                        SubjectCode = g.Key.SubjectCode,
                        ExamCount = g.Count(),
                        AssignedStudents = g.Sum(r => r.AssignedStudents),
                        CompletedExams = g.Sum(r => r.CompletedExams),
                        PassedExams = g.Sum(r => r.PassedExams),
                        AveragePassRate = g.Sum(r => r.CompletedExams) > 0
                            ? Math.Round((double)g.Sum(r => r.PassedExams) / g.Sum(r => r.CompletedExams) * 100, 2)
                            : 0
                    })
                    .OrderByDescending(s => s.ExamCount)
                    .ToList();

                // Thống kê theo tháng
                var monthlyStats = examReports
                    .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key.Month),
                        ExamCount = g.Count(),
                        AssignedStudents = g.Sum(r => r.AssignedStudents),
                        CompletedExams = g.Sum(r => r.CompletedExams),
                        PassedExams = g.Sum(r => r.PassedExams)
                    })
                    .OrderBy(s => s.Year)
                    .ThenBy(s => s.Month)
                    .ToList();

                // Trả về kết quả
                return Ok(new
                {
                    ReportPeriod = new
                    {
                        StartDate = start.ToString("yyyy-MM-dd"),
                        EndDate = end.ToString("yyyy-MM-dd")
                    },
                    Summary = new
                    {
                        TotalExams = totalExams,
                        TotalAssignedStudents = totalAssignedStudents,
                        TotalCompletedExams = totalCompletedExams,
                        TotalPassedExams = totalPassedExams,
                        OverallCompletionRate = overallCompletionRate,
                        OverallPassRate = overallPassRate
                    },
                    ClassroomStatistics = classroomStats,
                    SubjectStatistics = subjectStats,
                    MonthlyStatistics = monthlyStats,
                    ExamDetails = examReports
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating report: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo báo cáo kỳ thi" });
            }
        }

        /// <summary>
        /// Lấy báo cáo chi tiết về một kỳ thi cụ thể
        /// </summary>
        /// <param name="id">ID của kỳ thi chính thức</param>
        /// <returns>Báo cáo chi tiết kỳ thi</returns>
        [HttpGet("exams/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetExamReport(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy báo cáo chi tiết kỳ thi ID: {id}");

                // Tìm kỳ thi
                var officialExam = await _context.OfficialExams
                    .Include(oe => oe.Exam)
                        .ThenInclude(e => e.Subject)
                    .FirstOrDefaultAsync(oe => oe.Id == id);

                if (officialExam == null)
                {
                    _logger.LogWarning($"Không tìm thấy kỳ thi chính thức ID: {id}");
                    return NotFound(new { message = "Không tìm thấy kỳ thi chính thức" });
                }

                // Lấy thông tin học sinh tham gia kỳ thi
                var students = await _context.OfficialExamStudents
                    .Include(oes => oes.Student)
                    .Include(oes => oes.ExamResult)
                    .Where(oes => oes.OfficialExamId == id)
                    .ToListAsync();

                // Thống kê chung
                var totalStudents = students.Count;
                var completedCount = students.Count(s => s.HasTaken);
                var passedCount = students.Count(s => s.HasTaken && s.ExamResult != null && s.ExamResult.IsPassed == true);

                double completionRate = totalStudents > 0
                    ? Math.Round((double)completedCount / totalStudents * 100, 2)
                    : 0;

                double passRate = completedCount > 0
                    ? Math.Round((double)passedCount / completedCount * 100, 2)
                    : 0;

                // Thống kê điểm số
                var scores = students
                    .Where(s => s.ExamResult != null)
                    .Select(s => (double)s.ExamResult.Score)  // Explicit conversion from decimal to double
                    .ToList();

                double averageScore = 0;
                double highestScore = 0;
                double lowestScore = 0;

                if (scores.Any())
                {
                    averageScore = Math.Round(scores.Average(), 2);
                    highestScore = scores.Max();
                    lowestScore = scores.Min();
                }

                // Phân phối điểm số
                var scoreRanges = new Dictionary<string, int>
                {
                    {"0-4", 0},
                    {"4-5", 0},
                    {"5-6", 0},
                    {"6-7", 0},
                    {"7-8", 0},
                    {"8-9", 0},
                    {"9-10", 0}
                };

                foreach (var score in scores)
                {
                    if (score < 4) scoreRanges["0-4"]++;
                    else if (score < 5) scoreRanges["4-5"]++;
                    else if (score < 6) scoreRanges["5-6"]++;
                    else if (score < 7) scoreRanges["6-7"]++;
                    else if (score < 8) scoreRanges["7-8"]++;
                    else if (score < 9) scoreRanges["8-9"]++;
                    else scoreRanges["9-10"]++;
                }

                // Chi tiết học sinh
                var studentDetails = students
                    .OrderBy(s => s.Student?.Username)
                    .Select(s => new
                    {
                        StudentId = s.StudentId,
                        StudentName = s.Student?.FullName ?? "Unknown",
                        StudentCode = s.Student?.Username ?? "Unknown",
                        HasTaken = s.HasTaken,
                        ExamResultId = s.ExamResultId,
                        Score = s.ExamResult?.Score != null ? (double)s.ExamResult.Score : (double?)null,  // Explicit conversion
                        PercentageScore = s.ExamResult?.PercentageScore != null ? (double)s.ExamResult.PercentageScore : (double?)null,  // Explicit conversion
                        IsPassed = s.ExamResult?.IsPassed,
                        CompletedAt = s.ExamResult?.CompletedAt
                    })
                    .ToList();

                // Trả về kết quả
                return Ok(new
                {
                    ExamInfo = new
                    {
                        Id = officialExam.Id,
                        Title = officialExam.Title,
                        Description = officialExam.Description,
                        ExamId = officialExam.ExamId,
                        ExamTitle = officialExam.Exam?.Title,
                        SubjectName = officialExam.Exam?.Subject?.Name,
                        SubjectCode = officialExam.Exam?.Subject?.Code,
                        ClassroomName = officialExam.ClassroomName,
                        StartTime = officialExam.StartTime,
                        EndTime = officialExam.EndTime,
                        PassScore = officialExam.Exam?.PassScore != null ? (double)officialExam.Exam.PassScore : (double?)null,  // Explicit conversion
                        CreatedAt = officialExam.CreatedAt,
                        Status = GetOfficialExamStatus(officialExam)
                    },
                    Statistics = new
                    {
                        TotalStudents = totalStudents,
                        CompletedCount = completedCount,
                        PassedCount = passedCount,
                        CompletionRate = completionRate,
                        PassRate = passRate,
                        AverageScore = averageScore,
                        HighestScore = highestScore,
                        LowestScore = lowestScore,
                        ScoreDistribution = scoreRanges
                    },
                    Students = studentDetails
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating exam report: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo báo cáo chi tiết kỳ thi" });
            }
        }

        // Phương thức helper
        private string GetOfficialExamStatus(OfficialExam exam)
        {
            if (!exam.IsActive)
                return "Không hoạt động";

            var now = DateTimeHelper.GetVietnamNow();

            if (exam.StartTime.HasValue && now < exam.StartTime.Value)
                return "Chưa mở";

            if (exam.EndTime.HasValue && now > exam.EndTime.Value)
                return "Đã đóng";

            return "Đang mở";
        }
    }
}