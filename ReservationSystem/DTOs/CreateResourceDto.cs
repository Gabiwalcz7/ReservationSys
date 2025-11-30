using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.DTOs
{
    public class CreateResourceDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = default!;

        public bool IsActive { get; set; } = true;

        [Required]
        public int ResourceTypeId { get; set; }
    }
}
