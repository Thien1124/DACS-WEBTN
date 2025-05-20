using System.ComponentModel.DataAnnotations;

namespace webthitn_backend.DTOs
{
    public class AssignClassDTO
    {
        [Required(ErrorMessage = "Tên lớp không được để trống")]
        public string ClassroomName { get; set; }
    }
}