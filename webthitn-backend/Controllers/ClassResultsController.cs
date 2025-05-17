using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ClosedXML.Excel;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.Extensions.Logging;
using webthitn_backend.Data; // Make sure this namespace is correctly pointing to your DbContext
using webthitn_backend.DTOs;
using webthitn_backend.Models; // Add this for your entity models

namespace webthitn_backend.Controllers
{
    [Route("api/class-results")]
    [ApiController]
    [Authorize(Roles = "Teacher,Admin")]
    public class ClassResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClassResultsController> _logger;

        public ClassResultsController(ApplicationDbContext context, ILogger<ClassResultsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get exam results for a classroom
        /// </summary>
        [HttpGet("{classroom}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetClassResults(string classroom, [FromQuery] int? examId = null)
        {
            try
            {
                // Validate classroom name
                if (string.IsNullOrEmpty(classroom))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Check if teacher has access to this classroom
                bool isAdmin = User.IsInRole("Admin");
                int currentUserId = GetCurrentUserId();

                if (!isAdmin)
                {
                    bool hasAccess = await _context.OfficialExams
                        .AnyAsync(oe => oe.ClassroomName == classroom && oe.CreatorId == currentUserId);

                    if (!hasAccess)
                    {
                        return Forbid();
                    }
                }

                // Get students in this classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == classroom)
                    .Select(s => new { s.Id, s.Username, s.FullName })
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy học sinh nào trong lớp {classroom}" });
                }

                // Get exam results
                var query = _context.ExamResults
                    .Include(er => er.Student)
                    .Include(er => er.Exam)
                    .Where(er => er.Student.Classroom == classroom);

                // Filter by exam if specified
                if (examId.HasValue)
                {
                    query = query.Where(er => er.ExamId == examId.Value);
                }

                var results = await query
                    .OrderBy(er => er.Student.Username)
                    .ThenBy(er => er.ExamId)
                    .Select(er => new
                    {
                        er.Id,
                        er.ExamId,
                        ExamTitle = er.Exam.Title,
                        er.StudentId,
                        StudentName = er.Student.FullName,
                        StudentUsername = er.Student.Username,
                        er.Score,
                        er.PercentageScore,
                        er.IsPassed,
                        er.CorrectAnswers,
                        er.TotalQuestions,
                        er.StartedAt,
                        er.CompletedAt
                    })
                    .ToListAsync();

                // Group results by exam
                var examResults = results
                    .GroupBy(r => new { r.ExamId, r.ExamTitle })
                    .Select(g => new
                    {
                        examId = g.Key.ExamId,
                        examTitle = g.Key.ExamTitle,
                        averageScore = g.Average(r => r.Score),
                        passedCount = g.Count(r => r.IsPassed),
                        failedCount = g.Count(r => !r.IsPassed),
                        totalStudents = g.Count(),
                        results = g.ToList()
                    })
                    .ToList();

                // Calculate classroom overall statistics
                var overallStats = new
                {
                    totalExams = examResults.Count,
                    totalResults = results.Count,
                    averageScore = results.Any() ? results.Average(r => r.Score) : 0,
                    bestStudentId = results.GroupBy(r => r.StudentId)
                        .OrderByDescending(g => g.Average(r => r.Score))
                        .FirstOrDefault()?.Key,
                    bestStudentName = results.GroupBy(r => r.StudentId)
                        .OrderByDescending(g => g.Average(r => r.Score))
                        .FirstOrDefault()?.First().StudentName
                };

                return Ok(new
                {
                    classroom,
                    totalStudents = students.Count,
                    statistics = overallStats,
                    exams = examResults
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting class results: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy kết quả lớp học" });
            }
        }

        /// <summary>
        /// Export class results to Excel
        /// </summary>
        [HttpGet("{classroom}/export/excel")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ExportToExcel(string classroom, [FromQuery] int? examId = null)
        {
            try
            {
                // Check if teacher has access to this classroom
                bool isAdmin = User.IsInRole("Admin");
                int currentUserId = GetCurrentUserId();

                if (!isAdmin)
                {
                    bool hasAccess = await _context.OfficialExams
                        .AnyAsync(oe => oe.ClassroomName == classroom && oe.CreatorId == currentUserId);

                    if (!hasAccess)
                    {
                        return Forbid();
                    }
                }

                // Get all students in the classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == classroom)
                    .OrderBy(u => u.Username)
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy học sinh nào trong lớp {classroom}" });
                }

                // Get exam results
                var query = _context.ExamResults
                    .Include(er => er.Student)
                    .Include(er => er.Exam)
                    .Where(er => er.Student.Classroom == classroom);

                // Filter by exam if specified
                if (examId.HasValue)
                {
                    query = query.Where(er => er.ExamId == examId.Value);
                }

                var results = await query
                    .OrderBy(er => er.Student.Username)
                    .ThenBy(er => er.ExamId)
                    .ToListAsync();

                using (var workbook = new XLWorkbook())
                {
                    // Create a worksheet
                    var worksheet = workbook.Worksheets.Add($"Lớp {classroom}");

                    // Set headers
                    worksheet.Cell(1, 1).Value = "STT";
                    worksheet.Cell(1, 2).Value = "MSSV";
                    worksheet.Cell(1, 3).Value = "Họ và tên";
                    worksheet.Cell(1, 4).Value = "Tên bài thi";
                    worksheet.Cell(1, 5).Value = "Điểm số";
                    worksheet.Cell(1, 6).Value = "Đạt/Không đạt";
                    worksheet.Cell(1, 7).Value = "Số câu đúng";
                    worksheet.Cell(1, 8).Value = "Tổng số câu";
                    worksheet.Cell(1, 9).Value = "Thời gian làm bài";
                    worksheet.Cell(1, 10).Value = "Ngày thi";

                    // Format header
                    var headerRow = worksheet.Row(1);
                    headerRow.Style.Font.Bold = true;
                    headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;
                    headerRow.Height = 20;

                    // Fill data
                    int row = 2;
                    foreach (var result in results)
                    {
                        worksheet.Cell(row, 1).Value = row - 1; // STT
                        worksheet.Cell(row, 2).Value = result.Student.Username;
                        worksheet.Cell(row, 3).Value = result.Student.FullName;
                        worksheet.Cell(row, 4).Value = result.Exam.Title;
                        worksheet.Cell(row, 5).Value = result.Score;
                        worksheet.Cell(row, 6).Value = result.IsPassed ? "Đạt" : "Không đạt";
                        worksheet.Cell(row, 7).Value = result.CorrectAnswers;
                        worksheet.Cell(row, 8).Value = result.TotalQuestions;
                        
                        // Calculate duration
                        var duration = result.CompletedAt.HasValue
                            ? (int)(result.CompletedAt.Value - result.StartedAt).TotalMinutes
                            : 0;
                        worksheet.Cell(row, 9).Value = $"{duration} phút";
                        
                        // Format date
                        worksheet.Cell(row, 10).Value = result.StartedAt.ToString("dd/MM/yyyy HH:mm");

                        // Formatting
                        if (result.IsPassed)
                            worksheet.Cell(row, 6).Style.Font.FontColor = XLColor.Green;
                        else
                            worksheet.Cell(row, 6).Style.Font.FontColor = XLColor.Red;
                        
                        row++;
                    }

                    // Format table
                    worksheet.Columns().AdjustToContents();
                    var table = worksheet.Range(1, 1, row - 1, 10);
                    table.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
                    table.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

                    // Save to memory stream
                    var stream = new MemoryStream();
                    workbook.SaveAs(stream);
                    stream.Position = 0;

                    // Create filename with timestamp
                    string fileName = examId.HasValue
                        ? $"Kết_quả_lớp_{classroom}_bài_thi_{examId.Value}_{DateTime.Now:yyyyMMdd}.xlsx"
                        : $"Kết_quả_lớp_{classroom}_{DateTime.Now:yyyyMMdd}.xlsx";

                    return File(
                        stream,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        fileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting class results to Excel: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xuất kết quả ra Excel" });
            }
        }

        /// <summary>
        /// Export class results to PDF
        /// </summary>
        [HttpGet("{classroom}/export/pdf")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ExportToPdf(string classroom, [FromQuery] int? examId = null)
        {
            try
            {
                // Check if teacher has access to this classroom
                bool isAdmin = User.IsInRole("Admin");
                int currentUserId = GetCurrentUserId();

                if (!isAdmin)
                {
                    bool hasAccess = await _context.OfficialExams
                        .AnyAsync(oe => oe.ClassroomName == classroom && oe.CreatorId == currentUserId);

                    if (!hasAccess)
                    {
                        return Forbid();
                    }
                }

                // Get all students in the classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == classroom)
                    .OrderBy(u => u.Username)
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy học sinh nào trong lớp {classroom}" });
                }

                // Get exam results
                var query = _context.ExamResults
                    .Include(er => er.Student)
                    .Include(er => er.Exam)
                    .Where(er => er.Student.Classroom == classroom);

                // Filter by exam if specified
                if (examId.HasValue)
                {
                    query = query.Where(er => er.ExamId == examId.Value);
                }

                var results = await query
                    .OrderBy(er => er.Student.Username)
                    .ThenBy(er => er.ExamId)
                    .ToListAsync();

                using (var stream = new MemoryStream())
                {
                    var document = new Document(PageSize.A4.Rotate(), 10f, 10f, 10f, 10f);
                    var writer = PdfWriter.GetInstance(document, stream);
                    
                    document.Open();
                    
                    // Add title
                    var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
                    var title = examId.HasValue
                        ? $"Kết Quả Thi Lớp {classroom} - Bài Thi #{examId.Value}"
                        : $"Kết Quả Thi Lớp {classroom}";
                        
                    var titleParagraph = new Paragraph(title, titleFont)
                    {
                        Alignment = Element.ALIGN_CENTER,
                        SpacingAfter = 20f
                    };
                    document.Add(titleParagraph);
                    
                    // Add date
                    var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);
                    var dateParagraph = new Paragraph($"Ngày xuất báo cáo: {DateTime.Now:dd/MM/yyyy HH:mm}", dateFont)
                    {
                        Alignment = Element.ALIGN_RIGHT,
                        SpacingAfter = 20f
                    };
                    document.Add(dateParagraph);

                    // Create table
                    var table = new PdfPTable(9) { WidthPercentage = 100 };
                    float[] widths = { 5f, 10f, 20f, 20f, 8f, 10f, 8f, 8f, 11f };
                    table.SetWidths(widths);
                    
                    // Add header
                    var cellFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
                    AddCell(table, "STT", cellFont);
                    AddCell(table, "MSSV", cellFont);
                    AddCell(table, "Họ và tên", cellFont);
                    AddCell(table, "Tên bài thi", cellFont);
                    AddCell(table, "Điểm số", cellFont);
                    AddCell(table, "Đạt/Không đạt", cellFont);
                    AddCell(table, "Số câu đúng", cellFont);
                    AddCell(table, "Tổng câu", cellFont);
                    AddCell(table, "Ngày thi", cellFont);

                    // Add data rows
                    var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);
                    for (int i = 0; i < results.Count; i++)
                    {
                        var result = results[i];
                        
                        AddCell(table, (i + 1).ToString(), normalFont);
                        AddCell(table, result.Student.Username, normalFont);
                        AddCell(table, result.Student.FullName, normalFont);
                        AddCell(table, result.Exam.Title, normalFont);
                        AddCell(table, result.Score.ToString("F2"), normalFont);
                        
                        // Format passed status
                        var passedCell = new PdfPCell(new Phrase(result.IsPassed ? "Đạt" : "Không đạt", normalFont));
                        passedCell.HorizontalAlignment = Element.ALIGN_CENTER;
                        passedCell.BackgroundColor = result.IsPassed ? new BaseColor(230, 255, 230) : new BaseColor(255, 230, 230);
                        table.AddCell(passedCell);
                        
                        AddCell(table, result.CorrectAnswers.ToString(), normalFont);
                        AddCell(table, result.TotalQuestions.ToString(), normalFont);
                        AddCell(table, result.StartedAt.ToString("dd/MM/yyyy"), normalFont);
                    }

                    document.Add(table);
                    
                    // Add summary
                    var summaryFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
                    document.Add(new Paragraph("\nTổng kết:", summaryFont));
                    
                    var summaryTable = new PdfPTable(2) { WidthPercentage = 50 };
                    summaryTable.SpacingBefore = 10f;
                    
                    AddCell(summaryTable, "Số lượng học sinh:", normalFont);
                    AddCell(summaryTable, students.Count.ToString(), normalFont);
                    
                    AddCell(summaryTable, "Số bài thi:", normalFont);
                    AddCell(summaryTable, results.Select(r => r.ExamId).Distinct().Count().ToString(), normalFont);
                    
                    AddCell(summaryTable, "Số lượng kết quả:", normalFont);
                    AddCell(summaryTable, results.Count.ToString(), normalFont);
                    
                    AddCell(summaryTable, "Điểm trung bình:", normalFont);
                    AddCell(summaryTable, results.Any() 
                        ? results.Average(r => r.Score).ToString("F2") 
                        : "0", normalFont);
                    
                    AddCell(summaryTable, "Tỉ lệ đạt:", normalFont);
                    AddCell(summaryTable, results.Any()
                        ? $"{(double)results.Count(r => r.IsPassed) / results.Count * 100:F2}%"
                        : "0%", normalFont);
                    
                    document.Add(summaryTable);
                    
                    // Add footer
                    var footer = new Paragraph("© WEBTHITN - Hệ thống thi trắc nghiệm trực tuyến", 
                        FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 8))
                    {
                        Alignment = Element.ALIGN_CENTER,
                        SpacingBefore = 30f
                    };
                    document.Add(footer);
                    
                    document.Close();
                    
                    // Create filename with timestamp
                    string fileName = examId.HasValue
                        ? $"Kết_quả_lớp_{classroom}_bài_thi_{examId.Value}_{DateTime.Now:yyyyMMdd}.pdf"
                        : $"Kết_quả_lớp_{classroom}_{DateTime.Now:yyyyMMdd}.pdf";
                    
                    return File(
                        stream.ToArray(),
                        "application/pdf",
                        fileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting class results to PDF: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xuất kết quả ra PDF" });
            }
        }

        private void AddCell(PdfPTable table, string text, iTextSharp.text.Font font)
        {
            var cell = new PdfPCell(new Phrase(text, font))
            {
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 5
            };
            table.AddCell(cell);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Invalid user ID claim");
        }
    }
}