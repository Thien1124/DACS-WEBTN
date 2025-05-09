using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Http;

namespace webthitn_backend.Swagger
{
    public class FormFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formFileParams = context.MethodInfo.GetParameters()
                .Where(p => p.ParameterType == typeof(IFormFile) ||
                           (p.ParameterType.IsGenericType &&
                            p.ParameterType.GetGenericTypeDefinition() == typeof(List<>) &&
                            p.ParameterType.GenericTypeArguments[0] == typeof(IFormFile)));

            if (!formFileParams.Any())
                return;

            // Tạo content nếu chưa có
            if (operation.RequestBody == null)
                operation.RequestBody = new OpenApiRequestBody();

            if (operation.RequestBody.Content == null)
                operation.RequestBody.Content = new Dictionary<string, OpenApiMediaType>();

            // Thiết lập content type là multipart/form-data
            if (!operation.RequestBody.Content.ContainsKey("multipart/form-data"))
            {
                operation.RequestBody.Content["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = new Dictionary<string, OpenApiSchema>()
                    }
                };
            }

            // Xử lý từng tham số
            foreach (var param in context.MethodInfo.GetParameters())
            {
                // Xóa tham số khỏi danh sách tham số
                var existingParam = operation.Parameters.FirstOrDefault(p => p.Name == param.Name);
                if (existingParam != null)
                {
                    operation.Parameters.Remove(existingParam);
                }

                // Tạo schema dựa trên loại tham số
                OpenApiSchema paramSchema;

                if (param.ParameterType == typeof(IFormFile))
                {
                    paramSchema = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary"
                    };
                }
                else if (param.ParameterType.IsGenericType &&
                         param.ParameterType.GetGenericTypeDefinition() == typeof(List<>) &&
                         param.ParameterType.GenericTypeArguments[0] == typeof(IFormFile))
                {
                    paramSchema = new OpenApiSchema
                    {
                        Type = "array",
                        Items = new OpenApiSchema
                        {
                            Type = "string",
                            Format = "binary"
                        }
                    };
                }
                else
                {
                    // Tạo schema cho các tham số khác dựa trên loại dữ liệu
                    try
                    {
                        paramSchema = context.SchemaGenerator.GenerateSchema(param.ParameterType, context.SchemaRepository);
                    }
                    catch
                    {
                        // Fallback nếu không thể tạo schema
                        paramSchema = new OpenApiSchema { Type = "string" };
                    }
                }

                // Thêm schema vào properties
                operation.RequestBody.Content["multipart/form-data"].Schema.Properties[param.Name] = paramSchema;

                // Nếu tham số là bắt buộc, đánh dấu là required
                if (param.GetCustomAttributes<System.ComponentModel.DataAnnotations.RequiredAttribute>().Any() ||
                    !param.IsOptional)
                {
                    if (operation.RequestBody.Content["multipart/form-data"].Schema.Required == null)
                        operation.RequestBody.Content["multipart/form-data"].Schema.Required = new HashSet<string>();

                    operation.RequestBody.Content["multipart/form-data"].Schema.Required.Add(param.Name);
                }
            }

            // Đảm bảo requestBody là required nếu có tham số bắt buộc
            operation.RequestBody.Required = operation.RequestBody.Content["multipart/form-data"].Schema.Required?.Any() ?? false;
        }
    }
}