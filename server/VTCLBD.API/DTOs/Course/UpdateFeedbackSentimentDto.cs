using System.ComponentModel.DataAnnotations;

namespace VTCLBD.API.DTOs.Course
{
    public sealed record UpdateFeedbackSentimentDto
    {
        [Required]
        [RegularExpression("^(Positive|Negative|Pending)$", ErrorMessage = "Sentiment must be either Positive, Negative, or Pending.")]
        public string Sentiment { get; init; } = string.Empty;
    }
}
