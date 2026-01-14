namespace AdminPanelAPI.DTOs
{
    public class ServiceCreateDto
    {
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; } = 0m; 
        public int DurationInMinutes { get; set; } = 0;

        public string Category { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true; 
    }
}