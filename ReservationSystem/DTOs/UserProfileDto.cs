namespace ReservationSystem.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string RoleName { get; set; } = default!;
    }
}
