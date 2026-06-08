namespace VTCLBD.API.DTOs.Course
{
    public sealed record UpdateCourseDto
    {
        public string? Title { get; init; }
        public string? Description { get; init; }
        public decimal? Price { get; init; }
        public string? VideoUrl { get; init; }
        public string? VideoPublicId { get; init; }
        public string? InstructorName { get; init; }
        public bool? IsPublished { get; init; }
    }
}
