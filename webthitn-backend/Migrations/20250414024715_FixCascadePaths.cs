using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class FixCascadePaths : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Trước tiên, xóa tất cả các ràng buộc khóa ngoại hiện tại có thể gây ra chu trình
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamQuestions_ExamQuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamQuestions_ExamQuestionId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamResults_ExamResultId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamResults_ExamResultId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Questions_QuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Questions_QuestionId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Exams_ExamId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Exams_ExamId]
                END
            ");

            // Tiến hành các thay đổi cấu trúc trong migration gốc
            migrationBuilder.DropForeignKey(
                name: "FK_Exams_Users_UserId",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_Exams_UserId",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Exams");

            migrationBuilder.AddColumn<int>(
                name: "ClassId",
                table: "ExamResults",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuestionId1",
                table: "ExamQuestions",
                type: "int",
                nullable: true);

            // Tạo bảng ExamSessions nhưng KHÔNG tạo ràng buộc khóa ngoại ngay
            migrationBuilder.CreateTable(
                name: "ExamSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    ExamResultId = table.Column<int>(type: "int", nullable: true), // Thay đổi thành nullable
                    BrowserInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EndReason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamSessions", x => x.Id);
                });

            // Cập nhật dữ liệu seed
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$NRRD3EKLZT2dfezmtK279ek2.P8gJUMye70f4PxdLZE1FM8zw4Phq");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$M3PNuYH48b9cFtFm7UWjmu2kB8WdgZ/UhuPnAyOwbIp.phKEt8JKu");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$JNx97xdmdzp4HGuLb1ARBuklE6ay1olLAWWjDfKexmmnlHQjyp7Ua");

            // Tạo các chỉ mục
            migrationBuilder.CreateIndex(
                name: "IX_ExamResults_SessionId",
                table: "ExamResults",
                column: "SessionId",
                unique: true,
                filter: "[SessionId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ExamQuestions_QuestionId1",
                table: "ExamQuestions",
                column: "QuestionId1");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSessions_ExamId",
                table: "ExamSessions",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSessions_StudentId",
                table: "ExamSessions",
                column: "StudentId");

            // Bây giờ tạo các ràng buộc khóa ngoại bằng SQL tùy chỉnh để tránh chu trình cascade

            // Tạo khóa ngoại từ ExamSessions đến Users (Student)
            migrationBuilder.Sql(@"
                ALTER TABLE [ExamSessions] ADD CONSTRAINT [FK_ExamSessions_Users_StudentId] 
                FOREIGN KEY ([StudentId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
            ");

            // Tạo khóa ngoại từ ExamSessions đến Exams
            migrationBuilder.Sql(@"
                ALTER TABLE [ExamSessions] ADD CONSTRAINT [FK_ExamSessions_Exams_ExamId] 
                FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE NO ACTION
            ");

            // Tạo khóa ngoại từ ExamResults đến ExamSessions (ONE-WAY)
            migrationBuilder.Sql(@"
                ALTER TABLE [ExamResults] ADD CONSTRAINT [FK_ExamResults_ExamSessions_SessionId] 
                FOREIGN KEY ([SessionId]) REFERENCES [ExamSessions] ([Id]) ON DELETE NO ACTION
            ");

            // Tạo khóa ngoại từ ExamQuestions đến Questions
            migrationBuilder.Sql(@"
                ALTER TABLE [ExamQuestions] ADD CONSTRAINT [FK_ExamQuestions_Questions_QuestionId] 
                FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE NO ACTION
            ");

            // Tạo khóa ngoại từ ExamQuestions đến Exams
            migrationBuilder.Sql(@"
                ALTER TABLE [ExamQuestions] ADD CONSTRAINT [FK_ExamQuestions_Exams_ExamId] 
                FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE NO ACTION
            ");

            // Tạo khóa ngoại từ ExamQuestions đến Questions (QuestionId1)
            migrationBuilder.Sql(@"
                ALTER TABLE [ExamQuestions] ADD CONSTRAINT [FK_ExamQuestions_Questions_QuestionId1] 
                FOREIGN KEY ([QuestionId1]) REFERENCES [Questions] ([Id]) ON DELETE NO ACTION
            ");

            // Tạo khóa ngoại từ StudentAnswers đến ExamQuestions
            migrationBuilder.Sql(@"
                ALTER TABLE [StudentAnswers] ADD CONSTRAINT [FK_StudentAnswers_ExamQuestions_ExamQuestionId] 
                FOREIGN KEY ([ExamQuestionId]) REFERENCES [ExamQuestions] ([Id]) ON DELETE NO ACTION
            ");

            // Tạo khóa ngoại từ StudentAnswers đến ExamResults
            migrationBuilder.Sql(@"
                ALTER TABLE [StudentAnswers] ADD CONSTRAINT [FK_StudentAnswers_ExamResults_ExamResultId] 
                FOREIGN KEY ([ExamResultId]) REFERENCES [ExamResults] ([Id]) ON DELETE NO ACTION
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa các ràng buộc khóa ngoại đã tạo
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamQuestions_ExamQuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamQuestions_ExamQuestionId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_StudentAnswers_ExamResults_ExamResultId]') AND parent_object_id = OBJECT_ID(N'[dbo].[StudentAnswers]'))
                BEGIN
                    ALTER TABLE [StudentAnswers] DROP CONSTRAINT [FK_StudentAnswers_ExamResults_ExamResultId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamResults_ExamSessions_SessionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamResults]'))
                BEGIN
                    ALTER TABLE [ExamResults] DROP CONSTRAINT [FK_ExamResults_ExamSessions_SessionId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Questions_QuestionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Questions_QuestionId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Questions_QuestionId1]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Questions_QuestionId1]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamQuestions_Exams_ExamId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamQuestions]'))
                BEGIN
                    ALTER TABLE [ExamQuestions] DROP CONSTRAINT [FK_ExamQuestions_Exams_ExamId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamSessions_Users_StudentId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamSessions]'))
                BEGIN
                    ALTER TABLE [ExamSessions] DROP CONSTRAINT [FK_ExamSessions_Users_StudentId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ExamSessions_Exams_ExamId]') AND parent_object_id = OBJECT_ID(N'[dbo].[ExamSessions]'))
                BEGIN
                    ALTER TABLE [ExamSessions] DROP CONSTRAINT [FK_ExamSessions_Exams_ExamId]
                END
            ");

            // Xóa các bảng/cột đã tạo trong Up()
            migrationBuilder.DropTable(
                name: "ExamSessions");

            migrationBuilder.DropIndex(
                name: "IX_ExamResults_SessionId",
                table: "ExamResults");

            migrationBuilder.DropIndex(
                name: "IX_ExamQuestions_QuestionId1",
                table: "ExamQuestions");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "QuestionId1",
                table: "ExamQuestions");

            // Thêm lại cột UserId trong bảng Exams
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Exams",
                type: "int",
                nullable: true);

            // Cập nhật dữ liệu seed
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$LW9D4sFu.MZ785L/H8//F.hO6R3OGK1rYuLUo2u8uE.EOSOdmUOfe");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$NRRNERSi7nYFGXGe9VvyYOnqJi6NbOgGfAMzoumXK1bBYuR4RjUWK");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$rTMQ2t3OPjHnDyPf4e5J0udzBG0mdMzgcEuI14wUNHmoElF5LNMvC");

            // Tạo lại chỉ mục và ràng buộc khóa ngoại
            migrationBuilder.CreateIndex(
                name: "IX_Exams_UserId",
                table: "Exams",
                column: "UserId");

            // Thực hiện lại tạo khóa ngoại như ban đầu
            migrationBuilder.Sql(@"
                ALTER TABLE [ExamQuestions] ADD CONSTRAINT [FK_ExamQuestions_Exams_ExamId] 
                FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE CASCADE
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE [ExamQuestions] ADD CONSTRAINT [FK_ExamQuestions_Questions_QuestionId] 
                FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE CASCADE
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE [StudentAnswers] ADD CONSTRAINT [FK_StudentAnswers_ExamQuestions_ExamQuestionId] 
                FOREIGN KEY ([ExamQuestionId]) REFERENCES [ExamQuestions] ([Id]) ON DELETE CASCADE
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE [StudentAnswers] ADD CONSTRAINT [FK_StudentAnswers_ExamResults_ExamResultId] 
                FOREIGN KEY ([ExamResultId]) REFERENCES [ExamResults] ([Id]) ON DELETE CASCADE
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_Exams_Users_UserId",
                table: "Exams",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}