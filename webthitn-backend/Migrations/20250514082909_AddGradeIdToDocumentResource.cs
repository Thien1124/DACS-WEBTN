using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGradeIdToDocumentResource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GradeId",
                table: "DocumentResources",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$V4o2oMSiNB8ypOkB0GZGe.0SwrZ3.PAxaKL2/e6MktcPej/Oalx2e");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$slOkQRnhXQpiJ.ORXALq3.6bOxFDyB5tCYmxEbITzUBRz0zhg5Huq");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$Y7G/pzHSpVjXQ0GhjaLgvePIxwF5GJneoH0fjE2Jdntd/qSJe1T4G");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GradeId",
                table: "DocumentResources");

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
        }
    }
}
