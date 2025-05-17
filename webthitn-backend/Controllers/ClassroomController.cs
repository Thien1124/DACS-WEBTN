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
using webthitn_backend.Helpers;

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
        /// Lấy danh sách tất cả các lớp học
        /// </summary>
        /// <returns>Danh sách tất cả các lớp học</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllClassrooms()
        {
            try
            {
                // Group classrooms by grade
                var classroomsByGrade = await _context.Users
                    .Where(u => u.Role == "Student" && !string.IsNullOrEmpty(u.Classroom))
                    .GroupBy(u => u.Grade)
                    .Select(g => new
                    {
                        grade = g.Key,
                        classrooms = g.Select(u => u.Classroom)
                                      .Distinct()
                                      .OrderBy(c => c)
                                      .ToList()
                    })
                    .OrderBy(g => g.grade)
                    .ToListAsync();

                // Get student count per classroom
                var studentCountsByClassroom = await _context.Users
                    .Where(u => u.Role == "Student" && !string.IsNullOrEmpty(u.Classroom))
                    .GroupBy(u => u.Classroom)
                    .Select(g => new
                    {
                        classroom = g.Key,
                        studentCount = g.Count()
                    })
                    .ToDictionaryAsync(x => x.classroom, x => x.studentCount);

                // Create detailed result
                var result = classroomsByGrade.Select(g => new
                {
                    grade = g.grade,
                    classroomCount = g.classrooms.Count,
                    classrooms = g.classrooms.Select(c => new
                    {
                        name = c,
                        studentCount = studentCountsByClassroom.ContainsKey(c) ? studentCountsByClassroom[c] : 0
                    }).ToList()
                }).ToList();

                return Ok(new
                {
                    totalGrades = result.Count,
                    totalClassrooms = result.Sum(g => g.classroomCount),
                    grades = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting all classrooms: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách lớp học" });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết của một lớp học
        /// </summary>
        /// <param name="classroom">Tên lớp học</param>
        /// <returns>Thông tin chi tiết của lớp học</returns>
        [HttpGet("{classroom}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetClassroomDetails(string classroom)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(classroom))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Get students in the classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == classroom)
                    .OrderBy(u => u.Username)
                    .ToListAsync();

                if (students.Count == 0)
                {
                    return NotFound(new { message = $"Không tìm thấy lớp học {classroom}" });
                }

                // Get grade from first student
                string grade = students.First().Grade;

                return Ok(new
                {
                    name = classroom,
                    grade = grade,
                    studentCount = students.Count,
                    school = students.First().School
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting classroom details: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin chi tiết lớp học" });
            }
        }

        /// <summary>
        /// Tạo lớp học mới
        /// </summary>
        /// <param name="model">Thông tin lớp học mới</param>
        /// <returns>Thông tin lớp học đã tạo</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateClassroom([FromBody] CreateClassroomDTO model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                if (string.IsNullOrWhiteSpace(model.Grade))
                {
                    return BadRequest(new { message = "Khối lớp không được để trống" });
                }

                // Check if classroom exists
                var existingStudents = await _context.Users
                    .AnyAsync(u => u.Classroom == model.Name);

                if (existingStudents)
                {
                    return BadRequest(new { message = $"Lớp học {model.Name} đã tồn tại" });
                }

                // Create a demo student to represent the classroom
                // This is a temporary approach until we create a proper Classroom entity
                var demoStudent = new User
                {
                    Username = $"demo_{model.Name.ToLower().Replace(" ", "_")}",
                    FullName = $"Demo {model.Name}",
                    Email = "",
                    Classroom = model.Name,
                    Grade = model.Grade,
                    PhoneNumber = "Chưa cập nhật",
                    School = model.School ?? "THPT WEBTN",
                    Role = "Student",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Password = BCrypt.Net.BCrypt.HashPassword("demo12345")
                };

                _context.Users.Add(demoStudent);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetClassroomDetails), new { classroom = model.Name }, new
                {
                    name = model.Name,
                    grade = model.Grade,
                    school = model.School ?? "THPT WEBTN",
                    message = $"Đã tạo lớp học {model.Name} thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating classroom: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo lớp học mới" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin lớp học
        /// </summary>
        /// <param name="classroom">Tên lớp học cần cập nhật</param>
        /// <param name="model">Thông tin cập nhật</param>
        /// <returns>Thông tin lớp học sau khi cập nhật</returns>
        [HttpPut("{classroom}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateClassroom(string classroom, [FromBody] UpdateClassroomDTO model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(classroom))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Find all students in the classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == classroom)
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy lớp học {classroom}" });
                }

                // Update student information with new classroom details
                foreach (var student in students)
                {
                    if (!string.IsNullOrEmpty(model.NewName))
                    {
                        student.Classroom = model.NewName;
                    }

                    if (!string.IsNullOrEmpty(model.Grade))
                    {
                        student.Grade = model.Grade;
                    }

                    if (!string.IsNullOrEmpty(model.School))
                    {
                        student.School = model.School;
                    }
                }

                _context.Users.UpdateRange(students);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Đã cập nhật thông tin lớp học {classroom} thành công",
                    originalName = classroom,
                    newName = model.NewName ?? classroom,
                    grade = model.Grade,
                    school = model.School,
                    studentCount = students.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating classroom: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật lớp học" });
            }
        }

        /// <summary>
        /// Xóa lớp học và tất cả học sinh trong lớp
        /// </summary>
        /// <param name="classroom">Tên lớp học cần xóa</param>
        /// <returns>Kết quả xóa lớp học</returns>
        [HttpDelete("{classroom}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = "Admin")] // Only Admin can delete classrooms
        public async Task<IActionResult> DeleteClassroom(string classroom)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(classroom))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Find all students in the classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == classroom)
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy lớp học {classroom}" });
                }

                // Option 1: Delete all students in classroom
                _context.Users.RemoveRange(students);

                // Option 2: Set classroom to null (alternative approach)
                // foreach (var student in students)
                // {
                //     student.Classroom = null;
                // }
                // _context.Users.UpdateRange(students);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Đã xóa lớp học {classroom} thành công",
                    deletedStudentCount = students.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting classroom: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa lớp học" });
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