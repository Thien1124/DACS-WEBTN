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
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaderboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeaderboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy top 10 người dùng có điểm cao nhất cho một đề thi cụ thể
        /// </summary>
        /// <param name="examId">ID của đề thi cần lấy bảng xếp hạng</param>
        /// <returns>Danh sách top 10 người dùng có điểm cao nhất</returns>
        /// <response code="200">Trả về thông tin bảng xếp hạng thành công</response>
        /// <response code="404">Không tìm thấy đề thi với ID đã cho</response>
        /// <response code="401">Không có quyền truy cập</response>
        [HttpGet("{examId}")]
        public async Task<IActionResult> GetExamLeaderboard(int examId)
        {
            try
            {
                // Kiểm tra xem đề thi có tồn tại hay không
                var exam = await _context.Exams.FindAsync(examId);
                if (exam == null)
                {
                    return NotFound(new { message = "Không tìm thấy đề thi" });
                }

                // Lấy danh sách kết quả cho đề thi
                var examResults = await _context.ExamResults
                    .Include(er => er.Student)
                    .Where(er => er.ExamId == examId && er.IsCompleted)
                    .ToListAsync();

                // Nhóm theo học sinh và lấy điểm cao nhất
                var highestScores = examResults
                    .GroupBy(er => er.StudentId)
                    .Select(group => group.OrderByDescending(er => er.Score)
                                          .ThenBy(er => er.CompletedAt)
                                          .First())
                    .OrderByDescending(er => er.Score)
                    .ThenBy(er => er.CompletedAt)
                    .Take(10)
                    .ToList();

                // Tạo danh sách kết quả với thứ hạng
                var leaderboard = new List<object>();
                for (int i = 0; i < highestScores.Count; i++)
                {
                    var er = highestScores[i];
                    leaderboard.Add(new
                    {
                        rank = i + 1,
                        resultId = er.Id,
                        student = new
                        {
                            id = er.Student.Id,
                            fullName = er.Student.FullName,
                            username = er.Student.Username,
                            avatarUrl = er.Student.AvatarUrl,
                            school = er.Student.School,
                            grade = er.Student.Grade
                        },
                        score = er.Score,
                        percentageScore = er.PercentageScore,
                        isPassed = er.IsPassed,
                        completedAt = er.CompletedAt,
                        duration = er.Duration
                    });
                }

                // Tính toán thông tin tổng hợp
                decimal averageScore = 0;
                if (highestScores.Any())
                {
                    averageScore = Math.Round(highestScores.Average(er => er.Score), 2);
                }

                var summary = new
                {
                    examId = exam.Id,
                    examTitle = exam.Title,
                    totalParticipants = examResults.Select(er => er.StudentId).Distinct().Count(),
                    averageScore = averageScore,
                    lastUpdated = DateTime.UtcNow
                };

                return Ok(new
                {
                    leaderboard,
                    summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy dữ liệu bảng xếp hạng", error = ex.Message });
            }
        }
    }
}