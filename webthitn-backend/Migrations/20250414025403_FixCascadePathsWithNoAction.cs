using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webthitn_backend.Migrations
{
    /// <inheritdoc />
    public partial class FixCascadePathsWithNoAction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Đầu tiên, xóa các ràng buộc khóa ngoại hiện có
            migrationBuilder.DropForeignKey(
                name: "FK_ExamQuestions_Exams_ExamId",
                table: "ExamQuestions");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamQuestions_Questions_QuestionId",
                table: "ExamQuestions");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamSessions_ExamResults_ExamResultId",
                table: "ExamSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_ExamResults_ExamResultId",
                table: "StudentAnswers");

            // Thay đổi chỉ mục cho ExamSessions.ExamResultId từ chỉ mục thông thường sang unique
            migrationBuilder.DropIndex(
                name: "IX_ExamSessions_ExamResultId",
                table: "ExamSessions");

            // Cập nhật mật khẩu trong dữ liệu seed - đây là những thay đổi tự động từ BCrypt
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$e2n8wdOBFmjS69Ga5dQ56.iRoQABOSfbPQ5vynTw07fpM4r67gZpm");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$R9C/paIj.BNtHE4.TV.y5eAaZ2qgVcWKRsMJk.8b.MG5zncmogEky");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$vp1S1npVbO02ogA.t9Oq9e1yYQ0Hj3/N7dgUIvvt2.JMXPqmwcyRi");

            // Đảm bảo ExamSessions.ExamResultId được phép null (nếu chưa)
            migrationBuilder.Sql("ALTER TABLE ExamSessions ALTER COLUMN ExamResultId INT NULL");

            // Tạo lại chỉ mục unique với filter [ExamResultId] IS NOT NULL
            migrationBuilder.CreateIndex(
                name: "IX_ExamSessions_ExamResultId",
                table: "ExamSessions",
                column: "ExamResultId",
                unique: true,
                filter: "[ExamResultId] IS NOT NULL");

            // Thêm lại các ràng buộc khóa ngoại nhưng với ON DELETE NO ACTION
            migrationBuilder.AddForeignKey(
                name: "FK_ExamQuestions_Exams_ExamId",
                table: "ExamQuestions",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamQuestions_Questions_QuestionId",
                table: "ExamQuestions",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamSessions_ExamResults_ExamResultId",
                table: "ExamSessions",
                column: "ExamResultId",
                principalTable: "ExamResults",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers",
                column: "ExamQuestionId",
                principalTable: "ExamQuestions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_ExamResults_ExamResultId",
                table: "StudentAnswers",
                column: "ExamResultId",
                principalTable: "ExamResults",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Ngược lại với Up(): xóa các ràng buộc NO ACTION và thay thế bằng RESTRICT
            migrationBuilder.DropForeignKey(
                name: "FK_ExamQuestions_Exams_ExamId",
                table: "ExamQuestions");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamQuestions_Questions_QuestionId",
                table: "ExamQuestions");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamSessions_ExamResults_ExamResultId",
                table: "ExamSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAnswers_ExamResults_ExamResultId",
                table: "StudentAnswers");

            migrationBuilder.DropIndex(
                name: "IX_ExamSessions_ExamResultId",
                table: "ExamSessions");

            // Khôi phục lại mật khẩu seed
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$NRRD3EKLZT2dfezmtK279ek2.P8gJUMye70f4PxdLZE1FM8zw4Phq");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$M3PNuYH48b9cFtFm7UWjmu2kB8WdgZ/UhuPnAyOwbIp.phKEt8JKu");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$JNx97xdmdzp4HGuLb1ARBuklE6ay1olLAWWjDfKexmmnlHQjyp7Ua");

            // Tạo lại chỉ mục thông thường (không unique)
            migrationBuilder.CreateIndex(
                name: "IX_ExamSessions_ExamResultId",
                table: "ExamSessions",
                column: "ExamResultId");

            // Thêm lại các ràng buộc RESTRICT
            migrationBuilder.AddForeignKey(
                name: "FK_ExamQuestions_Exams_ExamId",
                table: "ExamQuestions",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamQuestions_Questions_QuestionId",
                table: "ExamQuestions",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamSessions_ExamResults_ExamResultId",
                table: "ExamSessions",
                column: "ExamResultId",
                principalTable: "ExamResults",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_ExamQuestions_ExamQuestionId",
                table: "StudentAnswers",
                column: "ExamQuestionId",
                principalTable: "ExamQuestions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAnswers_ExamResults_ExamResultId",
                table: "StudentAnswers",
                column: "ExamResultId",
                principalTable: "ExamResults",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}