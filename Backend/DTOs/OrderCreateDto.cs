using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class OrderCreateDto
    {
        [Required]
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();

        [Required]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Shipping address must be between 5 and 200 characters")]
        public string ShippingAddress { get; set; } = string.Empty;

        /// <summary>
        /// "card", "paypal", "gpay", or "cod". Defaults to "card" for backwards
        /// compatibility with any existing frontend code that doesn't send this field.
        /// </summary>
        public string PaymentMethod { get; set; } = "card";

        /// <summary>
        /// Payment token from the frontend (card/paypal/gpay). NOT required for
        /// Cash on Delivery, since there is no online payment to tokenize —
        /// validated conditionally in the controller instead of with [Required]
        /// here, since [Required] can't see the value of PaymentMethod.
        /// </summary>
        public string? PaymentToken { get; set; }

        // Optional: Add notes field
        public string? Notes { get; set; }
    }

    public class OrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }
}