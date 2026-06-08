using System.ComponentModel.DataAnnotations;

namespace VTCLBD.API.DTOs.Course
{
    public class UpdateFeedbackSentimentDto
    {
        [Required]
        [RegularExpression("^(Positive|Negative|Pending)$", ErrorMessage = "Sentiment must be either Positive, Negative, or Pending.")]
        public string Sentiment { get; set; } = string.Empty;
    }
}
