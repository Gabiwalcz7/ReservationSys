using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
    //do sprawdzenia czy metoda Register nie tworzy użytkownika z istniejącym emailem
    public class AuthControllerTest
    {
        [Fact]
        public async Task Register_ReturnsBadRequest_WhenEmailAlreadyExists()
        {
            //Tworzenie bazy testowej w pamieci
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);

            //tworzenie użytkownika testowego
            context.Users.Add(new User
            {
                Email = "test@example.com",
                FullName = "Existing User",
                PasswordHash = "hash",
                RoleId = 1
            });
            await context.SaveChangesAsync();

            var configuration = new ConfigurationBuilder().Build();

            var controller = new AuthController(context, configuration);

            //próba rejestracji istniejacego użytkownika
            var dto = new RegisterDto
            {
                Email = "test@example.com",
                FullName = "New User",
                Password = "Password123!"
            };

            var result = await controller.Register(dto);

            //sprawdzamy czy odpowiedź metody to BadRequest z odpowiednim komunikatem
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("User with this email already exists.", badRequest.Value);
        }
    }
}
