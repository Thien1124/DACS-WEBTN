using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace webthitn_backend.Middlewares
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Kiểm tra nếu đây là request liên quan đến Swagger hoặc lỗi từ SwaggerGen
                if (IsSwaggerRelated(context, ex))
                {
                    // Log lỗi nhưng để Swagger xử lý nó
                    _logger.LogWarning(ex, "Swagger generation exception - bypassing exception handler");
                    throw; // Ném lại exception để được xử lý bởi pipeline mặc định
                }

                // Xử lý các exception khác như bình thường
                _logger.LogError(ex, "Unhandled exception");
                await HandleExceptionAsync(context, ex);
            }
        }

        private bool IsSwaggerRelated(HttpContext context, Exception ex)
        {
            // Kiểm tra nếu request path bắt đầu với /swagger
            bool isSwaggerPath = context.Request.Path.StartsWithSegments("/swagger");

            // Kiểm tra nếu exception liên quan đến Swagger
            bool isSwaggerException = ex is SwaggerGeneratorException ||
                                     (ex.InnerException != null && ex.InnerException is SwaggerGeneratorException) ||
                                     ex.GetType().FullName.Contains("Swagger");

            return isSwaggerPath || isSwaggerException;
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var errorDetail = exception.InnerException != null
                ? $"{exception.Message} | Inner Exception: {exception.InnerException.Message}"
                : exception.Message;

            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
            {
                Success = false,
                Message = "Đã xảy ra lỗi trong quá trình xử lý",
                Error = errorDetail,
                // Stack Trace chỉ hiển thị trong môi trường Development
                StackTrace = context.Request.Host.Value.Contains("localhost") ? exception.StackTrace : null
            }));
        }
    }
}