using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations; 

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IEmailService _emailService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderService orderService,
            IPaymentService paymentService,
            IEmailService emailService,
            ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// Get all orders with pagination (Admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var orders = await _orderService.GetAllOrdersAsync(page, pageSize);
                var totalCount = await _orderService.GetTotalOrdersCountAsync();
                
                return Ok(new
                {
                    orders,
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                return StatusCode(500, new { message = "An error occurred while fetching orders" });
            }
        }

        /// <summary>
        /// Get order by ID (User can view their own orders, Admin can view all)
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                int userId = int.Parse(userIdClaim.Value);
                var isAdmin = User.IsInRole("Admin");

                var order = await _orderService.GetOrderByIdAsync(id);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                // Check if user owns this order or is admin
                if (!isAdmin && order.UserId != userId)
                {
                    return Forbid();
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting order {id}");
                return StatusCode(500, new { message = "An error occurred while fetching the order" });
            }
        }

        /// <summary>
        /// Get orders for current user with pagination
        /// </summary>
        [Authorize]
        [HttpGet("user")]
        public async Task<IActionResult> GetUserOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                int userId = int.Parse(userIdClaim.Value);

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var orders = await _orderService.GetUserOrdersAsync(userId, page, pageSize);
                var totalCount = await _orderService.GetUserOrdersCountAsync(userId);

                return Ok(new
                {
                    orders,
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user orders");
                return StatusCode(500, new { message = "An error occurred while fetching your orders" });
            }
        }

        /// <summary>
        /// Create a new order (without immediate payment)
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto orderDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user ID" });
                }

                var order = await _orderService.CreateOrderAsync(userId, orderDto);
                
                if (order == null)
                {
                    return BadRequest(new { message = "Failed to create order" });
                }

                return Ok(new
                {
                    message = "Order created successfully",
                    orderId = order.Id,
                    order
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { message = "An error occurred while creating your order" });
            }
        }

        /// <summary>
        /// Create order with payment processing. Supports "card", "paypal", "gpay"
        /// (all routed through the same simulated payment gateway), and "cod"
        /// (Cash on Delivery — no online charge, settled at delivery time).
        /// </summary>
        [Authorize]
        [HttpPost("with-payment")]
        public async Task<IActionResult> CreateOrderWithPayment([FromBody] OrderCreateDto orderDto)
        {
            try
            {
                // Get the user ID from the token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user ID" });
                }

                // Get user email and name for payment
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
                var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "";

                var paymentMethod = string.IsNullOrWhiteSpace(orderDto.PaymentMethod) ? "card" : orderDto.PaymentMethod;
                if (!Backend.DTOs.PaymentMethod.IsValidMethod(paymentMethod))
                {
                    return BadRequest(new { message = $"Invalid payment method. Valid options are: {string.Join(", ", Backend.DTOs.PaymentMethod.AllMethods)}" });
                }

                // Create the order first
                var order = await _orderService.CreateOrderAsync(userId, orderDto);
                
                if (order == null)
                {
                    return BadRequest(new { message = "Failed to create order" });
                }

                // ── Cash on Delivery: no online gateway call ──
                // The customer pays in cash when the order arrives, so there's
                // nothing to charge right now. We still record a payment "status"
                // (pending_cod) for consistency with the online-payment orders,
                // so admin tooling and reports don't need a special case for "no
                // payment record at all". The order moves straight to Confirmed
                // since there's no payment step that can fail or decline here.
                if (paymentMethod == Backend.DTOs.PaymentMethod.CashOnDelivery)
                {
                    await _orderService.UpdateOrderPaymentInfoAsync(order.Id, null, "pending_cod");
                    await _orderService.UpdateOrderStatusAsync(order.Id, "Confirmed");

                    await SendConfirmationEmailSafe(order.Id);

                    return Ok(new
                    {
                        message = "Order placed successfully. Pay in cash when your order is delivered.",
                        orderId = order.Id,
                        paymentMethod,
                        paymentStatus = "pending_cod"
                    });
                }

                // ── Online methods: card, paypal, gpay ──
                // Validate payment token
                if (string.IsNullOrEmpty(orderDto.PaymentToken))
                {
                    await _orderService.UpdateOrderStatusAsync(order.Id, "PaymentFailed");
                    return BadRequest(new 
                    { 
                        message = "Payment token is required",
                        orderId = order.Id
                    });
                }

                // Process payment
                var paymentRequest = new PaymentRequestDto
                {
                    Amount = order.TotalAmount,
                    Currency = "USD",
                    OrderId = order.Id,
                    PaymentMethod = paymentMethod,
                    PaymentToken = orderDto.PaymentToken,
                    CustomerEmail = userEmail,
                    CustomerName = userName
                };

                var paymentResult = await _paymentService.ProcessPaymentAsync(paymentRequest);

                if (!paymentResult.Success)
                {
                    // If payment fails, mark the order as failed
                    await _orderService.UpdateOrderStatusAsync(order.Id, "PaymentFailed");
                    await _orderService.UpdateOrderPaymentInfoAsync(order.Id, paymentResult.TransactionId, paymentResult.PaymentStatus);
                    
                    return BadRequest(new 
                    { 
                        message = "Payment failed", 
                        orderId = order.Id,
                        error = paymentResult.Message,
                        errorCode = paymentResult.ErrorCode
                    });
                }

                // Update order with payment info
                await _orderService.UpdateOrderPaymentInfoAsync(order.Id, paymentResult.TransactionId, paymentResult.PaymentStatus);
                
                // Update order status to confirmed
                await _orderService.UpdateOrderStatusAsync(order.Id, "Confirmed");

                await SendConfirmationEmailSafe(order.Id);

                return Ok(new 
                { 
                    message = "Order created and payment successful", 
                    orderId = order.Id,
                    paymentMethod,
                    transactionId = paymentResult.TransactionId,
                    paymentStatus = paymentResult.PaymentStatus
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order with payment");
                return StatusCode(500, new { message = "An error occurred while processing your order" });
            }
        }

        /// <summary>
        /// Sends the order confirmation email, swallowing and logging any error.
        /// Shared by every successful checkout path (online payment success and
        /// COD) so we don't repeat the same try/catch boilerplate three times.
        /// </summary>
        private async Task SendConfirmationEmailSafe(int orderId)
        {
            try
            {
                var confirmedOrder = await _orderService.GetOrderByIdAsync(orderId);
                if (confirmedOrder != null)
                {
                    var emailSent = await _emailService.SendOrderConfirmationEmailAsync(confirmedOrder);
                    if (!emailSent)
                    {
                        _logger.LogWarning("Order confirmation email could not be sent for Order {OrderId}.", orderId);
                    }
                }
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Unexpected error sending confirmation email for Order {OrderId}.", orderId);
            }
        }

        /// <summary>
        /// Update order status (Admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto statusDto)
        {
            try
            {
                // Validate status
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                // Check if status transition is allowed
                if (!OrderStatus.IsStatusTransitionAllowed(order.Status, statusDto.Status))
                {
                    return BadRequest(new 
                    { 
                        message = $"Cannot change status from '{order.Status}' to '{statusDto.Status}'",
                        allowedTransitions = OrderStatus.GetAllowedTransitions(order.Status)
                    });
                }

                // If status is Shipped, validate tracking information
                if (statusDto.Status == OrderStatus.Shipped)
                {
                    if (string.IsNullOrEmpty(statusDto.TrackingNumber))
                    {
                        return BadRequest(new { message = "Tracking number is required when shipping an order" });
                    }
                }

                // If status is Cancelled, validate cancellation reason
                if (statusDto.Status == OrderStatus.Cancelled && string.IsNullOrEmpty(statusDto.CancellationReason))
                {
                    return BadRequest(new { message = "Cancellation reason is required when cancelling an order" });
                }

                // Update the status
                var result = await _orderService.UpdateOrderStatusAsync(id, statusDto.Status);
                
                if (!result)
                {
                    return BadRequest(new { message = "Failed to update order status" });
                }

                // Update additional fields if provided
                if (!string.IsNullOrEmpty(statusDto.TrackingNumber) || !string.IsNullOrEmpty(statusDto.Carrier))
                {
                    await _orderService.UpdateOrderShippingInfoAsync(id, statusDto.TrackingNumber, statusDto.Carrier, statusDto.EstimatedDeliveryDate);
                }

                // Send email notification if NotifyCustomer is true. Never let
                // email failures affect the (already successful) status update response.
                if (statusDto.NotifyCustomer)
                {
                    try
                    {
                        var updatedOrder = await _orderService.GetOrderByIdAsync(id);
                        if (updatedOrder != null)
                        {
                            await _emailService.SendOrderStatusUpdateEmailAsync(updatedOrder, statusDto.Status);
                        }
                    }
                    catch (Exception emailEx)
                    {
                        _logger.LogError(emailEx, "Unexpected error sending status update email for Order {OrderId}.", id);
                    }
                }

                return Ok(new
                {
                    message = "Order status updated successfully",
                    orderId = id,
                    newStatus = statusDto.Status,
                    statusDisplayName = OrderStatus.GetStatusDisplayName(statusDto.Status),
                    statusColor = OrderStatus.GetStatusColor(statusDto.Status),
                    notes = statusDto.Notes,
                    estimatedDeliveryDate = statusDto.EstimatedDeliveryDate,
                    trackingNumber = statusDto.TrackingNumber,
                    carrier = statusDto.Carrier,
                    cancellationReason = statusDto.CancellationReason
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating order {id} status");
                return StatusCode(500, new { message = "An error occurred while updating order status" });
            }
        }

        /// <summary>
        /// Cancel order (User or Admin)
        /// </summary>
        [Authorize]
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id, [FromBody] CancelOrderDto? cancelDto = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                int userId = int.Parse(userIdClaim.Value);
                var isAdmin = User.IsInRole("Admin");

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                // Check if user owns this order or is admin
                if (!isAdmin && order.UserId != userId)
                {
                    return Forbid();
                }

                // Check if order can be cancelled
                if (order.Status == "Shipped" || order.Status == "Delivered")
                {
                    return BadRequest(new { message = "Cannot cancel order that has been shipped or delivered" });
                }

                // If order is already cancelled
                if (order.Status == "Cancelled")
                {
                    return BadRequest(new { message = "Order is already cancelled" });
                }

                var result = await _orderService.UpdateOrderStatusAsync(id, "Cancelled");
                
                if (!result)
                {
                    return BadRequest(new { message = "Failed to cancel order" });
                }

                // Store cancellation reason if provided
                if (cancelDto != null && !string.IsNullOrEmpty(cancelDto.Reason))
                {
                    await _orderService.UpdateOrderCancellationReasonAsync(id, cancelDto.Reason);
                }

                // Notify the customer. Never let email failures affect the
                // (already successful) cancellation response.
                try
                {
                    var cancelledOrder = await _orderService.GetOrderByIdAsync(id);
                    if (cancelledOrder != null)
                    {
                        await _emailService.SendOrderStatusUpdateEmailAsync(cancelledOrder, "Cancelled");
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Unexpected error sending cancellation email for Order {OrderId}.", id);
                }

                return Ok(new
                {
                    message = "Order cancelled successfully",
                    orderId = id,
                    cancellationReason = cancelDto?.Reason ?? "No reason provided"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling order {id}");
                return StatusCode(500, new { message = "An error occurred while cancelling your order" });
            }
        }

        /// <summary>
        /// Get order statuses for display (returns list of valid statuses)
        /// </summary>
        [HttpGet("statuses")]
        public IActionResult GetOrderStatuses()
        {
            var statuses = OrderStatus.AllStatuses.Select(status => new
            {
                Value = status,
                Label = OrderStatus.GetStatusDisplayName(status),
                Color = OrderStatus.GetStatusColor(status),
                Description = OrderStatus.GetStatusDescription(status),
                IsTerminal = status == OrderStatus.Delivered || status == OrderStatus.Cancelled || status == OrderStatus.PaymentFailed
            });

            return Ok(statuses);
        }

        /// <summary>
        /// Get order statistics (Admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("stats")]
        public async Task<IActionResult> GetOrderStats()
        {
            try
            {
                var stats = await _orderService.GetOrderStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order statistics");
                return StatusCode(500, new { message = "An error occurred while fetching statistics" });
            }
        }

        /// <summary>
        /// Bulk update order statuses (Admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("bulk-status")]
        public async Task<IActionResult> BulkUpdateOrderStatus([FromBody] BulkUpdateOrderStatusDto bulkDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (bulkDto.OrderIds == null || bulkDto.OrderIds.Count == 0)
                {
                    return BadRequest(new { message = "No order IDs provided" });
                }

                if (bulkDto.OrderIds.Count > 100)
                {
                    return BadRequest(new { message = "Cannot update more than 100 orders at once" });
                }

                var results = new List<BulkUpdateResult>();
                int successCount = 0;
                int failCount = 0;

                foreach (var orderId in bulkDto.OrderIds)
                {
                    try
                    {
                        var order = await _orderService.GetOrderByIdAsync(orderId);
                        if (order == null)
                        {
                            results.Add(new BulkUpdateResult { OrderId = orderId, Success = false, Error = "Order not found" });
                            failCount++;
                            continue;
                        }

                        // Check if status transition is allowed
                        if (!OrderStatus.IsStatusTransitionAllowed(order.Status, bulkDto.NewStatus))
                        {
                            results.Add(new BulkUpdateResult 
                            { 
                                OrderId = orderId, 
                                Success = false, 
                                Error = $"Cannot change status from '{order.Status}' to '{bulkDto.NewStatus}'" 
                            });
                            failCount++;
                            continue;
                        }

                        var result = await _orderService.UpdateOrderStatusAsync(orderId, bulkDto.NewStatus);
                        if (result)
                        {
                            results.Add(new BulkUpdateResult { OrderId = orderId, Success = true });
                            successCount++;
                        }
                        else
                        {
                            results.Add(new BulkUpdateResult { OrderId = orderId, Success = false, Error = "Failed to update" });
                            failCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        results.Add(new BulkUpdateResult { OrderId = orderId, Success = false, Error = ex.Message });
                        failCount++;
                    }
                }

                return Ok(new
                {
                    message = $"Bulk update completed. {successCount} successful, {failCount} failed.",
                    totalProcessed = bulkDto.OrderIds.Count,
                    successCount,
                    failCount,
                    results
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing bulk order status update");
                return StatusCode(500, new { message = "An error occurred during bulk update" });
            }
        }

        /// <summary>
        /// Get orders by status (Admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("by-status/{status}")]
        public async Task<IActionResult> GetOrdersByStatus(string status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (!OrderStatus.IsValidStatus(status))
                {
                    return BadRequest(new { message = $"Invalid status. Valid statuses: {string.Join(", ", OrderStatus.AllStatuses)}" });
                }

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var orders = await _orderService.GetOrdersByStatusAsync(status, page, pageSize);
                var totalCount = await _orderService.GetOrdersByStatusCountAsync(status);

                return Ok(new
                {
                    orders,
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    status,
                    statusDisplayName = OrderStatus.GetStatusDisplayName(status),
                    statusColor = OrderStatus.GetStatusColor(status)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting orders by status {status}");
                return StatusCode(500, new { message = "An error occurred while fetching orders" });
            }
        }


        [Authorize]
[HttpPost("create-payment-intent")]
public async Task<IActionResult> CreatePaymentIntent([FromBody] decimal amount)
{
    try 
    {
        var clientSecret = await _paymentService.CreatePaymentIntentAsync(amount);
        return Ok(new { clientSecret });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
    }
}