using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VTCLBD.API.Common.Exceptions;
using VTCLBD.API.Configs;
using VTCLBD.API.DTOs.Course;
using VTCLBD.API.Interfaces;
using VTCLBD.API.Models;
using Microsoft.EntityFrameworkCore;

namespace VTCLBD.API.Services
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CourseResponseDto>> GetAllCoursesAsync(bool publishedOnly = false, CancellationToken cancellationToken = default)
        {
            var query = _context.Courses.AsNoTracking().AsQueryable();

            if (publishedOnly)
            {
                query = query.Where(c => c.IsPublished);
            }

            var courses = await query.Select(c => new CourseResponseDto(
                c.Id,
                c.Title,
                c.Description,
                c.Price,
                c.VideoUrl,
                c.InstructorName,
                c.IsPublished,
                c.CreatedAt,
                c.UpdatedAt
            )).ToListAsync(cancellationToken);

            return courses;
        }

        public async Task<IEnumerable<CourseResponseDto>> GetEnrolledCoursesAsync(string userId, CancellationToken cancellationToken = default)
        {
            var enrolledCourseIds = await _context.Enrollments
                .AsNoTracking()
                .Where(e => e.UserId == userId && e.IsActive)
                .Select(e => e.CourseId)
                .ToListAsync(cancellationToken);

            if (enrolledCourseIds.Count == 0)
            {
                return Enumerable.Empty<CourseResponseDto>();
            }

            return await _context.Courses
                .AsNoTracking()
                .Where(c => enrolledCourseIds.Contains(c.Id))
                .Select(c => new CourseResponseDto(
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Price,
                    c.VideoUrl,
                    c.InstructorName,
                    c.IsPublished,
                    c.CreatedAt,
                    c.UpdatedAt
                )).ToListAsync(cancellationToken);
        }

        public async Task<CourseResponseDto> GetCourseByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (course == null)
                throw new NotFoundException("Course not found.");

            return new CourseResponseDto(
                course.Id,
                course.Title,
                course.Description,
                course.Price,
                course.VideoUrl,
                course.InstructorName,
                course.IsPublished,
                course.CreatedAt,
                course.UpdatedAt
            );
        }

        public async Task<CourseResponseDto> CreateCourseAsync(CreateCourseDto request, CancellationToken cancellationToken = default)
        {
            var course = new Course
            {
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                VideoUrl = request.VideoUrl,
                VideoPublicId = request.VideoPublicId,
                InstructorName = request.InstructorName,
                IsPublished = request.IsPublished,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync(cancellationToken);

            return new CourseResponseDto(
                course.Id,
                course.Title,
                course.Description,
                course.Price,
                course.VideoUrl,
                course.InstructorName,
                course.IsPublished,
                course.CreatedAt,
                course.UpdatedAt
            );
        }

        public async Task<CourseResponseDto> UpdateCourseAsync(Guid id, UpdateCourseDto request, CancellationToken cancellationToken = default)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (course == null)
                throw new NotFoundException("Course not found.");

            if (request.Title != null) course.Title = request.Title;
            if (request.Description != null) course.Description = request.Description;
            if (request.Price.HasValue) course.Price = request.Price.Value;
            if (request.VideoUrl != null) course.VideoUrl = request.VideoUrl;
            if (request.VideoPublicId != null) course.VideoPublicId = request.VideoPublicId;
            if (request.InstructorName != null) course.InstructorName = request.InstructorName;
            if (request.IsPublished.HasValue) course.IsPublished = request.IsPublished.Value;

            course.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Courses.Update(course);
            await _context.SaveChangesAsync(cancellationToken);

            return new CourseResponseDto(
                course.Id,
                course.Title,
                course.Description,
                course.Price,
                course.VideoUrl,
                course.InstructorName,
                course.IsPublished,
                course.CreatedAt,
                course.UpdatedAt
            );
        }

        public async Task<bool> DeleteCourseAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (course == null)
                throw new NotFoundException("Course not found.");

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
