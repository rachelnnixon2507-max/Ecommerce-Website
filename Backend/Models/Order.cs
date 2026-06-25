namespace Backend.Models;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string ShippingAddress { get; set; } = "";
    public string? Notes { get; set; }
    public string? TransactionId { get; set; }
    public string? PaymentStatus { get; set; }

    /// <summary>"card", "paypal", "gpay", or "cod" — see PaymentMethod constants.</summary>
    public string PaymentMethod { get; set; } = "card";
    public string? CancellationReason { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}