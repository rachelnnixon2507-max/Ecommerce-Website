namespace Backend.Models;

/// <summary>
/// A customer-initiated request against a delivered order — either a Return
/// (refund) or a Replacement (new item shipped). Tracked as its own entity
/// (rather than fields on Order) so an order's full request history is
/// preserved even after a request is resolved, and so multiple requests
/// could exist over an order's lifetime (e.g. a rejected return followed by
/// an accepted replacement request).
/// </summary>
public class OrderRequest
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    /// <summary>"Return" or "Replacement" — see OrderRequestType constants.</summary>
    public string RequestType { get; set; } = string.Empty;

    /// <summary>"Pending", "Approved", or "Rejected" — see OrderRequestStatus constants.</summary>
    public string Status { get; set; } = "Pending";

    /// <summary>The customer's reason for the return/replacement.</summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>Admin's note when approving or rejecting (optional).</summary>
    public string? AdminNote { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    /// <summary>When an admin approved or rejected the request (null while Pending).</summary>
    public DateTime? ResolvedDate { get; set; }

    /// <summary>Which admin user resolved this request (optional, nice for audit trail).</summary>
    public int? ResolvedByUserId { get; set; }
}
