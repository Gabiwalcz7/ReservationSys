namespace ReservationSystem.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
        public string FullName { get; set; } = default!;

        public int RoleId { get; set; }
        public Role Role { get; set; } = default!;

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<Reservation> ApprovedReservations { get; set; } = new List<Reservation>();
        public ICollection<LogEntry> LogEntries { get; set; } = new List<LogEntry>();
    }
}
