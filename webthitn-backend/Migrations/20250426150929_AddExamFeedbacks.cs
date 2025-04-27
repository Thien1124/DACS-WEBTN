using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddExamFeedbacks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExamFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResponseContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: true),
                    ResolvedById = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamFeedbacks_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamFeedbacks_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ExamFeedbacks_Users_ResolvedById",
                        column: x => x.ResolvedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ExamFeedbacks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$/Cxexxvk6vVPMGG5OqqLU.5j0.3LsSjDMFxfVnE8gQ6UOMF1KmEwC");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$nMG54liEKgkyKaVYXlNcGuCDcHGE4vQeDxo2LZwak/6B0HpvFRjRi");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$izzyhgiR1Svoiom6F.6ZmOZ1Jopp/QwmBIC8UjaTWwojzDYaFeLk2");

            migrationBuilder.CreateIndex(
                name: "IX_ExamFeedbacks_ExamId",
                table: "ExamFeedbacks",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamFeedbacks_QuestionId",
                table: "ExamFeedbacks",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamFeedbacks_ResolvedById",
                table: "ExamFeedbacks",
                column: "ResolvedById");

            migrationBuilder.CreateIndex(
                name: "IX_ExamFeedbacks_UserId",
                table: "ExamFeedbacks",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExamFeedbacks");

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
        }
    }
}
