using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using VDCBD.API.Common;
using VDCBD.API.DTOs.Course;
using VDCBD.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace VDCBD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<IEnumerable<CourseResponseDto>>))]
        public async Task<ActionResult<ApiResponse<IEnumerable<CourseResponseDto>>>> GetAllCourses(
            [FromQuery] bool publishedOnly = false,
            CancellationToken cancellationToken = default)
        {
            var result = await _courseService.GetAllCoursesAsync(publishedOnly, cancellationToken);
            return Ok(ApiResponse<IEnumerable<CourseResponseDto>>.SuccessResponse(result));
        }

        [Authorize]
        [HttpGet("enrolled")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<IEnumerable<CourseResponseDto>>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse<object>))]
        public async Task<ActionResult<ApiResponse<IEnumerable<CourseResponseDto>>>> GetEnrolledCourses(
            CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.FailureResponse("User ID not found in token."));

            var result = await _courseService.GetEnrolledCoursesAsync(userId, cancellationToken);
            return Ok(ApiResponse<IEnumerable<CourseResponseDto>>.SuccessResponse(result));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<ActionResult<ApiResponse<CourseResponseDto>>> GetCourseById(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var result = await _courseService.GetCourseByIdAsync(id, cancellationToken);
            return Ok(ApiResponse<CourseResponseDto>.SuccessResponse(result));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ApiResponse<CourseResponseDto>))]
        public async Task<ActionResult<ApiResponse<CourseResponseDto>>> CreateCourse(
            [FromBody] CreateCourseDto request,
            CancellationToken cancellationToken = default)
        {
            var result = await _courseService.CreateCourseAsync(request, cancellationToken);
            var response = ApiResponse<CourseResponseDto>.SuccessResponse(result, "Course created successfully.");
            return CreatedAtAction(nameof(GetCourseById), new { id = result.Id }, response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CourseResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<ActionResult<ApiResponse<CourseResponseDto>>> UpdateCourse(
            Guid id,
            [FromBody] UpdateCourseDto request,
            CancellationToken cancellationToken = default)
        {
            var result = await _courseService.UpdateCourseAsync(id, request, cancellationToken);
            return Ok(ApiResponse<CourseResponseDto>.SuccessResponse(result, "Course updated successfully."));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse<object>))]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCourse(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var result = await _courseService.DeleteCourseAsync(id, cancellationToken);
            return Ok(ApiResponse<bool>.SuccessResponse(result, "Course deleted successfully."));
        }
    }
}
