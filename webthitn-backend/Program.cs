using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using webthitn_backend.Models;
using Microsoft.EntityFrameworkCore;
using webthitn_backend.Services;
using webthitn_backend.Middleware;
using System;

var builder = WebApplication.CreateBuilder(args);

// Email service
builder.Services.AddSingleton<EmailService>();

// Cấu hình DbContext để kết nối với cơ sở dữ liệu
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()  // Cho phép mọi nguồn (origin)
              .AllowAnyHeader()  // Cho phép mọi header
              .AllowAnyMethod(); // Cho phép mọi phương thức (GET, POST, PUT, DELETE)
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
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebThitn Backend API", Version = "v1" });

    // Cấu hình Authorization cho Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Description = "Nhập JWT token ở đây (không cần thêm tiền tố 'Bearer')"
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

var app = builder.Build();

// Middleware Swagger 
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebThitn Backend API v1");
    c.RoutePrefix = "swagger";
});

// Sử dụng CORS
app.UseCors("AllowAll");

// Thêm middleware xử lý JSON token trước authentication
app.UseMiddleware<JsonTokenAuthenticationMiddleware>();

// Sử dụng Authentication và Authorization cho API
app.UseAuthentication();  // Đảm bảo yêu cầu token hợp lệ cho các API yêu cầu xác thực
app.UseAuthorization();   // Kiểm tra quyền truy cập của người dùng

// Định tuyến các Controllers
app.MapControllers();

// Chạy ứng dụng
app.Run();