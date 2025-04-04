using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class FixStudentAnswerModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamResults_Exams_ExamId",
                table: "ExamResults");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_QuestionLevels_LevelId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_QuestionOptions_SelectedOptionId",
                table: "StudentAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_Questions_QuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropIndex(
                name: "IX_StudentAnswers_SelectedOptionId",
                table: "StudentAnswers");

            migrationBuilder.DropIndex(
                name: "IX_Questions_LevelId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "PointsEarned",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "DefaultPoints",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "QuestionCode",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "Label",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ExamTypes");

            migrationBuilder.DropColumn(
                name: "ExamCode",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "PassingScore",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "TotalPoints",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "TotalQuestions",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "MaxPossibleScore",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "TotalScore",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "Points",
                table: "ExamQuestions");

            migrationBuilder.RenameColumn(
                name: "SelectedOptionId",
                table: "StudentAnswers",
                newName: "AnswerTime");

            migrationBuilder.RenameColumn(
                name: "AnswerOrder",
                table: "StudentAnswers",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "LevelId",
                table: "Questions",
                newName: "QuestionType");

            migrationBuilder.RenameColumn(
                name: "ShuffleOptions",
                table: "Exams",
                newName: "ShowResult");

            migrationBuilder.RenameColumn(
                name: "ShowResults",
                table: "Exams",
                newName: "ShowAnswers");

            migrationBuilder.RenameColumn(
                name: "GradeLevel",
                table: "Exams",
                newName: "AccessCode");

            migrationBuilder.RenameColumn(
                name: "TotalCorrect",
                table: "ExamResults",
                newName: "GradingStatus");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "ExamResults",
                newName: "IPAddress");

            migrationBuilder.RenameColumn(
                name: "StartTime",
                table: "ExamResults",
                newName: "StartedAt");

            migrationBuilder.RenameColumn(
                name: "Passed",
                table: "ExamResults",
                newName: "IsSubmittedManually");

            migrationBuilder.RenameColumn(
                name: "EndTime",
                table: "ExamResults",
                newName: "GradedAt");

            migrationBuilder.AlterColumn<string>(
                name: "School",
                table: "Users",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ResetPasswordCode",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Grade",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpires",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResetToken",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResetTokenExpires",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AnsweredAt",
                table: "StudentAnswers",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "ExamQuestionId",
                table: "StudentAnswers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsFlagged",
                table: "StudentAnswers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPartiallyCorrect",
                table: "StudentAnswers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "ManualScore",
                table: "StudentAnswers",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingData",
                table: "StudentAnswers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxScore",
                table: "StudentAnswers",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "StudentAnswers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuestionOrder",
                table: "StudentAnswers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Score",
                table: "StudentAnswers",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "SelectedOptionIds",
                table: "StudentAnswers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TeacherNote",
                table: "StudentAnswers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextAnswer",
                table: "StudentAnswers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChapterId",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatorId",
                table: "Questions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "DefaultScore",
                table: "Questions",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Explanation",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImagePath",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "QuestionLevelId",
                table: "Questions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SuggestedTime",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Explanation",
                table: "QuestionOptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImagePath",
                table: "QuestionOptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MatchingValue",
                table: "QuestionOptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ExamTypes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Exams",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartTime",
                table: "Exams",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndTime",
                table: "Exams",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Exams",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<int>(
                name: "MaxAttempts",
                table: "Exams",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PassScore",
                table: "Exams",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalScore",
                table: "Exams",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Exams",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AnsweredQuestions",
                table: "ExamResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "ExamResults",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CorrectAnswers",
                table: "ExamResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "DeviceInfo",
                table: "ExamResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "ExamResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "GradedById",
                table: "ExamResults",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "ExamResults",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPassed",
                table: "ExamResults",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentageScore",
                table: "ExamResults",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Score",
                table: "ExamResults",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "TeacherComment",
                table: "ExamResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Score",
                table: "ExamQuestions",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "ExamActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamResultId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActivityType = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdditionalData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: true),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamActivities_ExamResults_ExamResultId",
                        column: x => x.ExamResultId,
                        principalTable: "ExamResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExamSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamResultId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PausedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalPausedTime = table.Column<int>(type: "int", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SessionData = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamSessions_ExamResults_ExamResultId",
                        column: x => x.ExamResultId,
                        principalTable: "ExamResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamSessions_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StudentAnswerHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentAnswerId = table.Column<int>(type: "int", nullable: false),
                    SelectedOptionIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TextAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MatchingData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentAnswerHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentAnswerHistories_StudentAnswers_StudentAnswerId",
                        column: x => x.StudentAnswerId,
                        principalTable: "StudentAnswers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AvatarUrl", "Password", "RefreshToken", "RefreshTokenExpires", "ResetPasswordCode", "ResetToken", "ResetTokenExpires" },
                values: new object[] { null, "$2a$11$KT6Lk9d91lor6K2wLxEi3.PSdoVQ/FEzSZzPJB.TxFa3u69xft5B.", null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AvatarUrl", "Password", "RefreshToken", "RefreshTokenExpires", "ResetPasswordCode", "ResetToken", "ResetTokenExpires" },
                values: new object[] { null, "$2a$11$FonyRLicTd6ioB.qsXQ3eOx2JJK5YXhxPD8uesA1uNxuOqoucVlxK", null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "AvatarUrl", "Password", "RefreshToken", "RefreshTokenExpires", "ResetPasswordCode", "ResetToken", "ResetTokenExpires" },
                values: new object[] { null, "$2a$11$6r86CMuM2Jlf246eqPP6HOxazeqV119JVj4fqIUWWR4W7/14y0mIO", null, null, null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_StudentAnswers_ExamQuestionId",
                table: "StudentAnswers",
                column: "ExamQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ChapterId",
                table: "Questions",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_CreatorId",
                table: "Questions",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuestionLevelId",
                table: "Questions",
                column: "QuestionLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_UserId",
                table: "Exams",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamResults_GradedById",
                table: "ExamResults",
                column: "GradedById");

            migrationBuilder.CreateIndex(
                name: "IX_ExamActivities_ExamResultId",
                table: "ExamActivities",
                column: "ExamResultId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSessions_ExamResultId",
                table: "ExamSessions",
                column: "ExamResultId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSessions_StudentId",
                table: "ExamSessions",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAnswerHistories_StudentAnswerId",
                table: "StudentAnswerHistories",
                column: "StudentAnswerId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResults_Exams_ExamId",
                table: "ExamResults",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResults_Users_GradedById",
                table: "ExamResults",
                column: "GradedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Exams_Users_UserId",
                table: "Exams",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Chapters_ChapterId",
                table: "Questions",
                column: "ChapterId",
                principalTable: "Chapters",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_QuestionLevels_QuestionLevelId",
                table: "Questions",
                column: "QuestionLevelId",
                principalTable: "QuestionLevels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Users_CreatorId",
                table: "Questions",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers",
                column: "ExamQuestionId",
                principalTable: "ExamQuestions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_Questions_QuestionId",
                table: "StudentAnswers",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamResults_Exams_ExamId",
                table: "ExamResults");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamResults_Users_GradedById",
                table: "ExamResults");

            migrationBuilder.DropForeignKey(
                name: "FK_Exams_Users_UserId",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Chapters_ChapterId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_QuestionLevels_QuestionLevelId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Users_CreatorId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_Questions_QuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropTable(
                name: "ExamActivities");

            migrationBuilder.DropTable(
                name: "ExamSessions");

            migrationBuilder.DropTable(
                name: "StudentAnswerHistories");

            migrationBuilder.DropIndex(
                name: "IX_StudentAnswers_ExamQuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropIndex(
                name: "IX_Questions_ChapterId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_CreatorId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_QuestionLevelId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Exams_UserId",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_ExamResults_GradedById",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpires",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ResetToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ResetTokenExpires",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExamQuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "IsFlagged",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "IsPartiallyCorrect",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "ManualScore",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "MatchingData",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "MaxScore",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "QuestionOrder",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "SelectedOptionIds",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "TeacherNote",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "TextAnswer",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "ChapterId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "DefaultScore",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Explanation",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ImagePath",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "QuestionLevelId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "SuggestedTime",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Explanation",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "ImagePath",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "MatchingValue",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "MaxAttempts",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "PassScore",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "TotalScore",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "AnsweredQuestions",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "CorrectAnswers",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "DeviceInfo",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "GradedById",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "IsPassed",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "PercentageScore",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "TeacherComment",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "ExamQuestions");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "StudentAnswers",
                newName: "AnswerOrder");

            migrationBuilder.RenameColumn(
                name: "AnswerTime",
                table: "StudentAnswers",
                newName: "SelectedOptionId");

            migrationBuilder.RenameColumn(
                name: "QuestionType",
                table: "Questions",
                newName: "LevelId");

            migrationBuilder.RenameColumn(
                name: "ShowResult",
                table: "Exams",
                newName: "ShuffleOptions");

            migrationBuilder.RenameColumn(
                name: "ShowAnswers",
                table: "Exams",
                newName: "ShowResults");

            migrationBuilder.RenameColumn(
                name: "AccessCode",
                table: "Exams",
                newName: "GradeLevel");

            migrationBuilder.RenameColumn(
                name: "StartedAt",
                table: "ExamResults",
                newName: "StartTime");

            migrationBuilder.RenameColumn(
                name: "IsSubmittedManually",
                table: "ExamResults",
                newName: "Passed");

            migrationBuilder.RenameColumn(
                name: "IPAddress",
                table: "ExamResults",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "GradingStatus",
                table: "ExamResults",
                newName: "TotalCorrect");

            migrationBuilder.RenameColumn(
                name: "GradedAt",
                table: "ExamResults",
                newName: "EndTime");

            migrationBuilder.AlterColumn<string>(
                name: "School",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ResetPasswordCode",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Grade",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AnsweredAt",
                table: "StudentAnswers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<float>(
                name: "PointsEarned",
                table: "StudentAnswers",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "DefaultPoints",
                table: "Questions",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Questions",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "QuestionCode",
                table: "Questions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "QuestionOptions",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Label",
                table: "QuestionOptions",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ExamTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ExamTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Exams",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartTime",
                table: "Exams",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndTime",
                table: "Exams",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Exams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "ExamCode",
                table: "Exams",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Exams",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<float>(
                name: "PassingScore",
                table: "Exams",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "TotalPoints",
                table: "Exams",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuestions",
                table: "Exams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<float>(
                name: "MaxPossibleScore",
                table: "ExamResults",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "TotalScore",
                table: "ExamResults",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "Points",
                table: "ExamQuestions",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.UpdateData(
                table: "ExamTypes",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "ExamTypes",
                keyColumn: "Id",
                keyValue: 2,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "ExamTypes",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "ExamTypes",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "ExamTypes",
                keyColumn: "Id",
                keyValue: 5,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Password", "ResetPasswordCode" },
                values: new object[] { "$2a$11$WG9TQoX4JfzF5v70GE1/uO2sP.Ehi.oeeG8Vsaf.UIU2jCEifVDV2", "" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Password", "ResetPasswordCode" },
                values: new object[] { "$2a$11$NSNk2UrxTxIxmSkZjddG0ORZjojm4Ofjz2D/2JIhBDW7zzvXhP4Si", "" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Password", "ResetPasswordCode" },
                values: new object[] { "$2a$11$RJSEljqNcAuAvTGnK84rW.4JsctcnE7EJ4lP5w2nyLi.Y.IW8TrnO", "" });

            migrationBuilder.CreateIndex(
                name: "IX_StudentAnswers_SelectedOptionId",
                table: "StudentAnswers",
                column: "SelectedOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_LevelId",
                table: "Questions",
                column: "LevelId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResults_Exams_ExamId",
                table: "ExamResults",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_QuestionLevels_LevelId",
                table: "Questions",
                column: "LevelId",
                principalTable: "QuestionLevels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_QuestionOptions_SelectedOptionId",
                table: "StudentAnswers",
                column: "SelectedOptionId",
                principalTable: "QuestionOptions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_Questions_QuestionId",
                table: "StudentAnswers",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
