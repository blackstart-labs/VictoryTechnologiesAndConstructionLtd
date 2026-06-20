using VDCBD.API.DTOs.Auth;

namespace VDCBD.API.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginRequestDto request);
        Task<string> ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task<string> ResetPasswordAsync(ResetPasswordRequestDto request);
    }
}
