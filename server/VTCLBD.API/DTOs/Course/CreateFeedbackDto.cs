using System;
using System.ComponentModel.DataAnnotations;

namespace VTCLBD.API.DTOs.Course
{
    public sealed record CreateFeedbackDto
    {
        [Required]
        public Guid CourseId { get; init; }

        [Required]
        [MinLength(5, ErrorMessage = "Comment must be at least 5 characters long.")]
        public string Comment { get; init; } = string.Empty;

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; init; } = 5;
    }
}
