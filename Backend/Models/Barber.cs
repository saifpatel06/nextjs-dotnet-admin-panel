using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminPanelAPI.Models
{
    public class Barber
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        public string Role { get; set; } // e.g., Master Barber, Stylist

        [Required]
        [Phone]
        public string Phone { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        public string Specialization { get; set; }
        public string Bio { get; set; } 
        public string ImageUrl { get; set; } 

        public bool IsActive { get; set; } = true;
        public decimal Rating { get; set; } = 5.0m;

        public DateTime JoiningDate { get; set; } = DateTime.UtcNow;
    }
}