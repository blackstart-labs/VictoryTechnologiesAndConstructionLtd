using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDCBD.API.DTOs.Course;

namespace VDCBD.API.Interfaces
{
    public interface ICourseService
    {
        Task<IEnumerable<CourseResponseDto>> GetAllCoursesAsync(bool publishedOnly = false, CancellationToken cancellationToken = default);
        Task<IEnumerable<CourseResponseDto>> GetEnrolledCoursesAsync(string userId, CancellationToken cancellationToken = default);
        Task<CourseResponseDto> GetCourseByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<CourseResponseDto> CreateCourseAsync(CreateCourseDto request, CancellationToken cancellationToken = default);
        Task<CourseResponseDto> UpdateCourseAsync(Guid id, UpdateCourseDto request, CancellationToken cancellationToken = default);
        Task<bool> DeleteCourseAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
