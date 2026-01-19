using System.ComponentModel.DataAnnotations;

namespace AdminPanelAPI.DTOs
{
    public class ClientUpsertDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? InternalNotes { get; set; }

        public string Status { get; set; } = "Active";
    }
}