using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGradeLevelToSubject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamResults_Exams_ExamId",
                table: "ExamResults");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamResults_Users_GradedById",
                table: "ExamResults");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswerHistories_StudentAnswers_StudentAnswerId",
                table: "StudentAnswerHistories");

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

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentAnswerHistories",
                table: "StudentAnswerHistories");

            migrationBuilder.DropColumn(
                name: "MatchingValue",
                table: "QuestionOptions");

            migrationBuilder.RenameTable(
                name: "StudentAnswerHistories",
                newName: "StudentAnswerHistory");

            migrationBuilder.RenameColumn(
                name: "SelectedOptionIds",
                table: "StudentAnswers",
                newName: "TrueFalseAnswers");

            migrationBuilder.RenameColumn(
                name: "MatchingData",
                table: "StudentAnswers",
                newName: "ShortAnswerEvaluation");

            migrationBuilder.RenameColumn(
                name: "SelectedOptionIds",
                table: "StudentAnswerHistory",
                newName: "TrueFalseAnswers");

            migrationBuilder.RenameColumn(
                name: "MatchingData",
                table: "StudentAnswerHistory",
                newName: "DeviceInfo");

            migrationBuilder.RenameIndex(
                name: "IX_StudentAnswerHistories_StudentAnswerId",
                table: "StudentAnswerHistory",
                newName: "IX_StudentAnswerHistory_StudentAnswerId");

            migrationBuilder.AddColumn<int>(
                name: "GradeLevel",
                table: "Subjects",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "StudentAnswers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresManualReview",
                table: "StudentAnswers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "SelectedOptionId",
                table: "StudentAnswers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrueFalseCorrectCount",
                table: "StudentAnswers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ScoringConfig",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShortAnswerConfig",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "GroupId",
                table: "QuestionOptions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPartOfTrueFalseGroup",
                table: "QuestionOptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Label",
                table: "QuestionOptions",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ScorePercentage",
                table: "QuestionOptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "AllowPartialGrading",
                table: "Exams",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AutoGradeShortAnswer",
                table: "Exams",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ScoringConfig",
                table: "Exams",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ShuffleOptions",
                table: "Exams",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PartiallyCorrectAnswers",
                table: "ExamResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PendingManualGradeCount",
                table: "ExamResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "QuestionTypeStatistics",
                table: "ExamResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SessionId",
                table: "ExamResults",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuestionType",
                table: "StudentAnswerHistory",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SelectedOptionId",
                table: "StudentAnswerHistory",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentAnswerHistory",
                table: "StudentAnswerHistory",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 1,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 2,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 3,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 4,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 5,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 6,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 7,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 8,
                column: "GradeLevel",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Code", "Description", "GradeLevel" },
                values: new object[] { "GDKT&PL", "Giáo dục kinh tế và pháp luật", 0 });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$bXLYIcsB25MI8WsJ0W2dJe.cr1WnPB/0AezW/mXLIPq0CCPkSF762");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$JOJGjRvonVXPYEpa7B.aVeDbclE0OzLFJrZ/hlGw3XS3q8leMtaBy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$47VE7ffdBIPAIT0uQpz1LeWwgm8TCIG.izcBXCioeOhZOJ.32g7QC");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAnswers_SelectedOptionId",
                table: "StudentAnswers",
                column: "SelectedOptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResults_Exams_ExamId",
                table: "ExamResults",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResults_Users_GradedById",
                table: "ExamResults",
                column: "GradedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswerHistory_StudentAnswers_StudentAnswerId",
                table: "StudentAnswerHistory",
                column: "StudentAnswerId",
                principalTable: "StudentAnswers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Thay đổi từ Cascade thành NoAction để tránh multiple cascade paths
            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers",
                column: "ExamQuestionId",
                principalTable: "ExamQuestions",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_QuestionOptions_SelectedOptionId",
                table: "StudentAnswers",
                column: "SelectedOptionId",
                principalTable: "QuestionOptions",
                principalColumn: "Id");

            // Thay đổi từ Cascade thành NoAction để tránh multiple cascade paths
            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_Questions_QuestionId",
                table: "StudentAnswers",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
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
                name: "FK_StudentAnswerHistory_StudentAnswers_StudentAnswerId",
                table: "StudentAnswerHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_QuestionOptions_SelectedOptionId",
                table: "StudentAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_Questions_QuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropIndex(
                name: "IX_StudentAnswers_SelectedOptionId",
                table: "StudentAnswers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentAnswerHistory",
                table: "StudentAnswerHistory");

            migrationBuilder.DropColumn(
                name: "GradeLevel",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "RequiresManualReview",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "SelectedOptionId",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "TrueFalseCorrectCount",
                table: "StudentAnswers");

            migrationBuilder.DropColumn(
                name: "ScoringConfig",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ShortAnswerConfig",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "IsPartOfTrueFalseGroup",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "Label",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "ScorePercentage",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "AllowPartialGrading",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "AutoGradeShortAnswer",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "ScoringConfig",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "ShuffleOptions",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "PartiallyCorrectAnswers",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "PendingManualGradeCount",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "QuestionTypeStatistics",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "QuestionType",
                table: "StudentAnswerHistory");

            migrationBuilder.DropColumn(
                name: "SelectedOptionId",
                table: "StudentAnswerHistory");

            migrationBuilder.RenameTable(
                name: "StudentAnswerHistory",
                newName: "StudentAnswerHistories");

            migrationBuilder.RenameColumn(
                name: "TrueFalseAnswers",
                table: "StudentAnswers",
                newName: "SelectedOptionIds");

            migrationBuilder.RenameColumn(
                name: "ShortAnswerEvaluation",
                table: "StudentAnswers",
                newName: "MatchingData");

            migrationBuilder.RenameColumn(
                name: "TrueFalseAnswers",
                table: "StudentAnswerHistories",
                newName: "SelectedOptionIds");

            migrationBuilder.RenameColumn(
                name: "DeviceInfo",
                table: "StudentAnswerHistories",
                newName: "MatchingData");

            migrationBuilder.RenameIndex(
                name: "IX_StudentAnswerHistory_StudentAnswerId",
                table: "StudentAnswerHistories",
                newName: "IX_StudentAnswerHistories_StudentAnswerId");

            migrationBuilder.AddColumn<string>(
                name: "MatchingValue",
                table: "QuestionOptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentAnswerHistories",
                table: "StudentAnswerHistories",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ExamActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamResultId = table.Column<int>(type: "int", nullable: false),
                    ActivityType = table.Column<int>(type: "int", nullable: false),
                    AdditionalData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PausedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SessionData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TotalPausedTime = table.Column<int>(type: "int", nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: false)
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

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Code", "Description" },
                values: new object[] { "CIVIC", "Môn Giáo dục công dân" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$8EofiCh2B7/l4znGFzdvbu9zs9pU0xj.yrTJ.gKKZw2QnJb9EB80.");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$2j4mu42e9X9x4rBaHNZnZuW6SEzquupJenslRoZu0zweCrWJ1lh3S");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$1RxW5fIaeetk.rU7Vi85xOe4uFBHU9iVhGANzO7Lj6wl5kcbw0q4C");

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
                name: "FK_StudentAnswerHistories_StudentAnswers_StudentAnswerId",
                table: "StudentAnswerHistories",
                column: "StudentAnswerId",
                principalTable: "StudentAnswers",
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
    }
}