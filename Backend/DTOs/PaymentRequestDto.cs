namespace Backend.DTOs
{
    public class PaymentRequestDto
    {
        // Stripe Fields
        public decimal Amount { get; set; }
        public string? PaymentMethodId { get; set; } // The Stripe PM ID
        public string? Currency { get; set; } = "usd";

        // Fields required by your OrdersController (The "Errors")
        public int OrderId { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentToken { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerName { get; set; }
    }
}