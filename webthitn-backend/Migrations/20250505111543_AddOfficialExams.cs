using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOfficialExams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OfficialExams",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExamId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClassroomName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatorId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ResultsReleased = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfficialExams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfficialExams_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OfficialExams_Users_CreatorId",
                        column: x => x.CreatorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OfficialExamStudents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfficialExamId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    HasTaken = table.Column<bool>(type: "bit", nullable: false),
                    ExamResultId = table.Column<int>(type: "int", nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfficialExamStudents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfficialExamStudents_ExamResults_ExamResultId",
                        column: x => x.ExamResultId,
                        principalTable: "ExamResults",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OfficialExamStudents_OfficialExams_OfficialExamId",
                        column: x => x.OfficialExamId,
                        principalTable: "OfficialExams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OfficialExamStudents_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$DSOVKYjggyzpqmXc5QlGa.cRE/lp.Er.edIWOZpZyLXbeXFYJbP4.");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$jPm5V.10Fr7Xr3Rhz24sxuLUKb.sugw9QCjX1HwQN.blz9bxfR5WC");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$3tpF.2tDQgCNOxWQRD8PyO.ksYHjtYU9lHFG5rHRQ7SIKBkFMiylS");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialExams_CreatorId",
                table: "OfficialExams",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialExams_ExamId",
                table: "OfficialExams",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialExamStudents_ExamResultId",
                table: "OfficialExamStudents",
                column: "ExamResultId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialExamStudents_OfficialExamId",
                table: "OfficialExamStudents",
                column: "OfficialExamId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialExamStudents_StudentId",
                table: "OfficialExamStudents",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfficialExamStudents");

            migrationBuilder.DropTable(
                name: "OfficialExams");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$TXImFe6Z5rXjWuqtoAAV3O7UzzHK9Uo0Fu2GtdA5QWWbNC5vGVPJK");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$qdzS8uNEsooIrnKH3gADCeFD4/DKzH5E3sd19FqWrCqVejvo4xm/a");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$jzGZ5O7bSpE0PFwihabIP.BiMYlNDg0RrAKFCjDGJo2yRfjSmNtwS");
        }
    }
}
