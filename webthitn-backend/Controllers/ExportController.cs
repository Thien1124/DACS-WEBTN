using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using webthitn_backend.Models;
using WEBTHITN_Backend.Helpers;

namespace webthitn_backend.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize(Roles = "Admin,Teacher")]
    public class ExportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExportController> _logger;

        public ExportController(ApplicationDbContext context, ILogger<ExportController> logger)
        {
            _context = context;
            _logger = logger;
            // Đăng ký giấy phép EPPlus
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        /// <summary>
        /// Xuất danh sách học sinh theo lớp
        /// </summary>
        /// <param name="request">Thông tin yêu cầu xuất danh sách</param>
        /// <returns>File Excel chứa danh sách học sinh</returns>
        [HttpPost("students/export")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ExportStudentsList([FromBody] ExportStudentsRequest request)
        {
            try
            {
                _logger.LogInformation($"Xuất danh sách học sinh: ClassroomName={request.ClassroomName}");

                if (string.IsNullOrEmpty(request.ClassroomName))
                {
                    return BadRequest(new { message = "Tên lớp học không được để trống" });
                }

                // Lấy danh sách học sinh - Chỉ dùng các trường cơ bản chắc chắn tồn tại
                var students = await _context.Users
                    .Where(u => u.Role == "Student"
                        && !u.Username.Contains("CLASS")
                        && u.Classroom == request.ClassroomName)
                    .OrderBy(u => u.Username)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.FullName,
                        u.CreatedAt
                    })
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy học sinh nào" });
                }

                // Tạo file Excel
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add($"Danh sách lớp {request.ClassroomName}");

                // Tạo tiêu đề
                worksheet.Cells[1, 1].Value = $"DANH SÁCH HỌC SINH LỚP {request.ClassroomName.ToUpper()}";
                using (var range = worksheet.Cells[1, 1, 1, 5]) // Giảm số cột xuống 5
                {
                    range.Merge = true;
                    range.Style.Font.Bold = true;
                    range.Style.Font.Size = 14;
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                // Ngày xuất báo cáo
                worksheet.Cells[2, 1].Value = $"Ngày xuất: {DateTimeHelper.GetVietnamNow():dd/MM/yyyy HH:mm:ss}";
                using (var range = worksheet.Cells[2, 1, 2, 5]) // Giảm số cột xuống 5
                {
                    range.Merge = true;
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                // Thêm tiêu đề cột
                string[] headers = { "STT", "Mã học sinh", "Họ và tên", "Email", "Ngày tạo" }; // Chỉ giữ các cột cơ bản
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[4, i + 1].Value = headers[i];
                    worksheet.Cells[4, i + 1].Style.Font.Bold = true;
                    worksheet.Cells[4, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[4, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                    worksheet.Cells[4, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    worksheet.Cells[4, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                // Thêm dữ liệu
                for (int i = 0; i < students.Count; i++)
                {
                    var student = students[i];
                    int row = i + 5;

                    worksheet.Cells[row, 1].Value = i + 1;
                    worksheet.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells[row, 2].Value = student.Username;

                    worksheet.Cells[row, 3].Value = student.FullName;

                    worksheet.Cells[row, 4].Value = student.Email;

                    worksheet.Cells[row, 5].Value = student.CreatedAt.ToString("dd/MM/yyyy");
                    worksheet.Cells[row, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Thêm viền cho các ô
                    for (int j = 1; j <= 5; j++) // Giảm số cột xuống 5
                    {
                        worksheet.Cells[row, j].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    }
                }

                // Thiết lập độ rộng cột tự động
                worksheet.Cells.AutoFitColumns();

                // Tạo file Excel
                var excelData = package.GetAsByteArray();
                var fileName = $"DanhSachHocSinh_{request.ClassroomName}_{DateTime.Now:yyyyMMdd}.xlsx";

                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting students list: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xuất danh sách học sinh" });
            }
        }

        /// <summary>
        /// Xuất bảng điểm theo kỳ thi
        /// </summary>
        /// <param name="request">Thông tin yêu cầu xuất bảng điểm</param>
        /// <returns>File Excel chứa bảng điểm</returns>
        [HttpPost("scores/export")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ExportScores([FromBody] ExportScoresRequest request)
        {
            try
            {
                _logger.LogInformation($"Xuất bảng điểm kỳ thi ID: {request.OfficialExamId}");

                if (request.OfficialExamId <= 0)
                {
                    return BadRequest(new { message = "ID kỳ thi không hợp lệ" });
                }

                // Lấy thông tin kỳ thi
                var officialExam = await _context.OfficialExams
                    .Include(oe => oe.Exam)
                    .ThenInclude(e => e.Subject)
                    .FirstOrDefaultAsync(oe => oe.Id == request.OfficialExamId);

                if (officialExam == null)
                {
                    return NotFound(new { message = "Không tìm thấy kỳ thi" });
                }

                // Lấy thông tin học sinh và điểm số
                var students = await _context.OfficialExamStudents
                    .Include(oes => oes.Student)
                    .Include(oes => oes.ExamResult)
                    .Where(oes => oes.OfficialExamId == request.OfficialExamId
                     && !oes.Student.Username.Contains("CLASS"))
                    .OrderBy(oes => oes.Student.Username)
                    .ToListAsync();

                // Tạo file Excel
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add($"Bảng điểm {officialExam.Title}");

                // Tạo tiêu đề
                worksheet.Cells[1, 1].Value = $"BẢNG ĐIỂM KỲ THI: {officialExam.Title.ToUpper()}";
                using (var range = worksheet.Cells[1, 1, 1, 8])
                {
                    range.Merge = true;
                    range.Style.Font.Bold = true;
                    range.Style.Font.Size = 14;
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                // Thông tin kỳ thi
                int row = 2;
                worksheet.Cells[row, 1].Value = $"Môn học: {officialExam.Exam?.Subject?.Name ?? "N/A"}";
                using (var range = worksheet.Cells[row, 1, row, 8])
                {
                    range.Merge = true;
                }
                row++;

                worksheet.Cells[row, 1].Value = $"Lớp học: {officialExam.ClassroomName ?? "Tất cả lớp"}";
                using (var range = worksheet.Cells[row, 1, row, 8])
                {
                    range.Merge = true;
                }
                row++;

                var startTime = officialExam.StartTime.HasValue
                    ? officialExam.StartTime.Value.ToString("dd/MM/yyyy HH:mm")
                    : "N/A";
                var endTime = officialExam.EndTime.HasValue
                    ? officialExam.EndTime.Value.ToString("dd/MM/yyyy HH:mm")
                    : "N/A";
                worksheet.Cells[row, 1].Value = $"Thời gian thi: {startTime} - {endTime}";
                using (var range = worksheet.Cells[row, 1, row, 8])
                {
                    range.Merge = true;
                }
                row++;

                // Sửa phép so sánh để tránh lỗi "Operator '<' cannot be applied to operands of type 'int' and 'method group'"
                double passScore = 0;
                double totalScore = 0;

                if (officialExam.Exam != null)
                {
                    passScore = Convert.ToDouble(officialExam.Exam.PassScore);
                    totalScore = Convert.ToDouble(officialExam.Exam.TotalScore);
                }

                worksheet.Cells[row, 1].Value = $"Điểm đạt: {passScore}/{totalScore}";
                using (var range = worksheet.Cells[row, 1, row, 8])
                {
                    range.Merge = true;
                }
                row++;

                worksheet.Cells[row, 1].Value = $"Ngày xuất: {DateTimeHelper.GetVietnamNow():dd/MM/yyyy HH:mm:ss}";
                using (var range = worksheet.Cells[row, 1, row, 8])
                {
                    range.Merge = true;
                }
                row += 2;

                // Thêm tiêu đề cột
                string[] headers = { "STT", "Mã học sinh", "Họ và tên", "Đã làm bài", "Điểm", "Tỷ lệ %", "Kết quả", "Ngày làm bài" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[row, i + 1].Value = headers[i];
                    worksheet.Cells[row, i + 1].Style.Font.Bold = true;
                    worksheet.Cells[row, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[row, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                    worksheet.Cells[row, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    worksheet.Cells[row, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }
                row++;

                // Thêm dữ liệu
                for (int i = 0; i < students.Count; i++)
                {
                    var student = students[i];

                    worksheet.Cells[row, 1].Value = i + 1;
                    worksheet.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells[row, 2].Value = student.Student?.Username;

                    worksheet.Cells[row, 3].Value = student.Student?.FullName;

                    worksheet.Cells[row, 4].Value = student.HasTaken ? "Đã làm" : "Chưa làm";
                    worksheet.Cells[row, 4].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    if (student.ExamResult != null)
                    {
                        // Điểm số
                        double score = Convert.ToDouble(student.ExamResult.Score);
                        worksheet.Cells[row, 5].Value = score;
                        worksheet.Cells[row, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        // Tỷ lệ phần trăm
                        double percentage = Convert.ToDouble(student.ExamResult.PercentageScore);
                        worksheet.Cells[row, 6].Value = percentage;
                        worksheet.Cells[row, 6].Style.Numberformat.Format = "0.00%";
                        worksheet.Cells[row, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        // Kết quả đạt/không đạt
                        string result = student.ExamResult.IsPassed ? "Đạt" : "Không đạt";
                        worksheet.Cells[row, 7].Value = result;
                        worksheet.Cells[row, 7].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        if (student.ExamResult.IsPassed)
                        {
                            worksheet.Cells[row, 7].Style.Font.Color.SetColor(System.Drawing.Color.Green);
                        }
                        else
                        {
                            worksheet.Cells[row, 7].Style.Font.Color.SetColor(System.Drawing.Color.Red);
                        }

                        // Ngày làm bài
                        if (student.ExamResult.CompletedAt.HasValue)
                        {
                            worksheet.Cells[row, 8].Value = student.ExamResult.CompletedAt.Value.ToString("dd/MM/yyyy HH:mm");
                            worksheet.Cells[row, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        }
                    }
                    else
                    {
                        worksheet.Cells[row, 5].Value = "N/A";
                        worksheet.Cells[row, 6].Value = "N/A";
                        worksheet.Cells[row, 7].Value = "N/A";
                        worksheet.Cells[row, 8].Value = "N/A";
                    }

                    // Thêm viền cho các ô
                    for (int j = 1; j <= 8; j++)
                    {
                        worksheet.Cells[row, j].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    }

                    row++;
                }

                // Thêm thông tin thống kê
                row += 2;
                var totalStudents = students.Count;
                var completedCount = students.Count(s => s.HasTaken);
                var passedCount = students.Count(s => s.HasTaken && s.ExamResult != null && s.ExamResult.IsPassed == true);

                double completionRate = totalStudents > 0
                    ? Math.Round((double)completedCount / totalStudents * 100, 2)
                    : 0;

                double passRate = completedCount > 0
                    ? Math.Round((double)passedCount / completedCount * 100, 2)
                    : 0;

                worksheet.Cells[row, 1].Value = "THỐNG KÊ TỔNG QUAN";
                using (var range = worksheet.Cells[row, 1, row, 8])
                {
                    range.Merge = true;
                    range.Style.Font.Bold = true;
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }
                row++;

                worksheet.Cells[row, 1].Value = $"Tổng số học sinh: {totalStudents}";
                using (var range = worksheet.Cells[row, 1, row, 4])
                {
                    range.Merge = true;
                }
                worksheet.Cells[row, 5].Value = $"Số học sinh đã làm bài: {completedCount} ({completionRate}%)";
                using (var range = worksheet.Cells[row, 5, row, 8])
                {
                    range.Merge = true;
                }
                row++;

                worksheet.Cells[row, 1].Value = $"Số học sinh đạt: {passedCount}";
                using (var range = worksheet.Cells[row, 1, row, 4])
                {
                    range.Merge = true;
                }
                worksheet.Cells[row, 5].Value = $"Tỷ lệ đạt: {passRate}%";
                using (var range = worksheet.Cells[row, 5, row, 8])
                {
                    range.Merge = true;
                }

                // Thiết lập độ rộng cột tự động
                worksheet.Cells.AutoFitColumns();

                // Tạo file Excel
                var excelData = package.GetAsByteArray();
                var fileName = $"BangDiem_{officialExam.Title.Replace(" ", "_")}_{DateTime.Now:yyyyMMdd}.xlsx";

                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting scores: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xuất bảng điểm" });
            }
        }
    }

    public class ExportStudentsRequest
    {
        public string ClassroomName { get; set; }
    }

    public class ExportScoresRequest
    {
        public int OfficialExamId { get; set; }
    }
}