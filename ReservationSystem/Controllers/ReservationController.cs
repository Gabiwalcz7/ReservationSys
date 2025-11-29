using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Data;
using ReservationSystem.Entities;
using ReservationSystem.DTOs;
using Microsoft.AspNetCore.Authorization;

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
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
