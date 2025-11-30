namespace ReservationSystem.Entities
{
    public class ResourceType
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;

        public ICollection<Resource> Resources { get; set; } = new List<Resource>();
    }
}
