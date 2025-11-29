using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.DTOs
{
    public class UpdateUserReservationDto
    {
        [Required]
        public int ResourceId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }
    }
}
