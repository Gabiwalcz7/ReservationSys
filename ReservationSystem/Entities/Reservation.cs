namespace ReservationSystem.Entities
{
    public class Reservation
    {
        public int Id { get; set; }

        public int ResourceId { get; set; }
        public Resource Resource { get; set; } = default!;

        public int UserId { get; set; }
        public User User { get; set; } = default!;

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public int StatusId { get; set; }
        public ReservationStatus Status { get; set; } = default!;

        public int? ApprovedById { get; set; }
        public User? ApprovedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Comment { get; set; }
    }
}
