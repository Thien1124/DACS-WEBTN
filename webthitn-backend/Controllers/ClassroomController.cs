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

        /// <summary>
        /// Lấy danh sách tất cả các lớp học
        /// </summary>
        /// <param name="page">Số trang (mặc định: 1)</param>
        /// <param name="pageSize">Số lượng mỗi trang (mặc định: 10)</param>
        /// <param name="grade">Lọc theo khối (10, 11, 12)</param>
        /// <returns>Danh sách lớp học</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetClassrooms(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] string grade = null)
        {
            try
            {
                // Start with base query - include all students
                var query = _context.Users
                    .Where(u => u.Role == "Student");
                    
                // Apply grade filter if provided
                if (!string.IsNullOrEmpty(grade))
                {
                    query = query.Where(u => u.Grade == grade);
                }
                    
                // Group by classroom and exclude placeholder students from count
                var groupedQuery = query
                    .GroupBy(u => u.Classroom)
                    .Select(g => new
                    {
                        name = g.Key,
                        grade = g.First().Grade,
                        studentCount = g.Count(s => !s.Username.Contains("CLASS")) // Exclude placeholder students
                    })
                    .Where(c => !string.IsNullOrEmpty(c.name));
                    
                // Finally, order the results
                var orderedQuery = groupedQuery.OrderBy(c => c.name);
                    
                // Get total count for pagination
                var totalCount = await groupedQuery.CountAsync();
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
                    
                var classrooms = await orderedQuery
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                    
                return Ok(new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages,
                    data = classrooms
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting classrooms: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách lớp học" });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết của một lớp học
        /// </summary>
        /// <param name="name">Tên lớp học</param>
        /// <returns>Thông tin chi tiết lớp học</returns>
        [HttpGet("{name}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetClassroomDetail(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Get classroom info including placeholder students
                var classroomInfo = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == name)
                    .GroupBy(u => u.Classroom)
                    .Select(g => new
                    {
                        name = g.Key,
                        grade = g.First().Grade,
                        studentCount = g.Count(s => s.IsActive) // Only count active students
                    })
                    .FirstOrDefaultAsync();

                if (classroomInfo == null)
                {
                    return NotFound(new { message = $"Không tìm thấy lớp {name}" });
                }

                // Get student list summary
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == name)
                    .OrderBy(u => u.Username)
                    .Select(u => new
                    {
                        id = u.Id,
                        username = u.Username,
                        fullName = u.FullName
                    })
                    .Take(10) // Limit to first 10 students for the summary
                    .ToListAsync();

                return Ok(new
                {
                    name = classroomInfo.name,
                    grade = classroomInfo.grade,
                    studentCount = classroomInfo.studentCount,
                    recentStudents = students
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting classroom detail: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin lớp học" });
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Extract grade from classroom name if not provided
                string grade = model.Grade;
                if (string.IsNullOrEmpty(grade) && model.Name.Length >= 2)
                {
                    grade = model.Name.Substring(0, 2);
                    if (!new[] { "10", "11", "12" }.Contains(grade))
                    {
                        grade = "12"; // Default to grade 12
                    }
                }

                // Check if classroom already exists
                var existingClassroom = await _context.Users
                    .AnyAsync(u => u.Classroom == model.Name);

                if (existingClassroom)
                {
                    return BadRequest(new { message = $"Lớp {model.Name} đã tồn tại" });
                }

                // Create a placeholder student for the classroom
                string uniqueUsername = $"CLASS_{model.Name}_{Guid.NewGuid().ToString().Substring(0, 8)}";
                string passwordHash = BCrypt.Net.BCrypt.HashPassword("placeholder_password");
                
                var placeholderStudent = new User
                {
                    Username = uniqueUsername,
                    FullName = $"Lớp {model.Name}",
                    Email = $"{uniqueUsername.ToLower()}@placeholder.edu.vn",
                    Classroom = model.Name,
                    Grade = grade ?? "12",
                    PhoneNumber = "Chưa cập nhật",
                    School = "THPT WEBTN",
                    Role = "Student",
                    IsActive = false, // Đánh dấu là không hoạt động
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Password = passwordHash
                };
                
                _context.Users.Add(placeholderStudent);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetClassroomDetail), new { name = model.Name }, new
                {
                    name = model.Name,
                    grade = grade ?? "12",
                    description = model.Description,
                    studentCount = 0
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
    
                // Log more details about the exception
                _logger.LogError($"Error creating classroom: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                _logger.LogError($"Stack trace: {ex.StackTrace}");
    
                return StatusCode(500, new { 
                    message = "Đã xảy ra lỗi khi tạo lớp học mới",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// Cập nhật thông tin lớp học
        /// </summary>
        /// <param name="name">Tên lớp học cần cập nhật</param>
        /// <param name="model">Thông tin cập nhật</param>
        /// <returns>Thông tin lớp học sau khi cập nhật</returns>
        [HttpPut("{name}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateClassroom(string name, [FromBody] UpdateClassroomDTO model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Find all students in the classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == name)
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy lớp {name}" });
                }

                // Extract grade from new classroom name if provided
                string grade = model.Grade;
                if (string.IsNullOrEmpty(grade) && !string.IsNullOrEmpty(model.NewName) && model.NewName.Length >= 2)
                {
                    grade = model.NewName.Substring(0, 2);
                    if (!new[] { "10", "11", "12" }.Contains(grade))
                    {
                        grade = students.First().Grade; // Keep current grade if can't extract
                    }
                }

                // If renaming, check if new name already exists
                if (!string.IsNullOrEmpty(model.NewName) && model.NewName != name)
                {
                    var existingClassroom = await _context.Users
                        .AnyAsync(u => u.Classroom == model.NewName);

                    if (existingClassroom)
                    {
                        return BadRequest(new { message = $"Lớp {model.NewName} đã tồn tại" });
                    }
                }

                // Update all students in this classroom
                foreach (var student in students)
                {
                    if (!string.IsNullOrEmpty(model.NewName))
                    {
                        student.Classroom = model.NewName;
                    }
                    
                    if (!string.IsNullOrEmpty(grade))
                    {
                        student.Grade = grade;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    name = !string.IsNullOrEmpty(model.NewName) ? model.NewName : name,
                    grade = grade ?? students.First().Grade,
                    studentCount = students.Count
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError($"Error updating classroom: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật lớp học" });
            }
        }

        /// <summary>
        /// Xóa lớp học
        /// </summary>
        /// <param name="name">Tên lớp học cần xóa</param>
        /// <returns>Kết quả xóa lớp</returns>
        [HttpDelete("{name}")]
        [Authorize(Roles = "Admin")] // Only admin can delete a classroom
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteClassroom(string name)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return BadRequest(new { message = "Tên lớp không được để trống" });
                }

                // Find all students in the classroom
                var students = await _context.Users
                    .Where(u => u.Role == "Student" && u.Classroom == name)
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy lớp {name}" });
                }

                // Option 1: Delete all students in the classroom
                // _context.Users.RemoveRange(students);

                // Option 2: Move students to an "Unassigned" classroom
                foreach (var student in students)
                {
                    student.Classroom = "Chưa phân lớp";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = $"Đã xóa lớp {name} thành công",
                    studentCount = students.Count
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError($"Error deleting classroom: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa lớp học" });
            }
        }

        /// <summary>
        /// Tạo danh sách lớp mặc định cho các khối 10, 11, 12
        /// </summary>
        /// <returns>Kết quả tạo lớp</returns>
        [HttpPost("create-default")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateDefaultClassrooms()
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var results = new
                {
                    created = new List<string>(),
                    existing = new List<string>(),
                    failed = new List<string>()
                };

                // Tạo lớp cho 3 khối 10, 11, 12
                foreach (var grade in new[] { "10", "11", "12" })
                {
                    // Tạo 10 lớp cho mỗi khối từ A1 đến A10
                    for (int i = 1; i <= 10; i++)
                    {
                        string className = $"{grade}A{i}";
                        
                        // Kiểm tra xem lớp đã tồn tại chưa
                        var classExists = await _context.Users
                            .AnyAsync(u => u.Classroom == className);
                        
                        if (classExists)
                        {
                            results.existing.Add(className);
                            continue;
                        }
                        
                        try
                        {
                            // Tạo lớp mới bằng cách tạo một "placeholder" student với trạng thái inactive
                            string uniqueUsername = $"CLASS_{className}_{Guid.NewGuid().ToString().Substring(0, 8)}";
                            string passwordHash = BCrypt.Net.BCrypt.HashPassword("placeholder_password");
                            
                            var placeholderStudent = new User
                            {
                                Username = uniqueUsername,
                                FullName = $"Lớp {className}",
                                Email = $"{uniqueUsername.ToLower()}@placeholder.edu.vn",
                                Classroom = className,
                                Grade = grade,
                                PhoneNumber = "Chưa cập nhật",
                                School = "THPT WEBTN",
                                Role = "Student",
                                IsActive = false, // Đánh dấu là không hoạt động để không hiển thị trong danh sách học sinh
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                Password = passwordHash
                            };
                            
                            _context.Users.Add(placeholderStudent);
                            await _context.SaveChangesAsync();
                            results.created.Add(className);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error creating classroom {className}: {ex.Message}");
                            results.failed.Add(className);
                        }
                    }
                }
                
                await transaction.CommitAsync();
                
                return Ok(new
                {
                    message = "Đã tạo danh sách lớp mặc định",
                    createdCount = results.created.Count,
                    existingCount = results.existing.Count,
                    failedCount = results.failed.Count,
                    details = results
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError($"Error creating default classrooms: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo danh sách lớp mặc định" });
            }
        }
    }
}