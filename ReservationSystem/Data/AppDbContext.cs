using Microsoft.EntityFrameworkCore;
using ReservationSystem.DTOs;
using ReservationSystem.Entities;

namespace ReservationSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Resource> Resources => Set<Resource>();
        public DbSet<ResourceType> ResourceTypes => Set<ResourceType>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<ReservationStatus> ReservationStatuses => Set<ReservationStatus>();
        public DbSet<LogEntry> LogEntries => Set<LogEntry>();
        public DbSet<ReservationsReportItemDto> ReservationsReportItems => Set<ReservationsReportItemDto>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User–Role
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId);

            // Reservation – User
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation – Resource
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Resource)
                .WithMany(res => res.Reservations)
                .HasForeignKey(r => r.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation – Status
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Status)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.StatusId);

            // Reservation – ApprovedBy
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.ApprovedBy)
                .WithMany(u => u.ApprovedReservations)
                .HasForeignKey(r => r.ApprovedById)
                .OnDelete(DeleteBehavior.Restrict);

            // LogEntry – User
            modelBuilder.Entity<LogEntry>()
                .HasOne(l => l.User)
                .WithMany(u => u.LogEntries)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.SetNull);



            //Dane startowe:

            // SEED: Role
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "User" }
            );

            // SEED: ResourceTypes
            modelBuilder.Entity<ResourceType>().HasData(
                new ResourceType { Id = 1, Name = "Sala", AllowMultiplePerSlot = false },
                new ResourceType { Id = 2, Name = "Sprzęt", AllowMultiplePerSlot = false }
            );

            // SEED: ReservationStatuses
            modelBuilder.Entity<ReservationStatus>().HasData(
                new ReservationStatus { Id = 1, Name = "Pending" },
                new ReservationStatus { Id = 2, Name = "Approved" },
                new ReservationStatus { Id = 3, Name = "Rejected" },
                new ReservationStatus { Id = 4, Name = "Cancelled" }
            );

            modelBuilder.Entity<ReservationsReportItemDto>().HasNoKey().ToView(null);
        }
    }
}
