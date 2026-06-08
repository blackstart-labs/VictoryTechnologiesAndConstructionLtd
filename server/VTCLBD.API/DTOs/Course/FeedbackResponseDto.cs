namespace VTCLBD.API.DTOs.Course
{
    public class FeedbackResponseDto
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Sentiment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
