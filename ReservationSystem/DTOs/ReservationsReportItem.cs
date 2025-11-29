namespace ReservationSystem.DTOs
{
    public class ReservationsReportItem
    {
        public int ResourceId { get; set; }
        public string ResourceName { get; set; } = default!;
        public int ReservationsCount { get; set; }
        public double ReservedHours { get; set; }
    }
}
