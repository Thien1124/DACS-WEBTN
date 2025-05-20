using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddForcedSubmissionToExamResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ForcedSubmission",
                table: "ExamResults",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ForcedSubmissionReason",
                table: "ExamResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ForcedSubmission",
                table: "ExamResults");

            migrationBuilder.DropColumn(
                name: "ForcedSubmissionReason",
                table: "ExamResults");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$Bj.q1NWECsVoBSnUcMrwFuGSuI.XD2Fqf10T5dQpZrsU6VAw4lMdW");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$BHpL6WTyGwMVU2ui5HjCZ.C86/i14gvXYkT0LiDdUiiIKhUyFw98W");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$QRiswaMFDviQfSkyxWKblO0BoseOtfLwyARB.rA3I98uOWfZy7.sS");
        }
    }
}
