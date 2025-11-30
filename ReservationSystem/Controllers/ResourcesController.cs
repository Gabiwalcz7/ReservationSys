using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Data;
using ReservationSystem.DTOs;
using ReservationSystem.Entities;

namespace ReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResourcesController(AppDbContext context)
        {
            _context = context;
        }

        //GET ALL
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResources()
        {
            return await _context.Resources
                .Include(r => r.ResourceType)
                .ToListAsync();
        }

        //Get by id
        [HttpGet("{id}")]
        public async Task<ActionResult<Resource>> GetResource(int id)
        {
            var resource = await _context.Resources
                .Include(r => r.ResourceType)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (resource == null)
                return NotFound();

            return resource;
        }

        //CREATE
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Resource>> CreateResource(CreateResourceDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            bool nameExists = await _context.Resources
                .AnyAsync(r => r.Name.ToLower() == dto.Name.ToLower());

            if (nameExists)
                return BadRequest("Resource with this name already exists.");

            var resourceType = await _context.ResourceTypes.FindAsync(dto.ResourceTypeId);
            if (resourceType == null)
                return BadRequest("ResourceType not found.");

            var resource = new Resource
            {
                Name = dto.Name,
                IsActive = dto.IsActive,
                ResourceTypeId = dto.ResourceTypeId
            };

            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResource), new { id = resource.Id }, resource);
        }

        //UPDATE
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateResource(int id, CreateResourceDto dto)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
                return NotFound();

            var resourceType = await _context.ResourceTypes.FindAsync(dto.ResourceTypeId);
            if (resourceType == null)
                return BadRequest("ResourceType not found.");

            resource.Name = dto.Name;
            resource.IsActive = dto.IsActive;
            resource.ResourceTypeId = dto.ResourceTypeId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        //DELETE
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteResource(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
                return NotFound();

            bool hasReservations = await _context.Reservations
                .AnyAsync(r => r.ResourceId == id);

            if (hasReservations)
                return BadRequest("Nie można usunąć zasobu, ponieważ istnieją powiązane rezerwacje.");

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
