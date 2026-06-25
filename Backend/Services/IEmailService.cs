using Backend.DTOs;

namespace Backend.Services
{
    /// <summary>
    /// Service responsible for sending transactional emails (order confirmation,
    /// status updates, etc). Implementations should never throw out of the
    /// request pipeline for email failures — a failed email must not fail an order.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Sends an order confirmation email to the customer after a successful
        /// payment and order creation. Returns true if the email was sent
        /// (or queued) successfully, false otherwise. Never throws.
        /// </summary>
        Task<bool> SendOrderConfirmationEmailAsync(OrderResponseDto order);

        /// <summary>
        /// Sends a notification email when an order's status changes
        /// (e.g. Shipped, Delivered, Cancelled). Never throws.
        /// </summary>
        Task<bool> SendOrderStatusUpdateEmailAsync(OrderResponseDto order, string newStatus);
    }
}
