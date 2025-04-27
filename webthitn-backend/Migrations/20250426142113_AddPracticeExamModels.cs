using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeExamModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PracticeExams",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    LevelId = table.Column<int>(type: "int", nullable: true),
                    Topic = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Questions = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeExams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeExams_QuestionLevels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "QuestionLevels",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PracticeExams_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeExams_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticeResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PracticeExamId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxScore = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletionTime = table.Column<int>(type: "int", nullable: false),
                    Answers = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeResults_PracticeExams_PracticeExamId",
                        column: x => x.PracticeExamId,
                        principalTable: "PracticeExams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeResults_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$l/weN6AwHBSoufDcK8VQ0OJkG3soST88AfltpyndArya5VPdIfM7S");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$izOxzhA5ZtpAFbRlS5CWXO7XAQCJtEXj9yFQilRU.XjSMqhz6b/bW");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$DIzLdYjuLKqt1ZB4mCOc6u5JKJr8sEVVjQSEohTyr.8AQcNL8uo9q");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeExams_LevelId",
                table: "PracticeExams",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeExams_SubjectId",
                table: "PracticeExams",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeExams_UserId",
                table: "PracticeExams",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeResults_PracticeExamId",
                table: "PracticeResults",
                column: "PracticeExamId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeResults_UserId",
                table: "PracticeResults",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PracticeResults");

            migrationBuilder.DropTable(
                name: "PracticeExams");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$SnWqruCD3A2w/3gg1.S9EuTlgtIsvSXRh2DIse8ELIPOYz/42H9mG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$14YmYYFmsvNZ.cy5AVf8E.1WFrH8zPh/8QeuOUNgTkPtM04phpNF2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$GPCI73ol9UYnJwEZyMaHG./frRlmdR9vpEhXWKzDJu5smDcTLBTLy");
        }
    }
}
