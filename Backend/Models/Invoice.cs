using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminPanelAPI.Models
{
    public class Invoice
    {
        [Key] // This is now the Primary Key
        [DatabaseGenerated(DatabaseGeneratedOption.None)] 
        public string InvoiceNumber { get; set; } = string.Empty; 

        [Required]
        public string ClientName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string Status { get; set; } = "Unpaid";

        public DateTime DueDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}