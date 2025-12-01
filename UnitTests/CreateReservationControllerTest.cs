using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Controllers;
using ReservationSystem.Data;
using ReservationSystem.DTOs;

namespace UnitTests
{
    //do sprawdzenia czy metoda CreateReservation zwraca BadRequest gdy zasób nie istnieje
    public class CreateReservationControllerTest
    {
        [Fact]
        public async Task CreateReservation_ReturnsBadRequest_WhenResourceNotFound()
        {
            //tworzenie bazy testowej w pamieci
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);
            var controller = new ReservationController(context);

            //tworz¹c bazê testow¹, nie dodajemy ¿adnych zasobów, wiêc ResourceId 1 nie istnieje
            var dto = new CreateReservationDto
            {
                ResourceId = 1,
                UserId = 1,
                StartTime = DateTime.UtcNow.AddHours(1),
                EndTime = DateTime.UtcNow.AddHours(2)
            };

            var result = await controller.CreateReservation(dto);

            //sprawdza odpowiedŸ metody, czy jest BadRequest z odpowiednim komunikatem
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Resource not found.", badRequest.Value);
        }
    }
}