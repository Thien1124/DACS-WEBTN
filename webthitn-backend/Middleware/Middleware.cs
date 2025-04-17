using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace webthitn_backend.Middleware
{
    public class JsonTokenAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<JsonTokenAuthenticationMiddleware> _logger;

        public JsonTokenAuthenticationMiddleware(RequestDelegate next, ILogger<JsonTokenAuthenticationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Kiểm tra nếu có header Authorization
            if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var authValue = authHeader.ToString();
                _logger.LogInformation($"Processing Authorization header: {(authValue.Length > 20 ? authValue.Substring(0, 20) + "..." : authValue)}");

                // Kiểm tra xem header có phải là JSON format không
                if (authValue.StartsWith("{") && authValue.EndsWith("}"))
                {
                    _logger.LogInformation("Authorization header is in JSON format");
                    try
                    {
                        // Parse JSON để lấy token
                        using (JsonDocument doc = JsonDocument.Parse(authValue))
                        {
                            if (doc.RootElement.TryGetProperty("token", out JsonElement tokenElement))
                            {
                                var token = tokenElement.GetString();
                                if (!string.IsNullOrEmpty(token))
                                {
                                    _logger.LogInformation($"Found token in JSON: {token.Substring(0, Math.Min(20, token.Length))}...");

                                    // Thay thế header với định dạng Bearer
                                    context.Request.Headers.Remove("Authorization");
                                    context.Request.Headers.Append("Authorization", $"Bearer {token}");

                                    _logger.LogInformation("Successfully converted JSON token to Bearer format");
                                }
                                else
                                {
                                    _logger.LogWarning("Token in JSON is empty");
                                }
                            }
                            else
                            {
                                _logger.LogWarning("No 'token' property found in JSON");
                            }
                        }
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError($"Error parsing JSON token: {ex.Message}");
                    }
                }
                else if (!authValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("Authorization header doesn't have Bearer prefix, adding prefix");
                    context.Request.Headers.Remove("Authorization");
                    context.Request.Headers.Append("Authorization", $"Bearer {authValue}");
                    _logger.LogInformation("Added Bearer prefix to Authorization header");
                }
                else
                {
                    _logger.LogInformation("Authorization header already in Bearer format, no changes needed");
                }
            }
            else
            {
                _logger.LogInformation("No Authorization header found");
            }

            // Tiếp tục với middleware tiếp theo
            await _next(context);
        }
    }
}