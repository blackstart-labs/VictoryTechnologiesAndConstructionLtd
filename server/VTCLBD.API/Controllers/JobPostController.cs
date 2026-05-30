using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VTCLBD.API.Common;
using VTCLBD.API.DTOs.Job;
using VTCLBD.API.Interfaces;

namespace VTCLBD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobPostController : ControllerBase
    {
        private readonly IJobService _jobService;

        public JobPostController(IJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<IEnumerable<JobResponseDto>>>> GetAllJobs([FromQuery] bool publishedOnly = false)
        {
            var result = await _jobService.GetAllJobsAsync(publishedOnly);
            return Ok(ApiResponse<IEnumerable<JobResponseDto>>.SuccessResponse(result));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<JobResponseDto>>> GetJobById(Guid id)
        {
            var result = await _jobService.GetJobByIdAsync(id);
            return Ok(ApiResponse<JobResponseDto>.SuccessResponse(result));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<JobResponseDto>>> CreateJob([FromBody] CreateJobDto request)
        {
            var result = await _jobService.CreateJobAsync(request);
            var response = ApiResponse<JobResponseDto>.SuccessResponse(result, "Job post created successfully.");
            return CreatedAtAction(nameof(GetJobById), new { id = result.Id }, response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<JobResponseDto>>> UpdateJob(Guid id, [FromBody] UpdateJobDto request)
        {
            var result = await _jobService.UpdateJobAsync(id, request);
            return Ok(ApiResponse<JobResponseDto>.SuccessResponse(result, "Job post updated successfully."));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteJob(Guid id)
        {
            var result = await _jobService.DeleteJobAsync(id);
            return Ok(ApiResponse<bool>.SuccessResponse(result, "Job post deleted successfully."));
        }
    }
}
