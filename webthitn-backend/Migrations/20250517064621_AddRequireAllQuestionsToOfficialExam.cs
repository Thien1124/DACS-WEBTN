using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRequireAllQuestionsToOfficialExam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AllowedTabChanges",
                table: "OfficialExams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "RequireAllQuestionsAnswered",
                table: "OfficialExams",
                type: "bit",
                nullable: false,
                defaultValue: false);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowedTabChanges",
                table: "OfficialExams");

            migrationBuilder.DropColumn(
                name: "RequireAllQuestionsAnswered",
                table: "OfficialExams");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$ps24in1m.Ey/Q3cy89gckeEPxxH.uCYO1pxev8PIYyMdYARkY7.na");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$4Su8MNuNOft2lWvKo6MjTuCaRdDuPHIJZRtPiVL5QvdJaoaR.zzwO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$RP5snFKSexYBamc.3ISxn.RElyBNcFpDUuSBkq28odwQnoQUlNGji");
        }
    }
}
