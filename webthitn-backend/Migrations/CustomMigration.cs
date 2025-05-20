using Microsoft.EntityFrameworkCore.Migrations;

namespace webthitn_backend.Migrations
{
    public partial class AddGradeToOfficialExamOnly : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Keep this part
            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "OfficialExams",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Grade",
                table: "OfficialExams");
        }
    }
}