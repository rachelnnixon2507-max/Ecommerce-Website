using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    /// <summary>
    /// Data Transfer Object for updating order status
    /// </summary>
    public class UpdateOrderStatusDto
    {
        /// <summary>
        /// The new status to apply to the order
        /// Valid values: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, PaymentFailed
        /// </summary>
        [Required(ErrorMessage = "Status is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Status must be between 3 and 50 characters")]
        [RegularExpression(@"^(Pending|Confirmed|Processing|Shipped|Delivered|Cancelled|PaymentFailed)$", 
            ErrorMessage = "Invalid status. Valid values are: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, PaymentFailed")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Optional notes or reason for status change
        /// </summary>
        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        /// <summary>
        /// Flag to indicate if customer should be notified about status change
        /// </summary>
        public bool NotifyCustomer { get; set; } = true;

        /// <summary>
        /// Optional estimated delivery date (for Shipped status)
        /// </summary>
        public DateTime? EstimatedDeliveryDate { get; set; }

        /// <summary>
        /// Optional tracking number (for Shipped status)
        /// </summary>
        [StringLength(100, ErrorMessage = "Tracking number cannot exceed 100 characters")]
        public string? TrackingNumber { get; set; }

        /// <summary>
        /// Optional shipping carrier name (for Shipped status)
        /// </summary>
        [StringLength(100, ErrorMessage = "Carrier name cannot exceed 100 characters")]
        public string? Carrier { get; set; }

        /// <summary>
        /// Optional cancellation reason (for Cancelled status)
        /// </summary>
        [StringLength(500, ErrorMessage = "Cancellation reason cannot exceed 500 characters")]
        public string? CancellationReason { get; set; }
    }
}