using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGradeToOfficialExam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "OfficialExams",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Grade",
                table: "OfficialExams");
        }
    }
}
