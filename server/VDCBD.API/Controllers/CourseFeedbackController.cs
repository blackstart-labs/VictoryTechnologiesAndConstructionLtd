using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using VDCBD.API.Common;
using VDCBD.API.Configs;
using VDCBD.API.DTOs.Course;
using VDCBD.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace VDCBD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseFeedbackController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CourseFeedbackController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ApiResponse<FeedbackResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse<object>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
        public async Task<ActionResult<ApiResponse<FeedbackResponseDto>>> CreateFeedback(
            [FromBody] CreateFeedbackDto request,
            CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.FailureResponse("User ID not found in token."));

            // Check if user is enrolled in the course (read-only verification - AsNoTracking)
            var isEnrolled = await _context.Enrollments
                .AsNoTracking()
                .AnyAsync(e => e.UserId == userId && e.CourseId == request.CourseId && e.IsActive, cancellationToken);

            if (!isEnrolled)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("You must be enrolled in this course to submit feedback."));
            }

            // Check if user has already submitted feedback for this course
            var existingFeedback = await _context.CourseFeedbacks
                .FirstOrDefaultAsync(f => f.UserId == userId && f.CourseId == request.CourseId, cancellationToken);

            if (existingFeedback != null)
            {
                // Update existing feedback instead of duplicate
                existingFeedback.Comment = request.Comment;
                existingFeedback.Rating = request.Rating;
                existingFeedback.Sentiment = "Pending"; // Reset to pending for admin verification
                existingFeedback.CreatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);

                var courseTitle = await _context.Courses
                    .AsNoTracking()
                    .Where(c => c.Id == existingFeedback.CourseId)
                    .Select(c => c.Title)
                    .FirstOrDefaultAsync(cancellationToken) ?? string.Empty;

                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

                var updateResponse = new FeedbackResponseDto(
                    existingFeedback.Id,
                    existingFeedback.CourseId,
                    courseTitle,
                    existingFeedback.UserId,
                    user?.FullName ?? string.Empty,
                    user?.Email ?? string.Empty,
                    existingFeedback.Comment,
                    existingFeedback.Rating,
                    existingFeedback.Sentiment,
                    existingFeedback.CreatedAt
                );

                return Ok(ApiResponse<FeedbackResponseDto>.SuccessResponse(updateResponse, "Feedback updated and pending verification."));
            }

            var feedback = new CourseFeedback
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CourseId = request.CourseId,
                Comment = request.Comment,
                Rating = request.Rating,
                Sentiment = "Pending",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.CourseFeedbacks.Add(feedback);
            await _context.SaveChangesAsync(cancellationToken);

            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);
            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            var result = new FeedbackResponseDto(
                feedback.Id,
                feedback.CourseId,
                course?.Title ?? string.Empty,
                feedback.UserId,
                currentUser?.FullName ?? string.Empty,
                currentUser?.Email ?? string.Empty,
                feedback.Comment,
                feedback.Rating,
                feedback.Sentiment,
                feedback.CreatedAt
            );

            return CreatedAtAction(nameof(GetCourseFeedbacksPublic), new { courseId = feedback.CourseId }, 
                ApiResponse<FeedbackResponseDto>.SuccessResponse(result, "Feedback submitted successfully. Pending verification."));
        }

        [HttpGet("course/{courseId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<IEnumerable<FeedbackResponseDto>>))]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackResponseDto>>>> GetCourseFeedbacksPublic(
            Guid courseId,
            CancellationToken cancellationToken)
        {
            var feedbacks = await _context.CourseFeedbacks
                .AsNoTracking()
                .Where(f => f.CourseId == courseId && f.Sentiment == "Positive")
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto(
                    f.Id,
                    f.CourseId,
                    f.Course != null ? f.Course.Title : string.Empty,
                    f.UserId,
                    f.User != null ? f.User.FullName : string.Empty,
                    f.User != null ? f.User.Email : string.Empty,
                    f.Comment,
                    f.Rating,
                    f.Sentiment,
                    f.CreatedAt
                ))
                .ToListAsync(cancellationToken);

            return Ok(ApiResponse<IEnumerable<FeedbackResponseDto>>.SuccessResponse(feedbacks));
        }

        [HttpGet("public")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<IEnumerable<FeedbackResponseDto>>))]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackResponseDto>>>> GetPublicFeedbacksAll(
            CancellationToken cancellationToken)
        {
            var feedbacks = await _context.CourseFeedbacks
                .AsNoTracking()
                .Where(f => f.Sentiment == "Positive")
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto(
                    f.Id,
                    f.CourseId,
                    f.Course != null ? f.Course.Title : string.Empty,
                    f.UserId,
                    f.User != null ? f.User.FullName : string.Empty,
                    f.User != null ? f.User.Email : string.Empty,
                    f.Comment,
                    f.Rating,
                    f.Sentiment,
                    f.CreatedAt
                ))
                .Take(10)
                .ToListAsync(cancellationToken);

            return Ok(ApiResponse<IEnumerable<FeedbackResponseDto>>.SuccessResponse(feedbacks));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<IEnumerable<FeedbackResponseDto>>))]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackResponseDto>>>> GetCourseFeedbacksAdmin(
            CancellationToken cancellationToken)
        {
            var feedbacks = await _context.CourseFeedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto(
                    f.Id,
                    f.CourseId,
                    f.Course != null ? f.Course.Title : string.Empty,
                    f.UserId,
                    f.User != null ? f.User.FullName : string.Empty,
                    f.User != null ? f.User.Email : string.Empty,
                    f.Comment,
                    f.Rating,
                    f.Sentiment,
                    f.CreatedAt
                ))
                .ToListAsync(cancellationToken);

            return Ok(ApiResponse<IEnumerable<FeedbackResponseDto>>.SuccessResponse(feedbacks));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id}/sentiment")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<FeedbackResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<ActionResult<ApiResponse<FeedbackResponseDto>>> UpdateFeedbackSentiment(
            Guid id,
            [FromBody] UpdateFeedbackSentimentDto request,
            CancellationToken cancellationToken)
        {
            var feedback = await _context.CourseFeedbacks
                .Include(f => f.User)
                .Include(f => f.Course)
                .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

            if (feedback == null)
            {
                return NotFound(ApiResponse<object>.FailureResponse("Feedback not found."));
            }

            feedback.Sentiment = request.Sentiment;
            await _context.SaveChangesAsync(cancellationToken);

            var result = new FeedbackResponseDto(
                feedback.Id,
                feedback.CourseId,
                feedback.Course?.Title ?? string.Empty,
                feedback.UserId,
                feedback.User != null ? feedback.User.FullName : string.Empty,
                feedback.User != null ? feedback.User.Email : string.Empty,
                feedback.Comment,
                feedback.Rating,
                feedback.Sentiment,
                feedback.CreatedAt
            );

            return Ok(ApiResponse<FeedbackResponseDto>.SuccessResponse(result, $"Feedback sentiment updated to {request.Sentiment}."));
        }
    }
}
