using Microsoft.EntityFrameworkCore;
using webthitn_backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình DbContext để kết nối với cơ sở dữ liệu
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cấu hình CORS (Cross-Origin Resource Sharing)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() // Cho phép mọi nguồn
              .AllowAnyMethod() // Cho phép mọi phương thức (GET, POST, PUT, DELETE...)
              .AllowAnyHeader(); // Cho phép mọi header
    });
});

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Thêm dịch vụ Swagger để hiển thị API tài liệu
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
        Description = "Please enter your JWT with 'Bearer' prefix"
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

// Thêm dịch vụ các API Controllers
builder.Services.AddControllers();

// Build ứng dụng
var app = builder.Build();

// Cấu hình middleware cho Swagger UI trong môi trường phát triển
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebThitn Backend API v1");
        c.RoutePrefix = string.Empty; // Đặt Swagger UI ở URL gốc của ứng dụng (http://localhost:5006)
    });
}

// Sử dụng CORS
app.UseCors("AllowAll");

// Sử dụng Authentication và Authorization cho API
app.UseAuthentication();
app.UseAuthorization();

// Định tuyến các Controller
app.MapControllers();

// Chạy ứng dụng
app.Run();
