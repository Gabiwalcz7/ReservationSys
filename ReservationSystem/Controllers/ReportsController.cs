using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        //GET ALL 
        [HttpGet("reservations")]
        public async Task<ActionResult<IEnumerable<ReservationsReportItem>>> GetReservationsReport(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            var data = await _context.ReservationsReportItems
                .FromSqlRaw(
                    "EXEC dbo.sp_GetReservationsReport @FromDate = {0}, @ToDate = {1}",
                    from, to)
                .ToListAsync();

            return Ok(data);
        }
    }
}
