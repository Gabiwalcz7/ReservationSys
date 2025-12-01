using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Controllers;
using ReservationSystem.Data;
using ReservationSystem.DTOs;
using ReservationSystem.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTests
{
    //do sprawdzenia czy metoda CreateResource zwraca BadRequest gdy nazwa zasobu już istnieje
    public class CreateResourceTest
    {
        [Fact]
        public async Task CreateResource_ReturnsBadRequest_WhenNameAlreadyExists()
        {
            //Tworzenie bazy testowej w pamieci
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);

            //dodanie zasobu o nazwie "Sala 101" do bazy testowej
            context.Resources.Add(new Resource
            {
                Name = "Sala 101",
                IsActive = true,
                ResourceTypeId = 1
            });
            await context.SaveChangesAsync();

            var controller = new ResourcesController(context);

            //dodanie kolejnego zasobu o tej samej nazwie 
            var dto = new CreateResourceDto
            {
                Name = "Sala 101",
                IsActive = true,
                ResourceTypeId = 1
            };

            //wywołanie metody CreateResource z kontrolera
            var result = await controller.CreateResource(dto);

            //sprawdzamy czy odpowiedź metody to BadRequest z odpowiednim komunikatem
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Resource with this name already exists.", badRequest.Value);
        }
    }
}
