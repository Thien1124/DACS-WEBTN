using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddScoreVerificationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScoreVerifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamResultId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    ResponderId = table.Column<int>(type: "int", nullable: true),
                    OriginalScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    NewScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    RequestReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TeacherResponse = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoreVerifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScoreVerifications_ExamResults_ExamResultId",
                        column: x => x.ExamResultId,
                        principalTable: "ExamResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScoreVerifications_Users_ResponderId",
                        column: x => x.ResponderId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ScoreVerifications_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ScoreVerifications_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$l3PeoT8qx8jnseQmtv5Ld.N6Spn95pBEqSNqMuS/6IvVJJpTV6saG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$3v/THpoeFMr3pcONzHQ3IugX.QFbJJTFH6PNafR9d/7pCirrB9JgG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$ipQofpATh1HnrnSwjpQWwugT7VJ8dEs/dyeKBDQyFYyiNMxlvXVC.");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreVerifications_ExamResultId",
                table: "ScoreVerifications",
                column: "ExamResultId");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreVerifications_ResponderId",
                table: "ScoreVerifications",
                column: "ResponderId");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreVerifications_StudentId",
                table: "ScoreVerifications",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreVerifications_TeacherId",
                table: "ScoreVerifications",
                column: "TeacherId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScoreVerifications");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$ZxwHzbE1cdL7jgsx7hO0cO.cwKr3vwMk/iy3x9tcaPV9/G5PJs7Ee");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$lurzcSHlnIpBe3cn6xoPROiQ3YQwckTY5sZNhR0GmUaAdXII9fXeK");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$B6HwxrfSjH6xNxgb73wSO.IWel4WitPu6eEtzJB8qVXFMNDf37s7C");
        }
    }
}
