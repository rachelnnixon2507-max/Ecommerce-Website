namespace Backend.DTOs
{
    public class BulkUpdateResult
    {
        public int OrderId { get; set; }
        public bool Success { get; set; }
        public string? Error { get; set; }
    }
}
