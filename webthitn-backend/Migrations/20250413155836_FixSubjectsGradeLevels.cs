using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class FixSubjectsGradeLevels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "MATH10", "Môn Toán Lớp 10", 10, "Toán 10" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "PHY10", "Môn Vật Lý Lớp 10", 10, "Vật Lý 10" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "CHEM10", "Môn Hóa Học Lớp 10", 10, "Hóa Học 10" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "MATH11", "Môn Toán Lớp 11", 11, "Toán 11" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "PHY11", "Môn Vật Lý Lớp 11", 11, "Vật Lý 11" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "CHEM11", "Môn Hóa Học Lớp 11", 11, "Hóa Học 11" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "MATH12", "Môn Toán Lớp 12", 12, "Toán 12" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "PHY12", "Môn Vật Lý Lớp 12", 12, "Vật Lý 12" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "CHEM12", "Môn Hóa Học Lớp 12", 12, "Hóa Học 12" });

            migrationBuilder.InsertData(
                table: "Subjects",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "GradeLevel", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 10, "BIO10", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Sinh Học Lớp 10", 10, true, "Sinh Học 10", null },
                    { 11, "BIO11", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Sinh Học Lớp 11", 11, true, "Sinh Học 11", null },
                    { 12, "BIO12", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Sinh Học Lớp 12", 12, true, "Sinh Học 12", null },
                    { 13, "LIT10", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Ngữ Văn Lớp 10", 10, true, "Ngữ Văn 10", null },
                    { 14, "LIT11", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Ngữ Văn Lớp 11", 11, true, "Ngữ Văn 11", null },
                    { 15, "LIT12", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Ngữ Văn Lớp 12", 12, true, "Ngữ Văn 12", null },
                    { 16, "ENG10", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Tiếng Anh Lớp 10", 10, true, "Tiếng Anh 10", null },
                    { 17, "ENG11", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Tiếng Anh Lớp 11", 11, true, "Tiếng Anh 11", null },
                    { 18, "ENG12", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Tiếng Anh Lớp 12", 12, true, "Tiếng Anh 12", null },
                    { 19, "HIST10", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Lịch Sử Lớp 10", 10, true, "Lịch Sử 10", null },
                    { 20, "HIST11", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Lịch Sử Lớp 11", 11, true, "Lịch Sử 11", null },
                    { 21, "HIST12", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Lịch Sử Lớp 12", 12, true, "Lịch Sử 12", null },
                    { 22, "GEO10", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Địa Lý Lớp 10", 10, true, "Địa Lý 10", null },
                    { 23, "GEO11", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Địa Lý Lớp 11", 11, true, "Địa Lý 11", null },
                    { 24, "GEO12", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Môn Địa Lý Lớp 12", 12, true, "Địa Lý 12", null },
                    { 25, "GDKT&PL10", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Giáo dục kinh tế và pháp luật Lớp 10", 10, true, "GDKT&PL 10", null },
                    { 26, "GDKT&PL11", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Giáo dục kinh tế và pháp luật Lớp 11", 11, true, "GDKT&PL 11", null },
                    { 27, "GDKT&PL12", new DateTime(2025, 4, 13, 15, 53, 52, 0, DateTimeKind.Unspecified), "Giáo dục kinh tế và pháp luật Lớp 12", 12, true, "GDKT&PL 12", null }
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "MATH", "Môn Toán", 0, "Toán" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "PHY", "Môn Vật Lý", 0, "Vật Lý" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "CHEM", "Môn Hóa Học", 0, "Hóa Học" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "BIO", "Môn Sinh Học", 0, "Sinh Học" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "LIT", "Môn Ngữ Văn", 0, "Ngữ Văn" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "ENG", "Môn Tiếng Anh", 0, "Tiếng Anh" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "HIST", "Môn Lịch Sử", 0, "Lịch Sử" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "GEO", "Môn Địa Lý", 0, "Địa Lý" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Code", "Description", "GradeLevel", "Name" },
                values: new object[] { "GDKT&PL", "Giáo dục kinh tế và pháp luật", 0, "GDKT&PL" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$3hIrnRnhXnhAd60Y3dWEZ.nrHhtgQ7X2JvRLS0G3BXlXZuIG1V3Qa");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$MOu2TOQQvVvQGMTj6BLYOen9NL.z7Vxci691X9oeNyg9oWGR1TrXm");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$I/QpncIxJNwzpURc/Bc5Ve1610lTrsPQwT6YMM17QbZd4s8bO/w8m");
        }
    }
}
