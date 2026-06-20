using System;

namespace VDCBD.API.DTOs.Course
{
    public sealed record CourseResponseDto(
        Guid Id,
        string Title,
        string Description,
        decimal Price,
        string? VideoUrl,
        string? InstructorName,
        bool IsPublished,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt
    );
}
