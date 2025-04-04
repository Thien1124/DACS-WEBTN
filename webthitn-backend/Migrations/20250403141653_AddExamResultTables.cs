using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddExamResultTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$8EofiCh2B7/l4znGFzdvbu9zs9pU0xj.yrTJ.gKKZw2QnJb9EB80.");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$2j4mu42e9X9x4rBaHNZnZuW6SEzquupJenslRoZu0zweCrWJ1lh3S");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$1RxW5fIaeetk.rU7Vi85xOe4uFBHU9iVhGANzO7Lj6wl5kcbw0q4C");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$KT6Lk9d91lor6K2wLxEi3.PSdoVQ/FEzSZzPJB.TxFa3u69xft5B.");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$FonyRLicTd6ioB.qsXQ3eOx2JJK5YXhxPD8uesA1uNxuOqoucVlxK");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$6r86CMuM2Jlf246eqPP6HOxazeqV119JVj4fqIUWWR4W7/14y0mIO");
        }
    }
}
