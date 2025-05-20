using Microsoft.EntityFrameworkCore.Migrations;

namespace webthitn_backend.Migrations
{
    public partial class AddClassroomToUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Classroom",
                table: "Users", // Adjust if your table name is different
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Classroom",
                table: "Users"); // Adjust if your table name is different
        }
    }
}