namespace AdminPanelAPI.DTOs
{
    public class InvoiceCreateDto
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Unpaid";
        public DateTime DueDate { get; set; }
    }
}