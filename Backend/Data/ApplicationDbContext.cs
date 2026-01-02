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

        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     base.OnModelCreating(modelBuilder);

        //     // Create unique index on Email
        //     modelBuilder.Entity<Admin>()
        //         .HasIndex(u => u.Email)
        //         .IsUnique();
        // }
    }
}