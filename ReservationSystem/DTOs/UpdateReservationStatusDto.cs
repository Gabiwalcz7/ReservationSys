using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.DTOs
{
    public class UpdateReservationStatusDto
    {
        [Required]
        public int AdminId { get; set; }

        [StringLength(500)]
        public string? Comment { get; set; }
    }
}
