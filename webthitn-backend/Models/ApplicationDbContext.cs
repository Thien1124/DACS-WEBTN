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

            // Định nghĩa các mối quan hệ và ràng buộc

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
                new Subject { Id = 1, Name = "Toán", Code = "MATH", Description = "Môn Toán", CreatedAt = fixedDate1 },
                new Subject { Id = 2, Name = "Vật Lý", Code = "PHY", Description = "Môn Vật Lý", CreatedAt = fixedDate1 },
                new Subject { Id = 3, Name = "Hóa Học", Code = "CHEM", Description = "Môn Hóa Học", CreatedAt = fixedDate1 },
                new Subject { Id = 4, Name = "Sinh Học", Code = "BIO", Description = "Môn Sinh Học", CreatedAt = fixedDate1 },
                new Subject { Id = 5, Name = "Ngữ Văn", Code = "LIT", Description = "Môn Ngữ Văn", CreatedAt = fixedDate1 },
                new Subject { Id = 6, Name = "Tiếng Anh", Code = "ENG", Description = "Môn Tiếng Anh", CreatedAt = fixedDate1 },
                new Subject { Id = 7, Name = "Lịch Sử", Code = "HIST", Description = "Môn Lịch Sử", CreatedAt = fixedDate1 },
                new Subject { Id = 8, Name = "Địa Lý", Code = "GEO", Description = "Môn Địa Lý", CreatedAt = fixedDate1 },
                new Subject { Id = 9, Name = "GDCD", Code = "CIVIC", Description = "Môn Giáo dục công dân", CreatedAt = fixedDate1 }
            );
        }
    }
}