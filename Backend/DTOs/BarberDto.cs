namespace AdminPanelAPI.DTOs
{
    public class BarberDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public decimal Rating { get; set; }
        public DateTime JoiningDate { get; set; } // Add this line
        public List<BarberAvailabilityDto>? Availabilities { get; set; }
    }

    public class BarberAvailabilityDto
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public bool IsActive { get; set; }
    }
}