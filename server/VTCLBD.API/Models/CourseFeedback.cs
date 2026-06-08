using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VTCLBD.API.Models
{
    public class CourseFeedback
    {
        public Guid Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public ApplicationUser? User { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        [Required]
        public string Comment { get; set; } = string.Empty;

        public int Rating { get; set; } = 5;

        // Sentiment can be: "Pending", "Positive", "Negative"
        [Required]
        public string Sentiment { get; set; } = "Pending";

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
