using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminPanelAPI.Models
{
    public class Client
    {
        [Key] // Defines this as the Primary Key
        public int Id { get; set; }

        [Required(ErrorMessage = "Client name is required")]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [StringLength(150)]
        public string Company { get; set; } = string.Empty;

        [Phone]
        [StringLength(10)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "Active";

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}