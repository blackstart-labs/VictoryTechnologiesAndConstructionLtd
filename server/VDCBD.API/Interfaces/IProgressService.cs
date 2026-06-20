using VDCBD.API.DTOs.Progress;

namespace VDCBD.API.Interfaces
{
    public interface IProgressService
    {
        Task<LessonProgressResponseDto> MarkLessonCompleteAsync(string userId, MarkLessonCompleteDto request);
        Task<CourseProgressResponseDto> GetCourseProgressAsync(string userId, Guid courseId);
        Task<CertificateResponseDto?> GetCertificateAsync(string userId, Guid courseId);
        Task<CertificateResponseDto?> GetCertificateByIdAsync(Guid id);
    }
}
