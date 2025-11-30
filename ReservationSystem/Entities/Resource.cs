namespace ReservationSystem.Entities
{
    public class Resource
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public bool IsActive { get; set; } = true;

        public int ResourceTypeId { get; set; }
        public ResourceType ResourceType { get; set; } = default!;

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
