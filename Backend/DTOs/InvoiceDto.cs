namespace AdminPanelAPI.Dtos
{
    public class CreateInvoiceDto
    {
        public int ClientId { get; set; }
        public int? AppointmentId { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public decimal Discount { get; set; }
        public List<CreateInvoiceItemDto> Items { get; set; } = new();
    }

    public class CreateInvoiceItemDto
    {
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}