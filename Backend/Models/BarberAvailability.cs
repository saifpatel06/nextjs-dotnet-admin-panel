using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AdminPanelAPI.Models
{
    public class BarberAvailability
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BarberId { get; set; }

        [Required]
        public DayOfWeek DayOfWeek { get; set; } 

        public string StartTime { get; set; } = "09:00"; 
        public string EndTime { get; set; } = "18:00";

        public bool IsActive { get; set; } = true;

        [ForeignKey("BarberId")]
        [JsonIgnore] 
        public virtual Barber? Barber { get; set; }
    }
}