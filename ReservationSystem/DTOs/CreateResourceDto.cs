namespace ReservationSystem.DTOs
{
    public class CreateResourceDto
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public int? Capacity { get; set; }
        public bool IsActive { get; set; } = true;
        public int ResourceTypeId { get; set; }
    }
}
