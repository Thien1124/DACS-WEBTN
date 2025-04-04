using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using webthitn_backend.Models;
using webthitn_backend.Models.Applications;

namespace webthitn_backend.Services
{
    public static class JwtRoleValidationExtension
    {
        public static void AddJwtRoleValidation(this JwtBearerOptions options)
        {
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = async context =>
                {
                    var dbContext = context.HttpContext.RequestServices
                        .GetRequiredService<ApplicationDbContext>();

                    var username = context.Principal.Identity.Name;

                    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == username);

                    if (user == null || !user.IsActive)
                    {
                        context.Fail("Unauthorized");
                    }
                }
            };
        }
    }
}