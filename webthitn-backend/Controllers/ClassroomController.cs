using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ExcelDataReader;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using webthitn_backend.DTOs;
using webthitn_backend.Models;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Controllers
{
    [Route("api/classrooms")]
    [ApiController]
    [Authorize(Roles = "Admin,Teacher")]
    public class ClassroomController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClassroomController> _logger;

        public ClassroomController(ApplicationDbContext context, ILogger<ClassroomController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Nhập danh sách học sinh từ file Excel
        /// </summary>
        /// <param name="file">File Excel chứa danh sách học sinh</param>
        /// <param name="classroom">Tên lớp</param>
        /// <returns>Kết quả nhập danh sách</returns>
        [HttpPost("import-students")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [RequestFormLimits(MultipartBodyLengthLimit = 10485760)] // 10MB
        [RequestSizeLimit(10485760)] // 10MB
        public async Task<IActionResult> ImportStudents(IFormFile file, [FromForm] string classroom)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Vui lòng chọn file Excel để tải lên" });
                }

                if (string.IsNullOrWhiteSpace(classroom))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Check file extension
                var fileExt = Path.GetExtension(file.FileName).ToLower();
                if (fileExt != ".xlsx" && fileExt != ".xls")
                {
                    return BadRequest(new { message = "Chỉ hỗ trợ file Excel (.xlsx, .xls)" });
                }

                // Register encoding provider for Excel reader
                Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

                // Read Excel file
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                using var reader = fileExt == ".xlsx" 
                    ? ExcelReaderFactory.CreateOpenXmlReader(stream)
                    : ExcelReaderFactory.CreateBinaryReader(stream);

                var result = reader.AsDataSet(new ExcelDataSetConfiguration
                {
                    ConfigureDataTable = _ => new ExcelDataTableConfiguration
                    {
                        UseHeaderRow = true
                    }
                });

                if (result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return BadRequest(new { message = "File Excel không có dữ liệu" });
                }

                var dataTable = result.Tables[0];

                // Display available column names for debugging
                var columnNames = new List<string>();
                for (int i = 0; i < dataTable.Columns.Count; i++)
                {
                    columnNames.Add(dataTable.Columns[i].ColumnName);
                }
                _logger.LogInformation($"Available columns: {string.Join(", ", columnNames)}");

                var successCount = 0;
                var errorCount = 0;
                var studentsAdded = new List<object>();
                var studentsUpdated = new List<object>();
                var errors = new List<string>();

                // Process each row
                foreach (DataRow row in dataTable.Rows)
                {
                    try
                    {
                        // Try to get column by name with more detailed logging
                        string username = null;
                        string fullName = null;
                        string email = null;
                        
                        // Try each possible column name for student ID
                        foreach (string colName in new[] { "MSSV", "Mã học sinh", "Username", "Mã số", "Ma hoc sinh" })
                        {
                            if (dataTable.Columns.Contains(colName))
                            {
                                username = row[colName]?.ToString();
                                _logger.LogInformation($"Found student ID column: {colName}");
                                break;
                            }
                        }
                        
                        // Try each possible column name for student name
                        foreach (string colName in new[] { "Họ và tên", "Họ tên", "Fullname", "Name", "Ho ten" })
                        {
                            if (dataTable.Columns.Contains(colName))
                            {
                                fullName = row[colName]?.ToString();
                                _logger.LogInformation($"Found name column: {colName}");
                                break;
                            }
                        }
                        
                        // Try each possible column name for email
                        if (dataTable.Columns.Contains("Email"))
                        {
                            email = row["Email"]?.ToString();
                        }
                        
                        // If we still didn't find the required columns, try using column indexes
                        if (string.IsNullOrWhiteSpace(username) && dataTable.Columns.Count >= 1)
                        {
                            username = row[0]?.ToString();
                        }
                        
                        if (string.IsNullOrWhiteSpace(fullName) && dataTable.Columns.Count >= 2)
                        {
                            fullName = row[1]?.ToString();
                        }
                        
                        if (string.IsNullOrWhiteSpace(email) && dataTable.Columns.Count >= 3)
                        {
                            email = row[2]?.ToString();
                        }

                        // Continue with existing validation and processing
                        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(fullName))
                        {
                            errors.Add($"Dòng dữ liệu thiếu thông tin: {(string.IsNullOrWhiteSpace(username) ? "Thiếu MSSV" : "")} {(string.IsNullOrWhiteSpace(fullName) ? "Thiếu Họ tên" : "")}");
                            errorCount++;
                            continue;
                        }

                        // Check if student exists
                        var existingStudent = await _context.Users
                            .FirstOrDefaultAsync(u => u.Username == username);

                        if (existingStudent != null)
                        {
                            // Update existing student
                            existingStudent.FullName = fullName;
                            existingStudent.Classroom = classroom;
                            
                            // Extract grade from classroom name
                            string grade = null;
                            if (!string.IsNullOrEmpty(classroom) && classroom.Length >= 2)
                            {
                                grade = classroom.Substring(0, 2);
                            }
                            existingStudent.Grade = grade ?? "12";
                            
                            // Set School property
                            existingStudent.School = "THPT BẢO LÂM ";//et school name
                            
                            // Make sure PhoneNumber is not null
                            if (string.IsNullOrEmpty(existingStudent.PhoneNumber))
                            {
                                existingStudent.PhoneNumber = "Chưa cập nhật";
                            }
                            
                            // Update email if provided
                            if (!string.IsNullOrEmpty(email) && existingStudent.Email != email)
                            {
                                existingStudent.Email = email;
                            }

                            _context.Users.Update(existingStudent);
                            studentsUpdated.Add(new { username, fullName, classroom });
                        }
                        else
                        {
                            // Extract grade from classroom name
                            string grade = null;
                            if (!string.IsNullOrEmpty(classroom) && classroom.Length >= 2)
                            {
                                grade = classroom.Substring(0, 2);
                            }

                            // Create new student
                            var newStudent = new User
                            {
                                Username = username,
                                FullName = fullName,
                                Email = email ?? "",
                                Classroom = classroom,
                                Grade = grade ?? "12",
                                PhoneNumber = "Chưa cập nhật",
                                School = "THPT WEBTN", // Add default school name
                                Role = "Student",
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow,
                                Password = BCrypt.Net.BCrypt.HashPassword(username)
                            };

                            _context.Users.Add(newStudent);
                            studentsAdded.Add(new { username, fullName, classroom });
                        }

                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Lỗi xử lý dữ liệu: {ex.Message}");
                        errorCount++;
                    }
                }

                try {
                    // Save changes to database
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    // Log the detailed exception
                    _logger.LogError($"Database update error: {ex.Message}");
                    _logger.LogError($"Inner exception: {ex.InnerException?.Message}");
                    
                    // Return the detailed error to help debugging
                    return StatusCode(500, new { 
                        message = "Lỗi khi lưu dữ liệu vào cơ sở dữ liệu", 
                        error = ex.Message,
                        innerError = ex.InnerException?.Message,
                        studentDetails = studentsAdded.Concat(studentsUpdated).ToList()
                    });
                }

                // Commit the transaction
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = $"Đã xử lý danh sách học sinh lớp {classroom}",
                    classroom,
                    totalProcessed = dataTable.Rows.Count,
                    successCount,
                    errorCount,
                    studentsAdded,
                    studentsUpdated,
                    errors
                });
            }
            catch (Exception ex)
            {
                // Roll back the transaction
                await transaction.RollbackAsync();
                _logger.LogError($"Transaction rolled back: {ex.Message}");
                return StatusCode(500, new { 
                    message = $"Đã xảy ra lỗi khi nhập danh sách học sinh: {ex.Message}",
                    innerError = ex.InnerException?.Message 
                });
            }
        }

        /// <summary>
        /// Lấy danh sách học sinh trong lớp
        /// </summary>
        /// <param name="classroom">Tên lớp</param>
        /// <returns>Danh sách học sinh</returns>
        [HttpGet("{classroom}/students")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetClassroomStudents(string classroom)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(classroom))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == classroom)
                    .OrderBy(u => u.Username)
                    .Select(u => new
                    {
                        id = u.Id,
                        username = u.Username,
                        fullName = u.FullName,
                        email = u.Email,
                        classroom = u.Classroom
                    })
                    .ToListAsync();

                return Ok(new
                {
                    classroom,
                    count = students.Count,
                    students
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting classroom students: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách học sinh trong lớp" });
            }
        }
    }
}