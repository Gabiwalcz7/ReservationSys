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
    //do sprawdzenia czy metoda GetReservationReport zwraca poprawne dane raportu
    public class ResportsControllerTest
    {
        [Fact]
        public async Task GetReservationReportTest()
        {
            //tworzenie bazy testowej w pamieci
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);

            //dodanie zasobów i rezerwacji do bazy testowej
            context.Resources.AddRange(
                new ReservationSystem.Entities.Resource { Id = 1, Name = "Resource 1", IsActive = true, ResourceTypeId = 1 },
                new ReservationSystem.Entities.Resource { Id = 2, Name = "Resource 2", IsActive = true, ResourceTypeId = 1 }
            );

            context.Reservations.AddRange(
                new Reservation
                {
                    ResourceId = 1,
                    StatusId = 1,
                    StartTime = DateTime.Now.AddHours(1),
                    EndTime = DateTime.Now.AddHours(2)
                },
                new Reservation
                {
                    ResourceId = 1,
                    StatusId = 2,
                    StartTime = DateTime.Now.AddHours(3),
                    EndTime = DateTime.Now.AddHours(4)
                },
                new Reservation
                {
                    ResourceId = 1,
                    StatusId = 3,
                    StartTime = DateTime.Now.AddHours(5),
                    EndTime = DateTime.Now.AddHours(6)
                },
                new Reservation
                {
                    ResourceId = 2,
                    StatusId = 2,
                    StartTime = DateTime.Now.AddHours(1),
                    EndTime = DateTime.Now.AddHours(2)
                },
                new Reservation
                {
                    ResourceId = 2, 
                    StatusId = 2,
                    StartTime = DateTime.Now.AddHours(3),
                    EndTime = DateTime.Now.AddHours(4)
                }
            );

            await context.SaveChangesAsync();

            var controller = new ReportsController(context);

            //wywołanie metody GetReservationReport z kontrolera
            var ActionResult = await controller.GetReservationReport(null, null);

            //sprawdzenie czy odpowiedź metody jest poprawna
            var list = Assert.IsType<List<ReportsController.ReservationReportDto>>(ActionResult.Value);

            //sprawdzenie czy raport zawiera dane dla obu zasobów
            Assert.Equal(2, list.Count);

            var resource1Report = list.Single(r => r.ResourceId == 1);
            var resource2Report = list.Single(r => r.ResourceId == 2);

            //sprawdzenie czy dane raportu dla zasobu 1 są poprawne
            Assert.Equal("Resource 1", resource1Report.ResourceName);
            Assert.Equal(3, resource1Report.TotalReservations);
            Assert.Equal(1, resource1Report.PendingCount);
            Assert.Equal(1, resource1Report.ApprovedCount);
            Assert.Equal(1, resource1Report.RejectedCount);

            //sprawdzenie czy dane raportu dla zasobu 2 są poprawne
            Assert.Equal("Resource 2", resource2Report.ResourceName);
            Assert.Equal(2, resource2Report.TotalReservations);
            Assert.Equal(0, resource2Report.PendingCount);
            Assert.Equal(2, resource2Report.ApprovedCount);
            Assert.Equal(0, resource2Report.RejectedCount);
        }
    }
}
