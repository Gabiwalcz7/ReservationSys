using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.DTOs
{
    public class UpdateUserProfileDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = default!;

        public string? NewPassword { get; set; }
    }
}
