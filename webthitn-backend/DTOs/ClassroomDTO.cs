namespace webthitn_backend.DTOs
{
    public class CreateClassroomDTO
    {
        public string Name { get; set; }
        public string Grade { get; set; }
        public string School { get; set; }
    }

    public class UpdateClassroomDTO
    {
        public string NewName { get; set; }
        public string Grade { get; set; }
        public string School { get; set; }
    }
}