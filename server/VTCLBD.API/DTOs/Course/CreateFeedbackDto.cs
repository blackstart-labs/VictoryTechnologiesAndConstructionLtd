using System.ComponentModel.DataAnnotations;

namespace VTCLBD.API.DTOs.Course
{
    public class CreateFeedbackDto
    {
        [Required]
        public Guid CourseId { get; set; }

        [Required]
        [MinLength(5, ErrorMessage = "Comment must be at least 5 characters long.")]
        public string Comment { get; set; } = string.Empty;

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; } = 5;
    }
}
