using System.ComponentModel.DataAnnotations;

namespace VDCBD.API.DTOs.Payment
{
    public class InitiateSSLCommerzPaymentDto
    {
        [Required]
        public Guid CourseId { get; set; }
    }
}
