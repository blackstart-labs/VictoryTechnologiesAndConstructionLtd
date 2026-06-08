using System.Security.Claims;
using VTCLBD.API.Common;
using VTCLBD.API.Configs;
using VTCLBD.API.DTOs.Course;
using VTCLBD.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace VTCLBD.API.Controllers
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
        public async Task<ActionResult<ApiResponse<FeedbackResponseDto>>> CreateFeedback([FromBody] CreateFeedbackDto request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.FailureResponse("User ID not found in token."));

            // Check if user is enrolled in the course
            var isEnrolled = await _context.Enrollments.AnyAsync(e => 
                e.UserId == userId && e.CourseId == request.CourseId && e.IsActive);

            if (!isEnrolled)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("You must be enrolled in this course to submit feedback."));
            }

            // Check if user has already submitted feedback for this course
            var existingFeedback = await _context.CourseFeedbacks.FirstOrDefaultAsync(f => 
                f.UserId == userId && f.CourseId == request.CourseId);

            if (existingFeedback != null)
            {
                // Update existing feedback instead of duplicate
                existingFeedback.Comment = request.Comment;
                existingFeedback.Rating = request.Rating;
                existingFeedback.Sentiment = "Pending"; // Reset to pending for admin verification
                existingFeedback.CreatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var courseTitle = await _context.Courses
                    .Where(c => c.Id == existingFeedback.CourseId)
                    .Select(c => c.Title)
                    .FirstOrDefaultAsync() ?? string.Empty;

                var user = await _context.Users.FindAsync(userId);

                var updateResponse = new FeedbackResponseDto
                {
                    Id = existingFeedback.Id,
                    CourseId = existingFeedback.CourseId,
                    CourseTitle = courseTitle,
                    UserId = existingFeedback.UserId,
                    UserFullName = user?.FullName ?? string.Empty,
                    UserEmail = user?.Email ?? string.Empty,
                    Comment = existingFeedback.Comment,
                    Rating = existingFeedback.Rating,
                    Sentiment = existingFeedback.Sentiment,
                    CreatedAt = existingFeedback.CreatedAt
                };

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
                CreatedAt = DateTime.UtcNow
            };

            _context.CourseFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            var course = await _context.Courses.FindAsync(request.CourseId);
            var currentUser = await _context.Users.FindAsync(userId);

            var result = new FeedbackResponseDto
            {
                Id = feedback.Id,
                CourseId = feedback.CourseId,
                CourseTitle = course?.Title ?? string.Empty,
                UserId = feedback.UserId,
                UserFullName = currentUser?.FullName ?? string.Empty,
                UserEmail = currentUser?.Email ?? string.Empty,
                Comment = feedback.Comment,
                Rating = feedback.Rating,
                Sentiment = feedback.Sentiment,
                CreatedAt = feedback.CreatedAt
            };

            return CreatedAtAction(nameof(GetCourseFeedbacksPublic), new { courseId = feedback.CourseId }, 
                ApiResponse<FeedbackResponseDto>.SuccessResponse(result, "Feedback submitted successfully. Pending verification."));
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackResponseDto>>>> GetCourseFeedbacksPublic(Guid courseId)
        {
            var feedbacks = await _context.CourseFeedbacks
                .Where(f => f.CourseId == courseId && f.Sentiment == "Positive")
                .Include(f => f.User)
                .Include(f => f.Course)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto
                {
                    Id = f.Id,
                    CourseId = f.CourseId,
                    CourseTitle = f.Course != null ? f.Course.Title : string.Empty,
                    UserId = f.UserId,
                    UserFullName = f.User != null ? f.User.FullName : string.Empty,
                    UserEmail = f.User != null ? f.User.Email : string.Empty,
                    Comment = f.Comment,
                    Rating = f.Rating,
                    Sentiment = f.Sentiment,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<FeedbackResponseDto>>.SuccessResponse(feedbacks));
        }

        [HttpGet("public")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackResponseDto>>>> GetPublicFeedbacksAll()
        {
            var feedbacks = await _context.CourseFeedbacks
                .Where(f => f.Sentiment == "Positive")
                .Include(f => f.User)
                .Include(f => f.Course)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto
                {
                    Id = f.Id,
                    CourseId = f.CourseId,
                    CourseTitle = f.Course != null ? f.Course.Title : string.Empty,
                    UserId = f.UserId,
                    UserFullName = f.User != null ? f.User.FullName : string.Empty,
                    UserEmail = f.User != null ? f.User.Email : string.Empty,
                    Comment = f.Comment,
                    Rating = f.Rating,
                    Sentiment = f.Sentiment,
                    CreatedAt = f.CreatedAt
                })
                .Take(10)
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<FeedbackResponseDto>>.SuccessResponse(feedbacks));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackResponseDto>>>> GetCourseFeedbacksAdmin()
        {
            var feedbacks = await _context.CourseFeedbacks
                .Include(f => f.User)
                .Include(f => f.Course)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto
                {
                    Id = f.Id,
                    CourseId = f.CourseId,
                    CourseTitle = f.Course != null ? f.Course.Title : string.Empty,
                    UserId = f.UserId,
                    UserFullName = f.User != null ? f.User.FullName : string.Empty,
                    UserEmail = f.User != null ? f.User.Email : string.Empty,
                    Comment = f.Comment,
                    Rating = f.Rating,
                    Sentiment = f.Sentiment,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<FeedbackResponseDto>>.SuccessResponse(feedbacks));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id}/sentiment")]
        public async Task<ActionResult<ApiResponse<FeedbackResponseDto>>> UpdateFeedbackSentiment(Guid id, [FromBody] UpdateFeedbackSentimentDto request)
        {
            var feedback = await _context.CourseFeedbacks
                .Include(f => f.User)
                .Include(f => f.Course)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (feedback == null)
            {
                return NotFound(ApiResponse<object>.FailureResponse("Feedback not found."));
            }

            feedback.Sentiment = request.Sentiment;
            await _context.SaveChangesAsync();

            var result = new FeedbackResponseDto
            {
                Id = feedback.Id,
                CourseId = feedback.CourseId,
                CourseTitle = feedback.Course?.Title ?? string.Empty,
                UserId = feedback.UserId,
                UserFullName = feedback.User != null ? feedback.User.FullName : string.Empty,
                UserEmail = feedback.User != null ? feedback.User.Email : string.Empty,
                Comment = feedback.Comment,
                Rating = feedback.Rating,
                Sentiment = feedback.Sentiment,
                CreatedAt = feedback.CreatedAt
            };

            return Ok(ApiResponse<FeedbackResponseDto>.SuccessResponse(result, $"Feedback sentiment updated to {request.Sentiment}."));
        }
    }
}
