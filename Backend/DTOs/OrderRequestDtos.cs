using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    /// <summary>
    /// Submitted by a customer to request a Return or Replacement on a
    /// delivered order.
    /// </summary>
    public class CreateOrderRequestDto
    {
        [Required(ErrorMessage = "Request type is required")]
        [RegularExpression(@"^(Return|Replacement)$", ErrorMessage = "Type must be 'Return' or 'Replacement'")]
        public string RequestType { get; set; } = string.Empty;

        [Required(ErrorMessage = "A reason is required")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Reason must be between 5 and 500 characters")]
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>
    /// Submitted by an admin to approve or reject a pending order request.
    /// </summary>
    public class ResolveOrderRequestDto
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression(@"^(Approved|Rejected)$", ErrorMessage = "Status must be 'Approved' or 'Rejected'")]
        public string Status { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Admin note cannot exceed 500 characters")]
        public string? AdminNote { get; set; }
    }

    /// <summary>
    /// What we return to the client for an order request — flattened with
    /// just enough order/user context to render a useful list without an
    /// extra round trip.
    /// </summary>
    public class OrderRequestResponseDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public decimal OrderTotalAmount { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string RequestType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? AdminNote { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
    }
}
