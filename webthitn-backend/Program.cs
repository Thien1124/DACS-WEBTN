using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OfficeOpenXml;
using Swashbuckle.AspNetCore.Filters;
using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using webthitn_backend.Helpers;
using webthitn_backend.Middleware;
using webthitn_backend.Middlewares;
using webthitn_backend.Models;
using webthitn_backend.Services;
using webthitn_backend.Swagger;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký các dịch vụ
builder.Services.AddScoped<IExamGradingService, ExamGradingService>();
builder.Services.AddSingleton<EmailService>();

// Cấu hình DbContext để kết nối với cơ sở dữ liệu
// ĐÃ SỬA: Tắt ExecutionStrategy bằng cách đặt maxRetryCount = 0
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions =>
        {
            // Đặt maxRetryCount = 0 để tắt SqlServerRetryingExecutionStrategy
            sqlServerOptions.EnableRetryOnFailure(
                maxRetryCount: 0,  // Tắt retry - trước đây là 5
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
            sqlServerOptions.CommandTimeout(60);
            // Cấu hình tương thích với các phiên bản SQL Server khác nhau
            sqlServerOptions.UseCompatibilityLevel(120); // SQL Server 2014 compatibility level
            // Vô hiệu hóa tracking để tăng hiệu suất cho các truy vấn chỉ đọc
            // options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
        }
    )
);

// Cấu hình EPPlus (Excel)
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

// Cấu hình Authentication với JWT Bearer Token
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
            ClockSkew = TimeSpan.Zero // Để token hết hạn đúng thời điểm
        };

        // Thêm event handlers để debug
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token validated successfully");
                return Task.CompletedTask;
            },
            OnMessageReceived = context =>
            {
                Console.WriteLine("JWT Bearer auth scheme: Token received");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"JWT Bearer auth scheme: Challenge for path {context.Request.Path}");
                return Task.CompletedTask;
            }
        };
    });

// Cấu hình CORS để cho phép frontend gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMyOrigin",
        builder =>
        {
            builder
                .WithOrigins(
                    "http://localhost:3000",
                    "https://webthitn.vn" // Thêm domain production nếu có
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // Cho phép credentials nếu cần
        });
});

// Thêm logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();

    // Tùy chọn: Thêm cấu hình log file
    // logging.AddFile("Logs/webthitn-{Date}.log");
});

// Cấu hình Swagger để tài liệu hóa các API
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Web Thi TN API",
        Version = "v1",
        Description = "API cho hệ thống thi trắc nghiệm trực tuyến",
        Contact = new OpenApiContact
        {
            Name = "Thien1124",
            Email = "thien1124@example.com"
        }
    });

    // Thêm file XML Documentation
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Thêm file XML cho các model
    c.OperationFilter<FileUploadOperationFilter>();
    c.OperationFilter<QuestionExamplesOperationFilter>();

    // Cấu hình Authorization
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Thêm các dịch vụ API Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Cấu hình xử lý DateTime trong JSON response
        options.JsonSerializerOptions.Converters.Add(new JsonDateTimeConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Thêm dịch vụ Memory Cache nếu cần
builder.Services.AddMemoryCache();

// Thêm HttpClient Factory nếu cần gọi API bên ngoài
builder.Services.AddHttpClient();

// Xây dựng ứng dụng
var app = builder.Build();

// Middleware xử lý lỗi toàn cầu (thêm mới)
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Middleware Swagger 
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Web Thi TN API v1");
    c.RoutePrefix = "swagger";
});

// Sử dụng CORS
app.UseCors("AllowMyOrigin");

// Thêm middleware xử lý JSON token trước authentication
app.UseMiddleware<JsonTokenAuthenticationMiddleware>();

// Thêm middleware kiểm tra độ hợp lệ của đề thi
app.UseMiddleware<ExamValidationMiddleware>();

// Sử dụng Authentication và Authorization cho API
app.UseAuthentication();  // Đảm bảo yêu cầu token hợp lệ cho các API yêu cầu xác thực
app.UseAuthorization();   // Kiểm tra quyền truy cập của người dùng

// Định tuyến các Controllers
app.MapControllers();

// Áp dụng migrations tự động khi khởi động ứng dụng
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Áp dụng tất cả các migrations đang chờ
        context.Database.Migrate();

        // Log thành công
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        // Log lỗi
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while applying migrations to the database");
    }
}

// Chạy ứng dụng
app.Run();