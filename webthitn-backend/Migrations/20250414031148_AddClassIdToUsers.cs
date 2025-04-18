using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddClassIdToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$lhY4Ar5S2HkTDVS2R2qRyeiZ0VmETqCzMyxo9fjUzB/9TZLODvWii");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$IuZSMWEvlkPL5H3lbngZp.hYZgb6agf6UW87g.QTNb7iIciE7d.qS");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$fhjfgmEGfjeatP7gyLpNM.Y8SICXBiVJrTeNbYkTkK/y.4qEIMQPa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$Bih8eVsV1lCiz2k1uuPJ1./9gb7GIoggzrLHPTf3JzfcpJmPtATVO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$Aps.Fhq2W5iAgjufnEVvBOGZVQo4/CaD2qqtP6pUrB3PJNn.GfNH.");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$4djz4R6umOeI89Hno0JyzurGmnJ2Ci8RYBBDQSOIF4DU25G1usfji");
        }
    }
}
