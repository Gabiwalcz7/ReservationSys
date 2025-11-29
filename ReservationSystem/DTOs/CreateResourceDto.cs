using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.DTOs
{
    public class CreateResourceDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = default!;

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(1, 1000, ErrorMessage = "Capacity must be between 1 and 1000.")]
        public int? Capacity { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public int ResourceTypeId { get; set; }
    }
}
