using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace webthitn_backend.Swagger
{
    public class QuestionExamplesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Chỉ áp dụng filter cho POST api/Question
            if (context.ApiDescription.RelativePath != "api/Question" ||
                context.ApiDescription.HttpMethod != "POST")
                return;

            // Kiểm tra xem request body có tồn tại không
            if (operation.RequestBody == null ||
                !operation.RequestBody.Content.ContainsKey("application/json"))
                return;

            // Tạo các examples
            var examples = new Dictionary<string, OpenApiExample>
            {
                {
                    "Trắc nghiệm một đáp án (QuestionType=1)",
                    new OpenApiExample
                    {
                        Summary = "Câu hỏi trắc nghiệm một đáp án",
                        Description = "Câu hỏi dạng chọn một đáp án đúng trong nhiều đáp án (a, b, c, d)",
                        Value = CreateOpenApiObject(GetQuestionTypeOneExample())
                    }
                },
                {
                    "Đúng-sai nhiều ý (QuestionType=2)",
                    new OpenApiExample
                    {
                        Summary = "Câu hỏi đúng-sai nhiều ý",
                        Description = "Câu hỏi dạng chọn nhiều đáp án đúng trong số các phát biểu (true/false)",
                        Value = CreateOpenApiObject(GetQuestionTypeTwoExample())
                    }
                },
                {
                    "Trả lời ngắn (QuestionType=3)",
                    new OpenApiExample
                    {
                        Summary = "Câu hỏi trả lời ngắn",
                        Description = "Câu hỏi dạng nhập câu trả lời ngắn với nhiều phương án đáp án chấp nhận được",
                        Value = CreateOpenApiObject(GetQuestionTypeThreeExample())
                    }
                }
            };

            // Gán các examples vào request body
            operation.RequestBody.Content["application/json"].Examples = examples;
        }

        private IOpenApiAny CreateOpenApiObject(object obj)
        {
            var json = JsonSerializer.Serialize(obj);
            using var doc = JsonDocument.Parse(json);
            return ConvertJsonElement(doc.RootElement);
        }

        private IOpenApiAny ConvertJsonElement(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    var obj = new OpenApiObject();
                    foreach (var prop in element.EnumerateObject())
                    {
                        obj.Add(prop.Name, ConvertJsonElement(prop.Value));
                    }
                    return obj;

                case JsonValueKind.Array:
                    var arr = new OpenApiArray();
                    foreach (var item in element.EnumerateArray())
                    {
                        arr.Add(ConvertJsonElement(item));
                    }
                    return arr;

                case JsonValueKind.String:
                    return new OpenApiString(element.GetString());

                case JsonValueKind.Number:
                    if (element.TryGetInt32(out int intValue))
                        return new OpenApiInteger(intValue);
                    else if (element.TryGetDecimal(out decimal decValue))
                        return new OpenApiDouble((double)decValue);
                    else
                        return new OpenApiDouble(element.GetDouble());

                case JsonValueKind.True:
                case JsonValueKind.False:
                    return new OpenApiBoolean(element.GetBoolean());

                case JsonValueKind.Null:
                default:
                    return new OpenApiNull();
            }
        }

        // Mẫu câu hỏi trắc nghiệm một đáp án (QuestionType=1)
        private object GetQuestionTypeOneExample()
        {
            return new
            {
                content = "Tính giới hạn của hàm số f(x) = sin(x)/x khi x tiến đến 0",
                explanation = "Áp dụng định lý L'Hospital ta có giới hạn bằng 1",
                subjectId = 1,
                chapterId = 2,
                questionLevelId = 3,
                questionType = 1,
                tags = "giới hạn,đạo hàm",
                suggestedTime = 60,
                defaultScore = 1,
                isActive = true,
                scoringConfig = "",
                shortAnswerConfig = "",
                options = new[]
                {
                    new {
                        content = "1",
                        isCorrect = true,
                        orderIndex = 1,
                        label = "A",
                        explanation = "Đúng. Đạo hàm f'(x) = cos(x)/1 khi x=0 nên f'(0) = 1",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 100
                    },
                    new {
                        content = "0",
                        isCorrect = false,
                        orderIndex = 2,
                        label = "B",
                        explanation = "Sai. Đáp án không phải là 0",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 0
                    },
                    new {
                        content = "∞",
                        isCorrect = false,
                        orderIndex = 3,
                        label = "C",
                        explanation = "Sai. Giới hạn có giá trị hữu hạn",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 0
                    },
                    new {
                        content = "Không tồn tại",
                        isCorrect = false,
                        orderIndex = 4,
                        label = "D",
                        explanation = "Sai. Giới hạn này tồn tại và bằng 1",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 0
                    }
                }
            };
        }

        // Mẫu câu hỏi đúng-sai nhiều ý (QuestionType=2)
        private object GetQuestionTypeTwoExample()
        {
            return new
            {
                content = "Chọn các phát biểu đúng về hàm số y = x^2",
                explanation = "Phân tích hàm số bậc hai y = x^2",
                subjectId = 1,
                chapterId = 2,
                questionLevelId = 2,
                questionType = 2,
                tags = "hàm số bậc hai,đạo hàm,tích phân",
                suggestedTime = 120,
                defaultScore = 2,
                isActive = true,
                scoringConfig = "{\"1_correct\": 0.25, \"2_correct\": 0.50, \"3_correct\": 0.75, \"4_correct\": 1.00}",
                shortAnswerConfig = "",
                options = new[]
                {
                    new {
                        content = "Hàm số là chẵn",
                        isCorrect = true,
                        orderIndex = 1,
                        label = "A",
                        explanation = "Đúng. Vì f(-x) = (-x)^2 = x^2 = f(x)",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = true,
                        groupId = 1,
                        scorePercentage = 25
                    },
                    new {
                        content = "Hàm số có đạo hàm bằng 2x",
                        isCorrect = true,
                        orderIndex = 2,
                        label = "B",
                        explanation = "Đúng. Đạo hàm của x^2 là f'(x) = 2x",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = true,
                        groupId = 2,
                        scorePercentage = 25
                    },
                    new {
                        content = "Hàm số có đồ thị là đường thẳng",
                        isCorrect = false,
                        orderIndex = 3,
                        label = "C",
                        explanation = "Sai. Đồ thị của hàm số y = x^2 là parabol",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = true,
                        groupId = 3,
                        scorePercentage = 0
                    },
                    new {
                        content = "Tích phân của hàm số từ 0 đến 1 bằng 1/2",
                        isCorrect = false,
                        orderIndex = 4,
                        label = "D",
                        explanation = "Sai. Tích phân từ 0 đến 1 của x^2 là 1/3",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = true,
                        groupId = 4,
                        scorePercentage = 0
                    }
                }
            };
        }

        // Mẫu câu hỏi trả lời ngắn (QuestionType=3)
        private object GetQuestionTypeThreeExample()
        {
            return new
            {
                content = "Cho biết thủ đô của Việt Nam",
                explanation = "Thủ đô của Việt Nam là Hà Nội",
                subjectId = 2,
                chapterId = 3,
                questionLevelId = 1,
                questionType = 3,
                tags = "địa lý,thủ đô,việt nam",
                suggestedTime = 30,
                defaultScore = 1,
                isActive = true,
                scoringConfig = "",
                shortAnswerConfig = "{\"case_sensitive\": false, \"exact_match\": false, \"partial_credit\": true, \"partial_credit_percent\": 50, \"allow_similar\": true, \"similarity_threshold\": 80}",
                options = new[]
                {
                    new {
                        content = "Hà Nội",
                        isCorrect = true,
                        orderIndex = 1,
                        label = "",
                        explanation = "Đây là đáp án chính xác",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 100
                    },
                    new {
                        content = "Ha Noi",
                        isCorrect = true,
                        orderIndex = 2,
                        label = "",
                        explanation = "Đáp án đúng nhưng không có dấu",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 80
                    },
                    new {
                        content = "Hanoi",
                        isCorrect = true,
                        orderIndex = 3,
                        label = "",
                        explanation = "Đáp án đúng nhưng viết liền, không dấu",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 70
                    },
                    new {
                        content = "Thủ đô Hà Nội",
                        isCorrect = true,
                        orderIndex = 4,
                        label = "",
                        explanation = "Đáp án đúng nhưng thêm từ 'Thủ đô'",
                        matchingValue = "",
                        isPartOfTrueFalseGroup = false,
                        groupId = 0,
                        scorePercentage = 90
                    }
                }
            };
        }
    }
}