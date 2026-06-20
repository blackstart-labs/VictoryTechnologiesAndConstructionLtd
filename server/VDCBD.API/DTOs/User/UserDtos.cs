using System;
using System.Collections.Generic;

namespace VDCBD.API.DTOs.User
{
    public class UserDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<UserEnrollmentDto> EnrolledCourses { get; set; } = new();
    }

    public class UserEnrollmentDto
    {
        public Guid CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateStatusDto
    {
        public bool IsActive { get; set; }
    }

    public class ManualEnrollDto
    {
        public Guid CourseId { get; set; }
    }
}
