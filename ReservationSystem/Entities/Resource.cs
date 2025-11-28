namespace ReservationSystem.Entities
{
    public class Resource
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public int? Capacity { get; set; }
        public bool IsActive { get; set; } = true;

        public int ResourceTypeId { get; set; }
        public ResourceType ResourceType { get; set; } = default!;

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
