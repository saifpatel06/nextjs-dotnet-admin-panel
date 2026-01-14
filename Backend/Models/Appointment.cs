using System.ComponentModel.DataAnnotations;

namespace AdminPanelAPI.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClientId { get; set; }
        // Navigation Property
        public virtual Client? Client { get; set; }

        [Required]
        public int BarberId { get; set; }
        // Navigation Property
        public virtual Barber? Barber { get; set; }

        [Required]
        public int ServiceId { get; set; }
        // Navigation Property
        public virtual Service? Service { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; } 
        
        [Required]
        public DateTime EndTime { get; set; } 

        public string Status { get; set; } = "Pending"; 
        
        public string? Notes { get; set; }

        public decimal FinalPrice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}