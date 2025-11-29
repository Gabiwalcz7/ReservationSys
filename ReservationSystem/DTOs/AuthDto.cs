using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.DTOs
{
    public class RegisterDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        [Required, StringLength(100)]
        public string FullName { get; set; } = default!;

        [Required, StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = default!;
    }

    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        public string Password { get; set; } = default!;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
        public string Email { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Role { get; set; } = default!;
    }
}
