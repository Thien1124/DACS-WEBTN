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
    public class StatisticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatisticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy tổng quan số lượng người dùng, đề thi, bài thi
        /// </summary>
        /// <returns>Thông tin tổng quan về hệ thống</returns>
        /// <response code="200">Trả về thông tin tổng quan thành công</response>
        /// <response code="401">Không có quyền truy cập</response>
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                // Đếm tổng số người dùng
                int totalUsers = await _context.Users.CountAsync();

                // Đếm số giáo viên
                int teacherCount = await _context.Users
                    .Where(u => u.Role == "Teacher")
                    .CountAsync();

                // Đếm số học sinh
                int studentCount = await _context.Users
                    .Where(u => u.Role == "Student")
                    .CountAsync();

                // Đếm tổng số đề thi
                int totalExams = await _context.Exams.CountAsync();

                // Đếm số đề thi đang hoạt động (chưa hết hạn)
                int activeExams = await _context.Exams
                    .Where(e => e.EndTime > DateTime.Now)
                    .CountAsync();

                // Đếm tổng số bài thi đã làm
                int totalExamResults = await _context.ExamResults.CountAsync();

                // Đếm số bài thi trong tháng hiện tại
                DateTime firstDayOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                int examResultsThisMonth = await _context.ExamResults
                    .Where(er => er.CompletedAt >= firstDayOfMonth)
                    .CountAsync();

                // Đếm số môn học
                int subjectCount = await _context.Subjects.CountAsync();

                // Đếm số câu hỏi
                int questionCount = await _context.Questions.CountAsync();

                // Tạo và trả về kết quả
                var result = new
                {
                    users = new
                    {
                        total = totalUsers,
                        teachers = teacherCount,
                        students = studentCount
                    },
                    exams = new
                    {
                        total = totalExams,
                        active = activeExams
                    },
                    examResults = new
                    {
                        total = totalExamResults,
                        thisMonth = examResultsThisMonth
                    },
                    subjects = subjectCount,
                    questions = questionCount,
                    timestamp = DateTime.Now
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi (nếu cần)
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy dữ liệu thống kê", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thống kê số đề thi, lượt thi, điểm trung bình theo từng môn học
        /// </summary>
        /// <returns>Danh sách thống kê theo môn học</returns>
        /// <response code="200">Trả về thông tin thống kê theo môn học thành công</response>
        /// <response code="401">Không có quyền truy cập</response>
        [HttpGet("by-subject")]
        public async Task<IActionResult> GetStatisticsBySubject()
        {
            try
            {
                // Lấy danh sách tất cả các môn học
                var subjects = await _context.Subjects.ToListAsync();

                // Lấy tất cả các đề thi và kết quả làm bài để xử lý trong bộ nhớ
                var allExams = await _context.Exams.ToListAsync();
                var allExamResults = await _context.ExamResults
                    .Where(er => er.IsCompleted) // Chỉ lấy các bài thi đã hoàn thành
                    .ToListAsync();

                // Khởi tạo danh sách kết quả
                var result = new List<object>();

                foreach (var subject in subjects)
                {
                    // Lọc các đề thi thuộc môn học hiện tại
                    var examsInSubject = allExams.Where(e => e.SubjectId == subject.Id).ToList();
                    int examCount = examsInSubject.Count;

                    // Lấy danh sách ID đề thi
                    var examIds = examsInSubject.Select(e => e.Id).ToList();

                    // Lọc các kết quả thi thuộc các đề thi của môn học
                    var subjectResults = allExamResults.Where(er => examIds.Contains(er.ExamId)).ToList();
                    int attemptCount = subjectResults.Count;

                    // Tính điểm trung bình
                    decimal averageScore = 0;
                    if (subjectResults.Any())
                    {
                        averageScore = Math.Round(subjectResults.Average(er => er.Score), 2);
                    }

                    // Thêm kết quả vào danh sách
                    result.Add(new
                    {
                        subject = new
                        {
                            id = subject.Id,
                            name = subject.Name,
                            code = subject.Code
                        },
                        examCount,
                        attemptCount,
                        averageScore
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy dữ liệu thống kê theo môn học", error = ex.Message });
            }
        }
    }
}