using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OfficeOpenXml;
using Swashbuckle.AspNetCore.Filters;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using webthitn_backend.Helpers;
using webthitn_backend.Hubs;
using webthitn_backend.Middleware;
using webthitn_backend.Middlewares;
using webthitn_backend.Models;
using webthitn_backend.Services;
using webthitn_backend.Swagger;
using System.IO;
using webthitn_backend.Infrastructure.Swagger;
var builder = WebApplication.CreateBuilder(args);

// Đăng ký các dịch vụ
builder.Services.AddScoped<IExamGradingService, ExamGradingService>();
builder.Services.AddSingleton<EmailService>();

// Cấu hình DbContext để kết nối với cơ sở dữ liệu
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
            ClockSkew = TimeSpan.Zero, // Để token hết hạn đúng thời điểm
            NameClaimType = "sub" // Thêm dòng này
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
                
                // THÊM MỚI: Đảm bảo claim userId được thêm vào identity
                var userIdClaim = context.Principal.Claims.FirstOrDefault(c => 
                    c.Type == "userId" || c.Type == "sub");
                
                if (userIdClaim != null)
                {
                    var identity = context.Principal.Identity as ClaimsIdentity;
                    if (identity != null)
                    {
                        // Đảm bảo claim userId tồn tại trong identity
                        if (!context.Principal.HasClaim(c => c.Type == "userId"))
                        {
                            identity.AddClaim(new Claim("userId", userIdClaim.Value));
                        }
                    }
                }
                
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
        
        // THÊM MỚI: Map các claim từ token
        options.MapInboundClaims = true;
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
            Name = "Thien",
            Email = "npthien124@gmail.com"
        }
    });
    c.OperationFilter<OfficialExamExamplesOperationFilter>();
    c.OperationFilter<SwaggerFileOperationFilter>();
    c.EnableAnnotations();
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

builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 524288000; // 500MB
});
builder.Services.AddSignalR();
// Xây dựng ứng dụng
var app = builder.Build();


// Middleware Swagger 
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Web Thi TN API v1");
    c.RoutePrefix = "swagger";
});

// Sử dụng CORS
app.UseCors("AllowMyOrigin");

// Middleware để phục vụ file tĩnh mặc định
app.UseStaticFiles();

// Cấu hình phục vụ các thư mục lưu trữ file
var directories = new[]
{
    new { Path = "videos", RequestPath = "/api/files/videos" },
    new { Path = "thumbnails", RequestPath = "/api/files/thumbnails" },
    new { Path = "documents", RequestPath = "/api/files/documents" },
    new { Path = "images", RequestPath = "/api/files/images" },
    new { Path = "audios", RequestPath = "/api/files/audios" },
    new { Path = "uploads/avatars", RequestPath = "/uploads/avatars" }
};

// Tự động tạo các thư mục lưu trữ và cấu hình StaticFiles
string basePath = builder.Configuration["FileStorage:BasePath"];
if (!string.IsNullOrEmpty(basePath))
{
    foreach (var directory in directories)
    {
        string dirPath = Path.Combine(basePath, directory.Path);
        // Tạo thư mục nếu chưa tồn tại
        Directory.CreateDirectory(dirPath);

        // Cấu hình phục vụ file tĩnh
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(dirPath),
            RequestPath = directory.RequestPath
        });
    }
}
else
{
    // Log lỗi khi không có cấu hình basePath
    app.Logger.LogError("Không tìm thấy cấu hình FileStorage:BasePath trong appsettings.json");
}

// Thêm middleware xử lý JSON token trước authentication
app.UseMiddleware<JsonTokenAuthenticationMiddleware>();

// Sử dụng Authentication và Authorization cho API
app.UseAuthentication(); // Đảm bảo yêu cầu token hợp lệ

// Di chuyển middleware này sau authentication nhưng trước authorization
app.UseMiddleware<UserIdClaimMiddleware>();

// Thêm middleware kiểm tra độ hợp lệ của đề thi
app.UseMiddleware<ExamValidationMiddleware>();

app.UseAuthorization(); // Kiểm tra quyền truy cập

// Thêm middleware bảo vệ endpoint admin
app.UseMiddleware<AdminAuthorizationMiddleware>();

// Định tuyến các Controllers
app.MapControllers();
// Định tuyến các SignalR Hubs
app.MapHub<ChatHub>("/chatHub");

// Middleware xử lý lỗi toàn cầu
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Đoạn code hiện tại của bạn ở đầu file giữ nguyên
// ...

// Chạy ứng dụng
app.Run();

// Định nghĩa middleware để debug JWT - chuyển xuống ĐÂY sau app.Run()
public class JwtDebugMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<JwtDebugMiddleware> _logger;

    public JwtDebugMiddleware(RequestDelegate next, ILogger<JwtDebugMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Ghi log các claims của người dùng sau khi xác thực
        if (context.User.Identity.IsAuthenticated)
        {
            _logger.LogInformation($"Request path: {context.Request.Path} - User authenticated as: {context.User.Identity.Name}");
            foreach (var claim in context.User.Claims)
            {
                _logger.LogInformation($"Claim: {claim.Type} = {claim.Value}");
            }
        }
        else
        {
            _logger.LogWarning($"Request path: {context.Request.Path} - User not authenticated");
            if (context.Request.Headers.ContainsKey("Authorization"))
            {
                _logger.LogWarning("Authorization header is present but user is not authenticated");
            }
        }

        await _next(context);
    }
}