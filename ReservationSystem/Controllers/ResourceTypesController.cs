using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Data;
using ReservationSystem.Entities;

namespace ReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourceTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResourceTypesController(AppDbContext context)
        {
            _context = context;
        }

        //GET ALL
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResourceType>>> GetResourceTypes()
        {
            return await _context.ResourceTypes.ToListAsync();
        }

        //DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResourceType(int id)
        {
            var type = await _context.ResourceTypes.FindAsync(id);
            if (type == null)
                return NotFound();

            _context.ResourceTypes.Remove(type);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
