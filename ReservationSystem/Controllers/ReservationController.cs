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
        [HttpGet("{id}")]
        public async Task<ActionResult<Reservation>> GetReservation(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Resource)
                .Include(r => r.Status)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
                return NotFound();

            return reservation;
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
            
            var reservation = new Reservation
            {
                ResourceId = dto.ResourceId,
                UserId = dto.UserId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                StatusId = 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, reservation);
        }

        //UPDATE approve
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveReservation(int id, [FromBody] UpdateReservationStatusDto dto)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            reservation.StatusId = 2;
            reservation.ApprovedById = dto.AdminId;
            reservation.Comment = dto.Comment;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        //UPDATE reject
        [HttpPut("reject/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectReservation(int id, [FromBody] UpdateReservationStatusDto dto)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            reservation.StatusId = 3;
            reservation.ApprovedById = dto.AdminId;
            reservation.Comment = dto.Comment;

            await _context.SaveChangesAsync();
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
