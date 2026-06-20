using VDCBD.API.DTOs.Common;

namespace VDCBD.API.Interfaces
{
    public interface IFileUploadService
    {
        Task<FileUploadResponseDto> UploadFileAsync(IFormFile file, string folder = "victory");
        Task<bool> DeleteFileAsync(string publicId, bool isVideo = false);
    }
}
