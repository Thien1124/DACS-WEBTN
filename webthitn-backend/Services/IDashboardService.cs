using webthitn_backend.DTOs;

namespace webthitn_backend.Services
{
    public interface IDashboardService
    {
       Task<DashboardResponseDTO> GetStudentDashboardAsync(int userId);
        
    }
}