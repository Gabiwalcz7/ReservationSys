using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Data;
using ReservationSystem.DTOs;

namespace ReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }      

        [HttpGet("reservations/{resourceId:int}/details")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ReservationsReportItemDto>>> GetReservationDetails(
        int resourceId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
        {
            var query = _context.Reservations
                .Include(r => r.Resource)
                .Include(r => r.Status)
                .Include(r => r.User)
                .Where(r => r.ResourceId == resourceId);

            if (from.HasValue)
                query = query.Where(r => r.StartTime >= from.Value);
            if (to.HasValue)
                query = query.Where(r => r.EndTime <= to.Value);

            var list = await query
                .OrderByDescending(r => r.StartTime)
                .Select(r => new ReservationsReportItemDto
                {
                    Id = r.Id,
                    ResourceId = r.ResourceId,
                    ResourceName = r.Resource.Name,
                    UserId = r.UserId,
                    UserName = r.User.FullName,
                    UserEmail = r.User.Email,
                    StartTime = r.StartTime,
                    EndTime = r.EndTime,
                    StatusId = r.StatusId,
                    StatusName = r.Status.Name
                })
                .ToListAsync();

            return list;
        }
    }
}
