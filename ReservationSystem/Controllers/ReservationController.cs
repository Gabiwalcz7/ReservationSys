using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Data;
using ReservationSystem.DTOs;
using ReservationSystem.Entities;
using System.Security.Claims;

namespace ReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReservationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservationController(AppDbContext context)
        {
            _context = context;
        }

        //GET ALL
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetReservations()
        {
            return await _context.Reservations
                .Include(r => r.Resource)
                .Include(r => r.Status)
                .Include(r => r.User)
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Reservation>> GetReservationById(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Resource)
                .Include(r => r.Status)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
                return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;

            if (!User.IsInRole("Admin")
                && int.TryParse(userIdClaim, out var currentUserId)
                && reservation.UserId != currentUserId)
            {
                return Forbid();
            }

            return reservation;
        }

        //GET by id
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetReservationsByUser(int userId)
        {
            var reservations = await _context.Reservations
                .Include(r => r.Resource)
                .Include(r => r.Status)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();

            return reservations;
        }

        [HttpPut("user/{id}")]
        public async Task<IActionResult> UpdateUserReservation(int id, [FromBody] UpdateUserReservationDto dto)
        {
            var reservation = await _context.Reservations
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
                return NotFound("Reservation not found.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userIdClaim)
                && !User.IsInRole("Admin")
                && int.TryParse(userIdClaim, out var currentUserId)
                && reservation.UserId != currentUserId)
            {
                return Forbid();
            }

            if (reservation.StatusId != 1)
                return BadRequest("Only pending reservations can be edited.");

            bool overlap = await _context.Reservations.AnyAsync(r =>
                r.Id != id &&
                r.ResourceId == dto.ResourceId &&
                r.StatusId != 3 &&
                r.StatusId != 4 &&
                (
                    (dto.StartTime >= r.StartTime && dto.StartTime < r.EndTime) ||
                    (dto.EndTime > r.StartTime && dto.EndTime <= r.EndTime) ||
                    (dto.StartTime <= r.StartTime && dto.EndTime >= r.EndTime)
                )
            );

            if (overlap)
                return Conflict("This resource is already reserved for the selected time range.");

            var sql = @"
                UPDATE Reservations
                SET ResourceId = {0},
                    StartTime = {1},
                    EndTime = {2}
                WHERE Id = {3};
            ";

            await _context.Database.ExecuteSqlRawAsync(sql,
                dto.ResourceId,
                dto.StartTime,
                dto.EndTime,
                id);

            return NoContent();
        }

        //CREATE
        [HttpPost]
        public async Task<ActionResult<Reservation>> CreateReservation(CreateReservationDto dto)
        {
            var resource = await _context.Resources.FindAsync(dto.ResourceId);
            if (resource == null)
                return BadRequest("Resource not found.");

            if (!resource.IsActive)
                return BadRequest("Resource is inactive.");

            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return BadRequest("User not found.");


            bool overlap = await _context.Reservations.AnyAsync(r =>
                r.ResourceId == dto.ResourceId &&
                r.StatusId != 3 && 
                r.StatusId != 4 && 
                (
                    (dto.StartTime >= r.StartTime && dto.StartTime < r.EndTime) ||
                    (dto.EndTime > r.StartTime && dto.EndTime <= r.EndTime) ||
                    (dto.StartTime <= r.StartTime && dto.EndTime >= r.EndTime)
                )
            );

            if (overlap)
                return Conflict("This resource is already reserved for the selected time range.");

            var sql = "EXEC dbo.sp_CreateReservation @ResourceId = {0}, @UserId = {1}, @StartTime = {2}, @EndTime = {3}";
            await _context.Database.ExecuteSqlRawAsync(sql,
                dto.ResourceId,
                dto.UserId,
                dto.StartTime,
                dto.EndTime);

            return Ok("Reservation created.");
        }

        //UPDATE approve
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveReservation(int id, [FromBody] UpdateReservationStatusDto dto)
        {
            // sprawdź, czy rezerwacja istnieje
            var exists = await _context.Reservations.AnyAsync(r => r.Id == id);
            if (!exists)
                return NotFound();

            var sql = @"
                UPDATE Reservations
                SET StatusId = 2,
                    ApprovedById = {0},
                    Comment = {1}
                WHERE Id = {2};
            ";

            await _context.Database.ExecuteSqlRawAsync(sql, dto.AdminId, dto.Comment ?? string.Empty, id);

            return NoContent();
        }

        //UPDATE reject
        [HttpPut("reject/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectReservation(int id, [FromBody] UpdateReservationStatusDto dto)
        {
            var exists = await _context.Reservations.AnyAsync(r => r.Id == id);
            if (!exists)
                return NotFound();

            var sql = @"
                UPDATE Reservations
                SET StatusId = 3,
                    ApprovedById = {0},
                    Comment = {1}
                WHERE Id = {2};
            ";

            await _context.Database.ExecuteSqlRawAsync(sql, dto.AdminId, dto.Comment ?? string.Empty, id);

            return NoContent();
        }

        //DELETE
        [HttpDelete("user/{id}")]
        public async Task<IActionResult> DeleteUserReservation(int id)
        {
            var reservation = await _context.Reservations
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
                return NotFound("Reservation not found.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userIdClaim)
                && !User.IsInRole("Admin")
                && int.TryParse(userIdClaim, out var currentUserId)
                && reservation.UserId != currentUserId)
            {
                return Forbid();
            }

            var sql = @"DELETE FROM Reservations WHERE Id = {0};";
            await _context.Database.ExecuteSqlRawAsync(sql, id);

            return NoContent();
        }
    }
}
