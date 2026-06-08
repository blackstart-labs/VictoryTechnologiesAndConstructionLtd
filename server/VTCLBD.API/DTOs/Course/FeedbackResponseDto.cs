using System;

namespace VTCLBD.API.DTOs.Course
{
    public sealed record FeedbackResponseDto(
        Guid Id,
        Guid CourseId,
        string CourseTitle,
        string UserId,
        string? UserFullName,
        string? UserEmail,
        string Comment,
        int Rating,
        string Sentiment,
        DateTimeOffset CreatedAt
    );
}
