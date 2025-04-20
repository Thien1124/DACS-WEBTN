using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchingValueToQuestionOption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MatchingValue",
                table: "QuestionOptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$SnWqruCD3A2w/3gg1.S9EuTlgtIsvSXRh2DIse8ELIPOYz/42H9mG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$14YmYYFmsvNZ.cy5AVf8E.1WFrH8zPh/8QeuOUNgTkPtM04phpNF2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$GPCI73ol9UYnJwEZyMaHG./frRlmdR9vpEhXWKzDJu5smDcTLBTLy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MatchingValue",
                table: "QuestionOptions");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$nuZo4EJrXIv77pJfOI717u2OpAmslirkpemcPuBXYxjGAsa2QXU6e");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$EVQEwvyrm9N2psm9ZPOe.eDoC.eZKGsj52ifsmisUz32aY/zyhJ8i");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$/Y3qhgcDtzCkbJQYTdZPV.PwuUCWG0UqmyGiBCfp8BwJ0IJN8oycy");
        }
    }
}
