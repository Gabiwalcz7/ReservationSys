using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ReservationSystem.Controllers;
using ReservationSystem.Data;
using ReservationSystem.DTOs;
using ReservationSystem.Entities;

namespace UnitTests
{
    //Sprawdza, czy metoda GetReservationDetails zwraca poprawnie zmapowane dane
    public class ReportsControllerTest
    {
        [Fact]
        public async Task GetReservationDetails_ReturnsCorrectMappedData()
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
                Name = "Sala A",
                IsActive = true,
                ResourceTypeId = 1
            };
            context.Resources.Add(resource);

            //dodanie użytkownika do bazy testowej
            var user = new User
            {
                Id = 10,
                FullName = "Jan Kowalski",
                Email = "jan@example.com",
                PasswordHash = "TestHash"
            };
            context.Users.Add(user);

            //stworzenie statusów rezerwacji
            var status1 = new ReservationStatus { Id = 1, Name = "Pending" };
            var status2 = new ReservationStatus { Id = 2, Name = "Approved" };

            context.ReservationStatuses.Add(status1);
            context.ReservationStatuses.Add(status2);

            var now = DateTime.UtcNow;

            //dodanie rezerwacji do bazy testowej
            context.Reservations.AddRange(
                new Reservation
                {
                    Id = 1,
                    ResourceId = 1,
                    UserId = 10,
                    StatusId = 1,
                    StartTime = now.AddHours(2),
                    EndTime = now.AddHours(3)
                },
                new Reservation
                {
                    Id = 2,
                    ResourceId = 1,
                    UserId = 10,
                    StatusId = 2,
                    StartTime = now.AddHours(5),
                    EndTime = now.AddHours(6)
                }
            );
            context.Reservations.Add(
                new Reservation
                {
                    Id = 3,
                    ResourceId = 1,
                    UserId = 10,
                    StatusId = 1,
                    StartTime = now.AddHours(-5),
                    EndTime = now.AddHours(-4)
                }
            );

            await context.SaveChangesAsync();

            var controller = new ReportsController(context);

            var actionResult = await controller.GetReservationDetails(
                resourceId: 1,
                from: now,
                to: null
            );

            var list = Assert.IsType<List<ReservationsReportItemDto>>(actionResult.Value);

            //powinno zwrócić 2 rezerwacje (filtrowanie od teraz włącznie)
            Assert.Equal(2, list.Count);

            //zwracane rezerwacje powinny być posortowane malejąco po dacie rozpoczęcia
            Assert.True(list[0].StartTime > list[1].StartTime);

            //sprawdzenie poprawności mapowania pierwszego elementu
            var first = list[0];

            Assert.Equal(1, first.ResourceId);
            Assert.Equal("Sala A", first.ResourceName);

            Assert.Equal(10, first.UserId);
            Assert.Equal("Jan Kowalski", first.UserName);
            Assert.Equal("jan@example.com", first.UserEmail);

            Assert.True(first.StatusId == 1 || first.StatusId == 2);
            Assert.False(string.IsNullOrWhiteSpace(first.StatusName));
        }
    }
}
