namespace ReservationSystem.Entities
{
    public class LogEntry
    {
        public int Id { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        public string Action { get; set; } = default!; 
        public string? Details { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
