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

        public class ReservationReportDto
        {
            public int ResourceId { get; set; }
            public string ResourceName { get; set; } = string.Empty;
            public int TotalReservations { get; set; }
            public int PendingCount { get; set; }
            public int ApprovedCount { get; set; }
            public int RejectedCount { get; set; }
        }

        // GET
        [HttpGet("reservations")]
        public async Task<ActionResult<IEnumerable<ReservationReportDto>>> GetReservationReport(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var query = _context.Reservations
                .Include(r => r.Resource)
                .AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(r => r.StartTime >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(r => r.EndTime <= to.Value);
            }

            var result = await query
                .GroupBy(r => new { r.ResourceId, r.Resource.Name })
                .Select(g => new ReservationReportDto
                {
                    ResourceId = g.Key.ResourceId,
                    ResourceName = g.Key.Name,
                    TotalReservations = g.Count(),
                    PendingCount = g.Count(r => r.StatusId == 1),
                    ApprovedCount = g.Count(r => r.StatusId == 2),
                    RejectedCount = g.Count(r => r.StatusId == 3)
                })
                .OrderBy(r => r.ResourceName)
                .ToListAsync();

            return result;
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
