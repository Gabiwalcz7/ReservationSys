using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Controllers;
using ReservationSystem.Data;
using ReservationSystem.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTests
{
    //do sprawdzenia czy metoda DeleteResource usuwa zasób gdy nie istnieją rezerwacje
    public class DeleteResourceTest
    {
        [Fact]
        public async Task DeleteResource_RemovesResource_WhenNoReservationsExist()
        {
            //Tworzenie bazy testowej w pamieci
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);

            //dodanie zasobu do bazy testowej
            var resource = new Resource
            {
                Id = 1,
                Name = "Test Resource",
                IsActive = true,
                ResourceTypeId = 1
            };

            context.Resources.Add(resource);
            await context.SaveChangesAsync();

            var controller = new ResourcesController(context);

            //usunięcie zasobu
            var result = await controller.DeleteResource(1);

            //powinno zwrócić NoContentResult
            Assert.IsType<NoContentResult>(result);

            //nie ma rezersacji, więc zasób powinien zostać usunięty
            var deletedResource = await context.Resources.FindAsync(1);
            Assert.Null(deletedResource);
        }
    }
}
