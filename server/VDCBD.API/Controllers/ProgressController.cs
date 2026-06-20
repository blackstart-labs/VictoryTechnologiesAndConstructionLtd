using System.Security.Claims;
using VDCBD.API.Common;
using VDCBD.API.DTOs.Progress;
using VDCBD.API.Interfaces;
using VDCBD.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VDCBD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _progressService;
        private readonly ICertificateService _certificateService;

        public ProgressController(IProgressService progressService, ICertificateService certificateService)
        {
            _progressService = progressService;
            _certificateService = certificateService;
        }

        [HttpPost("mark-complete")]
        public async Task<ActionResult<ApiResponse<LessonProgressResponseDto>>> MarkLessonComplete([FromBody] MarkLessonCompleteDto request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _progressService.MarkLessonCompleteAsync(userId, request);
            return Ok(ApiResponse<LessonProgressResponseDto>.SuccessResponse(result, "Lesson marked as complete."));
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<ApiResponse<CourseProgressResponseDto>>> GetCourseProgress(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _progressService.GetCourseProgressAsync(userId, courseId);
            return Ok(ApiResponse<CourseProgressResponseDto>.SuccessResponse(result));
        }

        [HttpGet("certificate/{courseId}")]
        public async Task<ActionResult<ApiResponse<CertificateResponseDto?>>> GetCertificate(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _progressService.GetCertificateAsync(userId, courseId);

            if (result == null)
                return Ok(ApiResponse<CertificateResponseDto?>.FailureResponse(
                    "Certificate not yet issued. Complete all modules to earn your certificate."));

            return Ok(ApiResponse<CertificateResponseDto?>.SuccessResponse(result, "Certificate retrieved successfully."));
        }

        [HttpGet("certificate/download/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DownloadCertificate(Guid id)
        {
            var cert = await _progressService.GetCertificateByIdAsync(id);
            if (cert == null)
                return NotFound("Certificate not found.");

            try
            {
                var payload = new Models.CertificateRequestDto
                {
                    RecipientName     = cert.StudentName,
                    CourseTitle       = cert.CourseTitle,
                    CertificateNumber = cert.CertificateNumber,
                    IssuedAt          = cert.IssuedAt
                };

                var pdfBytes = await _certificateService.GenerateAsync(payload);
                var filename = $"{cert.StudentName.Replace(" ", "_")}_Certificate.pdf";
                return File(pdfBytes, "application/pdf", filename);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to generate PDF: {ex.Message}");
            }
        }
    }
}
