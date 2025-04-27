using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;

namespace webthitn_backend.Swagger
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formFileParams = context.MethodInfo.GetParameters()
                .Where(p => p.ParameterType == typeof(Microsoft.AspNetCore.Http.IFormFile));

            foreach (var formFileParam in formFileParams)
            {
                var propertyName = formFileParam.Name;

                // Thay thế schema cho tham số IFormFile
                if (operation.RequestBody != null &&
                    operation.RequestBody.Content.TryGetValue("multipart/form-data", out var mediaType))
                {
                    mediaType.Schema.Properties[propertyName] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary"
                    };
                }
                else
                {
                    // Nếu chưa có content type multipart/form-data, tạo mới
                    operation.RequestBody = new OpenApiRequestBody
                    {
                        Content = new Dictionary<string, OpenApiMediaType>
                        {
                            ["multipart/form-data"] = new OpenApiMediaType
                            {
                                Schema = new OpenApiSchema
                                {
                                    Type = "object",
                                    Properties = new Dictionary<string, OpenApiSchema>
                                    {
                                        [propertyName] = new OpenApiSchema
                                        {
                                            Type = "string",
                                            Format = "binary"
                                        }
                                    }
                                }
                            }
                        },
                        Required = true
                    };
                }
            }
        }
    }
}