using Microsoft.EntityFrameworkCore;
using webthitn_backend.Models.Users;

namespace webthitn_backend.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<QuestionLevel> QuestionLevels { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<ExamType> ExamTypes { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<ExamQuestion> ExamQuestions { get; set; }
        public DbSet<ExamResult> ExamResults { get; set; }
        public DbSet<StudentAnswer> StudentAnswers { get; set; }
        public DbSet<Setting> Settings { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Vô hiệu hóa cảnh báo về thay đổi model
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Subject - Chapter (1-n)
            modelBuilder.Entity<Chapter>()
                .HasOne(c => c.Subject)
                .WithMany(s => s.Chapters)
                .HasForeignKey(c => c.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Chapter - Lesson (1-n)
            modelBuilder.Entity<Lesson>()
                .HasOne(l => l.Chapter)
                .WithMany(c => c.Lessons)
                .HasForeignKey(l => l.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            // Exam - Subject (n-1)
            modelBuilder.Entity<Exam>()
                .HasOne(e => e.Subject)
                .WithMany(s => s.Exams)
                .HasForeignKey(e => e.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // Question - QuestionOption (1-n)
            modelBuilder.Entity<QuestionOption>()
                .HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            // User as Creator for Exam
            modelBuilder.Entity<Exam>()
                .HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatorId)
                .OnDelete(DeleteBehavior.Restrict);

            // ExamResult - User
            modelBuilder.Entity<ExamResult>()
                .HasOne(er => er.Student)
                .WithMany(u => u.ExamResults)
                .HasForeignKey(er => er.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Giá trị thời gian cố định thay vì DateTime.Parse() hoặc DateTime.Now
            var fixedDate1 = new DateTime(2025, 4, 1, 15, 56, 0);
            var fixedDate2 = new DateTime(2025, 4, 1, 15, 56, 40);
            var currentDate = new DateTime(2025, 4, 13, 15, 53, 52);
            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    FullName = "Administrator",
                    Role = "Admin",
                    PhoneNumber = "N/A", // Thêm giá trị cho thuộc tính bắt buộc
                    Grade = "N/A", // Thêm giá trị cho thuộc tính bắt buộc
                    School = "N/A", // Thêm giá trị cho thuộc tính bắt buộc
                    CreatedAt = fixedDate1 // Sử dụng giá trị cố định
                },
                new User
                {
                    Id = 2,
                    Username = "Thien1124",
                    Email = "thien1124@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    FullName = "Thien Nguyen",
                    Role = "Teacher",
                    School = "Trường THPT Chu Văn An",
                    Grade = "Teacher", // Thêm giá trị cho thuộc tính bắt buộc
                    PhoneNumber = "0123456789", // Thêm giá trị cho thuộc tính bắt buộc
                    CreatedAt = fixedDate1,
                    LastLogin = fixedDate2
                },
                new User
                {
                    Id = 3,
                    Username = "student1",
                    Email = "student1@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                    FullName = "Học sinh mẫu",
                    Role = "Student",
                    School = "Trường THPT Chu Văn An",
                    Grade = "12",
                    PhoneNumber = "0987654321", // Thêm giá trị cho thuộc tính bắt buộc
                    CreatedAt = fixedDate1
                }
            );

            // Seed Question Levels
            modelBuilder.Entity<QuestionLevel>().HasData(
                new QuestionLevel { Id = 1, Name = "Nhận biết", Value = 1, Description = "Câu hỏi mức độ nhận biết" },
                new QuestionLevel { Id = 2, Name = "Thông hiểu", Value = 2, Description = "Câu hỏi mức độ thông hiểu" },
                new QuestionLevel { Id = 3, Name = "Vận dụng thấp", Value = 3, Description = "Câu hỏi mức độ vận dụng thấp" },
                new QuestionLevel { Id = 4, Name = "Vận dụng cao", Value = 4, Description = "Câu hỏi mức độ vận dụng cao" }
            );

            // Seed Exam Types
            modelBuilder.Entity<ExamType>().HasData(
                new ExamType { Id = 1, Name = "Kiểm tra 15 phút", Description = "Bài kiểm tra nhanh 15 phút" },
                new ExamType { Id = 2, Name = "Kiểm tra 1 tiết", Description = "Bài kiểm tra 45 phút" },
                new ExamType { Id = 3, Name = "Giữa kỳ", Description = "Bài thi giữa học kỳ" },
                new ExamType { Id = 4, Name = "Cuối kỳ", Description = "Bài thi cuối học kỳ" },
                new ExamType { Id = 5, Name = "Thi thử THPT QG", Description = "Đề thi thử THPT Quốc gia" }
            );

            // Seed Subjects
            modelBuilder.Entity<Subject>().HasData(
                new Subject
                {
                    Id = 1,
                    Name = "Toán 10",
                    Code = "MATH10",
                    Description = "Môn Toán Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 2,
                    Name = "Vật Lý 10",
                    Code = "PHY10",
                    Description = "Môn Vật Lý Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 3,
                    Name = "Hóa Học 10",
                    Code = "CHEM10",
                    Description = "Môn Hóa Học Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 10,
                    Name = "Sinh Học 10",
                    Code = "BIO10",
                    Description = "Môn Sinh Học Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 13,
                    Name = "Ngữ Văn 10",
                    Code = "LIT10",
                    Description = "Môn Ngữ Văn Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 16,
                    Name = "Tiếng Anh 10",
                    Code = "ENG10",
                    Description = "Môn Tiếng Anh Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 19,
                    Name = "Lịch Sử 10",
                    Code = "HIST10",
                    Description = "Môn Lịch Sử Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 22,
                    Name = "Địa Lý 10",
                    Code = "GEO10",
                    Description = "Môn Địa Lý Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 25,
                    Name = "GDKT&PL 10",
                    Code = "GDKT&PL10",
                    Description = "Giáo dục kinh tế và pháp luật Lớp 10",
                    GradeLevel = 10,
                    IsActive = true,
                    CreatedAt = currentDate
                },

                // Grade 11 Subjects
                new Subject
                {
                    Id = 4,
                    Name = "Toán 11",
                    Code = "MATH11",
                    Description = "Môn Toán Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 5,
                    Name = "Vật Lý 11",
                    Code = "PHY11",
                    Description = "Môn Vật Lý Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 6,
                    Name = "Hóa Học 11",
                    Code = "CHEM11",
                    Description = "Môn Hóa Học Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 11,
                    Name = "Sinh Học 11",
                    Code = "BIO11",
                    Description = "Môn Sinh Học Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 14,
                    Name = "Ngữ Văn 11",
                    Code = "LIT11",
                    Description = "Môn Ngữ Văn Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 17,
                    Name = "Tiếng Anh 11",
                    Code = "ENG11",
                    Description = "Môn Tiếng Anh Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 20,
                    Name = "Lịch Sử 11",
                    Code = "HIST11",
                    Description = "Môn Lịch Sử Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 23,
                    Name = "Địa Lý 11",
                    Code = "GEO11",
                    Description = "Môn Địa Lý Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 26,
                    Name = "GDKT&PL 11",
                    Code = "GDKT&PL11",
                    Description = "Giáo dục kinh tế và pháp luật Lớp 11",
                    GradeLevel = 11,
                    IsActive = true,
                    CreatedAt = currentDate
                },

                // Grade 12 Subjects
                new Subject
                {
                    Id = 7,
                    Name = "Toán 12",
                    Code = "MATH12",
                    Description = "Môn Toán Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 8,
                    Name = "Vật Lý 12",
                    Code = "PHY12",
                    Description = "Môn Vật Lý Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 9,
                    Name = "Hóa Học 12",
                    Code = "CHEM12",
                    Description = "Môn Hóa Học Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = fixedDate1
                },
                new Subject
                {
                    Id = 12,
                    Name = "Sinh Học 12",
                    Code = "BIO12",
                    Description = "Môn Sinh Học Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 15,
                    Name = "Ngữ Văn 12",
                    Code = "LIT12",
                    Description = "Môn Ngữ Văn Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 18,
                    Name = "Tiếng Anh 12",
                    Code = "ENG12",
                    Description = "Môn Tiếng Anh Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 21,
                    Name = "Lịch Sử 12",
                    Code = "HIST12",
                    Description = "Môn Lịch Sử Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 24,
                    Name = "Địa Lý 12",
                    Code = "GEO12",
                    Description = "Môn Địa Lý Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = currentDate
                },
                new Subject
                {
                    Id = 27,
                    Name = "GDKT&PL 12",
                    Code = "GDKT&PL12",
                    Description = "Giáo dục kinh tế và pháp luật Lớp 12",
                    GradeLevel = 12,
                    IsActive = true,
                    CreatedAt = currentDate
                }
            );

        }


    }
}