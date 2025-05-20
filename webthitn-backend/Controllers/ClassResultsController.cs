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
using webthitn_backend.Data;
using webthitn_backend.DTOs;
using webthitn_backend.Models;

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
                bool isTeacher = User.IsInRole("Teacher");
                int currentUserId = GetCurrentUserId();
                
                if (currentUserId <= 0)
                {
                    return StatusCode(401, new { message = "Không thể xác định người dùng hiện tại" });
                }

                // Allow access for both Admin and Teacher roles
                if (!isAdmin && !isTeacher)
                {
                    return Forbid();
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
                    .Where(er => er.Student != null && er.Student.Classroom == classroom);

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
                        ExamTitle = er.Exam != null ? er.Exam.Title : "Unknown",
                        er.StudentId,
                        StudentName = er.Student != null ? er.Student.FullName : "Unknown",
                        StudentUsername = er.Student != null ? er.Student.Username : "Unknown",
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
                _logger.LogError($"Error getting class results: {ex.Message}. Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy kết quả lớp học", error = ex.Message });
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
                bool isTeacher = User.IsInRole("Teacher");
                int currentUserId = GetCurrentUserId();
                
                if (currentUserId <= 0)
                {
                    return StatusCode(401, new { message = "Không thể xác định người dùng hiện tại" });
                }

                // Allow access for both Admin and Teacher roles
                if (!isAdmin && !isTeacher)
                {
                    return Forbid();
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
                    .Where(er => er.Student != null && er.Student.Classroom == classroom);

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
                        try
                        {
                            worksheet.Cell(row, 1).Value = row - 1; // STT
                            worksheet.Cell(row, 2).Value = result.Student?.Username ?? "N/A";
                            worksheet.Cell(row, 3).Value = result.Student?.FullName ?? "N/A";
                            worksheet.Cell(row, 4).Value = result.Exam?.Title ?? "N/A";
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
                        catch (Exception ex)
                        {
                            _logger.LogWarning($"Error processing row for result {result.Id}: {ex.Message}");
                            // Continue with next result
                        }
                    }

                    // Format table
                    worksheet.Columns().AdjustToContents();
                    if (row > 1) // Only if we have data
                    {
                        var table = worksheet.Range(1, 1, row - 1, 10);
                        table.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
                        table.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                    }

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
                _logger.LogError($"Error exporting class results to Excel: {ex.Message}. Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xuất kết quả ra Excel", error = ex.Message });
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
                bool isTeacher = User.IsInRole("Teacher");
                int currentUserId = GetCurrentUserId();
                
                if (currentUserId <= 0)
                {
                    return StatusCode(401, new { message = "Không thể xác định người dùng hiện tại" });
                }

                // Allow access for both Admin and Teacher roles
                if (!isAdmin && !isTeacher)
                {
                    return Forbid();
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
                    .Where(er => er.Student != null && er.Student.Classroom == classroom);

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
                    
                    // Register Vietnamese font from Windows fonts
                    string fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "times.ttf");
                    BaseFont baseFont = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    
                    // Create font styles
                    Font normalFont = new Font(baseFont, 10, Font.NORMAL);
                    Font boldFont = new Font(baseFont, 10, Font.BOLD);
                    Font titleFont = new Font(baseFont, 16, Font.BOLD);
                    Font footerFont = new Font(baseFont, 8, Font.ITALIC);
                    
                    document.Open();
                    
                    // Add title
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
                    var dateParagraph = new Paragraph($"Ngày xuất báo cáo: {DateTime.Now:dd/MM/yyyy HH:mm}", normalFont)
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
                    AddCell(table, "STT", boldFont);
                    AddCell(table, "MSSV", boldFont);
                    AddCell(table, "Họ và tên", boldFont);
                    AddCell(table, "Tên bài thi", boldFont);
                    AddCell(table, "Điểm số", boldFont);
                    AddCell(table, "Đạt/Không đạt", boldFont);
                    AddCell(table, "Số câu đúng", boldFont);
                    AddCell(table, "Tổng câu", boldFont);
                    AddCell(table, "Ngày thi", boldFont);

                    // Add data rows
                    for (int i = 0; i < results.Count; i++)
                    {
                        var result = results[i];
                        try
                        {
                            AddCell(table, (i + 1).ToString(), normalFont);
                            AddCell(table, result.Student?.Username ?? "N/A", normalFont);
                            AddCell(table, result.Student?.FullName ?? "N/A", normalFont);
                            AddCell(table, result.Exam?.Title ?? "N/A", normalFont);
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
                        catch (Exception ex)
                        {
                            _logger.LogWarning($"Error processing PDF row for result {result.Id}: {ex.Message}");
                            // Continue with next result
                        }
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
                        footerFont)
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
                _logger.LogError($"Error exporting class results to PDF: {ex.Message}. Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xuất kết quả ra PDF", error = ex.Message });
            }
        }

        private void AddCell(PdfPTable table, string text, Font font)
        {
            var cell = new PdfPCell(new Phrase(text ?? "N/A", font))
            {
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 5
            };
            table.AddCell(cell);
        }

        private int GetCurrentUserId()
        {
            try
            {
                // Based on the logs, we can see the claim is actually named exactly "userId"
                var userIdClaim = User.FindFirst("userId");
                
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    return userId;
                }
                
                // As a fallback, try standard claim
                var standardClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (standardClaim != null && int.TryParse(standardClaim.Value, out userId))
                {
                    return userId;
                }
                
                // Log all claims to help diagnose the issue
                _logger.LogWarning("Could not find valid user ID claim. Available claims:");
                foreach (var claim in User.Claims)
                {
                    _logger.LogWarning($"  Claim: {claim.Type} = {claim.Value}");
                }
                
                return -1; // Return -1 instead of throwing exception
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetCurrentUserId: {ex.Message}");
                return -1;
            }
        }
    }
}