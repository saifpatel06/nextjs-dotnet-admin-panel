using Microsoft.EntityFrameworkCore;
using AdminPanelAPI.Models;

namespace AdminPanelAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<Client> Clients { get; set; }

        public DbSet<Invoice> Invoices { get; set; }

        public DbSet<Barber> Barbers { get; set; }

        public DbSet<BarberAvailability> BarberAvailabilities { get; set; }
        
    }
}