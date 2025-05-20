using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var formFileParams = context.MethodInfo.GetParameters()
            .Where(p => p.ParameterType == typeof(IFormFile) || p.ParameterType == typeof(List<IFormFile>))
            .ToList();

        if (formFileParams.Count == 0)
            return;

        // Đảm bảo có consumes là multipart/form-data
        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = new Dictionary<string, OpenApiSchema>()
                    }
                }
            }
        };

        // Xử lý các tham số
        foreach (var parameter in context.MethodInfo.GetParameters())
        {
            var fromFormAttribute = parameter.GetCustomAttribute<Microsoft.AspNetCore.Mvc.FromFormAttribute>();

            if (parameter.ParameterType == typeof(IFormFile))
            {
                // Xử lý tham số IFormFile
                operation.RequestBody.Content["multipart/form-data"].Schema.Properties[parameter.Name] = new OpenApiSchema
                {
                    Type = "string",
                    Format = "binary",
                    Description = parameter.Name
                };
            }
            else if (parameter.ParameterType == typeof(List<IFormFile>))
            {
                // Xử lý tham số List<IFormFile>
                operation.RequestBody.Content["multipart/form-data"].Schema.Properties[parameter.Name] = new OpenApiSchema
                {
                    Type = "array",
                    Items = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary"
                    }
                };
            }
            else if (fromFormAttribute != null)
            {
                // Xử lý các tham số khác được đánh dấu [FromForm]
                var schema = context.SchemaGenerator.GenerateSchema(parameter.ParameterType, context.SchemaRepository);
                operation.RequestBody.Content["multipart/form-data"].Schema.Properties[parameter.Name] = schema;
            }
        }
    }
}