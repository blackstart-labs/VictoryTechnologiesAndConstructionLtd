using System.ComponentModel.DataAnnotations;

namespace VDCBD.API.DTOs.Course
{
    public sealed record CreateCourseDto
    {
        [Required]
        public string Title { get; init; } = string.Empty;

        [Required]
        public string Description { get; init; } = string.Empty;

        public decimal Price { get; init; }

        public string? VideoUrl { get; init; }
        public string? VideoPublicId { get; init; }

        public string? InstructorName { get; init; }
        public bool IsPublished { get; init; } = true;
    }
}
