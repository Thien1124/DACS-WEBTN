using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;
using System.Collections.Generic;
using System;

namespace webthitn_backend.Infrastructure.Swagger
{
    public class SwaggerFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var fileUploadMime = "multipart/form-data";
            if (operation.RequestBody == null || !operation.RequestBody.Content.Any(x => x.Key.Equals(fileUploadMime, StringComparison.InvariantCultureIgnoreCase)))
                return;

            var fileParams = context.MethodInfo.GetParameters().Where(p => p.ParameterType == typeof(IFormFile)).ToList();
            if (fileParams.Count == 0)
                return;

            operation.RequestBody.Content[fileUploadMime].Schema.Properties =
                operation.RequestBody.Content[fileUploadMime].Schema.Properties ?? new Dictionary<string, OpenApiSchema>();

            foreach (var fileParam in fileParams)
            {
                // Thêm kiểm tra nếu key đã tồn tại thì không thêm nữa
                if (!operation.RequestBody.Content[fileUploadMime].Schema.Properties.ContainsKey(fileParam.Name))
                {
                    operation.RequestBody.Content[fileUploadMime].Schema.Properties.Add(fileParam.Name, new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary"
                    });
                }
            }
        }
    }
}