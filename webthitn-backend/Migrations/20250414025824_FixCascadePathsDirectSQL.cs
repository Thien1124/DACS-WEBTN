using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class FixCascadePathsDirectSQL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Xóa tất cả các ràng buộc khóa ngoại hiện tại trước
            migrationBuilder.Sql(@"
                -- Xóa ràng buộc StudentAnswers -> ExamQuestions (nếu tồn tại)
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamQuestions_ExamQuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamQuestions_ExamQuestionId]
                END

                -- Xóa ràng buộc StudentAnswers -> ExamResults (nếu tồn tại)
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamResults_ExamResultId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamResults_ExamResultId]
                END

                -- Xóa ràng buộc ExamQuestions -> Questions (nếu tồn tại)
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Questions_QuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Questions_QuestionId]
                END

                -- Xóa ràng buộc ExamQuestions -> Exams (nếu tồn tại)
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Exams_ExamId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Exams_ExamId]
                END
            ");

            // Tạo lại các ràng buộc với ON DELETE NO ACTION rõ ràng
            migrationBuilder.Sql(@"
                -- StudentAnswer -> ExamQuestion với NO ACTION
                ALTER TABLE [StudentAnswers] ADD CONSTRAINT [FK_StudentAnswers_ExamQuestions_ExamQuestionId] 
                FOREIGN KEY ([ExamQuestionId]) REFERENCES [ExamQuestions] ([Id]) ON DELETE NO ACTION

                -- StudentAnswer -> ExamResult với NO ACTION
                ALTER TABLE [StudentAnswers] ADD CONSTRAINT [FK_StudentAnswers_ExamResults_ExamResultId] 
                FOREIGN KEY ([ExamResultId]) REFERENCES [ExamResults] ([Id]) ON DELETE NO ACTION

                -- ExamQuestion -> Question với NO ACTION
                ALTER TABLE [ExamQuestions] ADD CONSTRAINT [FK_ExamQuestions_Questions_QuestionId] 
                FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE NO ACTION

                -- ExamQuestion -> Exam với NO ACTION
                ALTER TABLE [ExamQuestions] ADD CONSTRAINT [FK_ExamQuestions_Exams_ExamId] 
                FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE NO ACTION
            ");

            // Cập nhật mật khẩu trong seed data (tự động từ mã hash BCrypt)
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$Bih8eVsV1lCiz2k1uuPJ1./9gb7GIoggzrLHPTf3JzfcpJmPtATVO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$Aps.Fhq2W5iAgjufnEVvBOGZVQo4/CaD2qqtP6pUrB3PJNn.GfNH.");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$4djz4R6umOeI89Hno0JyzurGmnJ2Ci8RYBBDQSOIF4DU25G1usfji");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa các ràng buộc NO ACTION đã tạo
            migrationBuilder.Sql(@"
                -- Xóa ràng buộc StudentAnswers -> ExamQuestions 
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamQuestions_ExamQuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamQuestions_ExamQuestionId]
                END

                -- Xóa ràng buộc StudentAnswers -> ExamResults
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamResults_ExamResultId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamResults_ExamResultId]
                END

                -- Xóa ràng buộc ExamQuestions -> Questions
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Questions_QuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Questions_QuestionId]
                END

                -- Xóa ràng buộc ExamQuestions -> Exams
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Exams_ExamId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Exams_ExamId]
                END
            ");

            // Khôi phục mật khẩu seed data
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$e2n8wdOBFmjS69Ga5dQ56.iRoQABOSfbPQ5vynTw07fpM4r67gZpm");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$R9C/paIj.BNtHE4.TV.y5eAaZ2qgVcWKRsMJk.8b.MG5zncmogEky");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$vp1S1npVbO02ogA.t9Oq9e1yYQ0Hj3/N7dgUIvvt2.JMXPqmwcyRi");

            // Không tạo lại ràng buộc Cascade để tránh lỗi chu trình
        }
    }
}