namespace AdminPanelAPI.DTOs
{
    public class AppointmentCreateDto
    {
        public int ClientId { get; set; }
        public int BarberId { get; set; }
        public int ServiceId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }
    }

    public class AppointmentDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? ClientName { get; set; }
        public int BarberId { get; set; }
        public string? BarberName { get; set; }
        public int ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "Pending";
        public decimal FinalPrice { get; set; }
        public string? Notes { get; set; }
    }

    public class AppointmentUpdateDto
    {
        public int Id { get; set; } 
        public int ClientId { get; set; }
        public int BarberId { get; set; }
        public int ServiceId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "Pending";
        public string? Notes { get; set; }
        public decimal? FinalPrice { get; set; } 
    }
}