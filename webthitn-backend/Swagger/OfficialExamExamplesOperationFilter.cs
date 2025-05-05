using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using webthitn_backend.Controllers;
using webthitn_backend.DTOs;

namespace webthitn_backend.Swagger
{
    public class OfficialExamExamplesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var methodName = context.MethodInfo.Name;

            if (methodName == nameof(OfficialExamController.CreateOfficialExam))
            {
                var requestSchema = operation.RequestBody.Content["application/json"].Schema;

                var example = new OpenApiObject
                {
                    ["title"] = new OpenApiString("Kỳ thi giữa kỳ môn Toán 12"),
                    ["description"] = new OpenApiString("Kỳ thi giữa học kỳ 1 năm học 2025-2026"),
                    ["examId"] = new OpenApiInteger(1),
                    ["startTime"] = new OpenApiString("2025-06-15T08:00:00"),
                    ["endTime"] = new OpenApiString("2025-06-15T10:00:00"),
                    ["classroomId"] = new OpenApiInteger(1),
                    ["studentIds"] = new OpenApiArray
                    {
                        new OpenApiInteger(5),
                        new OpenApiInteger(6),
                        new OpenApiInteger(7)
                    }
                };

                operation.RequestBody.Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["Default"] = new OpenApiExample
                    {
                        Value = example,
                        Summary = "Kỳ thi mới"
                    }
                };
            }
            else if (methodName == nameof(OfficialExamController.AssignStudents))
            {
                var requestSchema = operation.RequestBody.Content["application/json"].Schema;

                var example = new OpenApiObject
                {
                    ["studentIds"] = new OpenApiArray
                    {
                        new OpenApiInteger(5),
                        new OpenApiInteger(6),
                        new OpenApiInteger(7)
                    }
                };

                operation.RequestBody.Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["Default"] = new OpenApiExample
                    {
                        Value = example,
                        Summary = "Danh sách học sinh"
                    }
                };
            }
        }
    }
}