using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VDCBD.API.DTOs.User;

namespace VDCBD.API.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDetailDto>> GetAllUsersAsync();
        Task<bool> UpdateUserRoleAsync(string userId, string newRole);
        Task<bool> ToggleUserStatusAsync(string userId, bool isActive);
        Task<bool> ManuallyEnrollUserAsync(string userId, Guid courseId);
        Task<bool> ManuallyUnenrollUserAsync(string userId, Guid courseId);
        Task<bool> DeleteUserAsync(string userId);
    }
}
