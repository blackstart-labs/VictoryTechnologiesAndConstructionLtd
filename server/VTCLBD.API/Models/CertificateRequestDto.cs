namespace VTCLBD.API.Models
{
    public class CertificateRequestDto
    {
        public string RecipientName { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public string CertificateNumber { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

        // Kept for backward compatibility — not used in the new PDF generator
        public string? TemplateImageUrl { get; set; }
    }
}
