using System;
using System.Collections.Generic;

namespace AdminPanelAPI.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public int ClientId { get; set; }
        public Client? Client { get; set; }
        public int? AppointmentId { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        
        // Navigation property for items
        public List<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    }
}