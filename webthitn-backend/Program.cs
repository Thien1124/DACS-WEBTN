using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.EntityFrameworkCore;
using webthitn_backend.Services;
using webthitn_backend.Middleware;
using System;
using System.Reflection;
using System.IO;
using webthitn_backend.Models;
using Swashbuckle.AspNetCore.Filters;
using webthitn_backend.Swagger;
using webthitn_backend.Helpers;
using System.Text.Json.Serialization;
using System.Text.Json;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using OfficeOpenXml.Table;
using webthitn_backend.Middlewares;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IExamGradingService, ExamGradingService>();
// Email service
builder.Services.AddSingleton<EmailService>();

// Cấu hình DbContext để kết nối với cơ sở dữ liệu
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
                .WithOrigins("http://localhost:3000") // Thay đổi thành domain của frontend bạn
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Thêm logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();
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
builder.Services.AddControllers();
// Cấu hình JSON Serializer để sử dụng JsonDateTimeConverter    
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Cấu hình xử lý DateTime trong JSON response
        options.JsonSerializerOptions.Converters.Add(new JsonDateTimeConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
var app = builder.Build();
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

// Chạy ứng dụng
app.Run();