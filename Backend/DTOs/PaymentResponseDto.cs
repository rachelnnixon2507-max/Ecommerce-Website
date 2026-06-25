namespace Backend.DTOs
{
    public class PaymentResponseDto
    {
        public bool Success { get; set; } // Controller expects 'Success', not 'IsSuccess'
        public string? TransactionId { get; set; }
        public string? Message { get; set; }
        
        // Fields required by your OrdersController (The "Errors")
        public string? PaymentStatus { get; set; }
        public string? ErrorCode { get; set; }
    }
}