using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/order-requests")]
    public class OrderRequestsController : ControllerBase
    {
        private readonly IOrderRequestService _orderRequestService;
        private readonly IOrderService _orderService;
        private readonly IEmailService _emailService;
        private readonly ILogger<OrderRequestsController> _logger;

        public OrderRequestsController(
            IOrderRequestService orderRequestService,
            IOrderService orderService,
            IEmailService emailService,
            ILogger<OrderRequestsController> logger)
        {
            _orderRequestService = orderRequestService;
            _orderService = orderService;
            _emailService = emailService;
            _logger = logger;
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out userId);
        }

        /// <summary>
        /// Submit a Return or Replacement request for one of the caller's own orders.
        /// </summary>
        [Authorize]
        [HttpPost("order/{orderId}")]
        public async Task<IActionResult> CreateRequest(int orderId, [FromBody] CreateOrderRequestDto dto)
        {
            try
            {
                if (!TryGetUserId(out var userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var (request, error) = await _orderRequestService.CreateRequestAsync(userId, orderId, dto);

                if (request == null)
                {
                    return BadRequest(new { message = error ?? "Failed to create request" });
                }

                return Ok(new
                {
                    message = $"{dto.RequestType} request submitted successfully",
                    request
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order request for order {OrderId}", orderId);
                return StatusCode(500, new { message = "An error occurred while submitting your request" });
            }
        }

        /// <summary>
        /// Get the caller's own return/replacement requests.
        /// </summary>
        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                if (!TryGetUserId(out var userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var requests = await _orderRequestService.GetUserRequestsAsync(userId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching order requests for current user");
                return StatusCode(500, new { message = "An error occurred while fetching your requests" });
            }
        }

        /// <summary>
        /// Get a single request by ID (owner or admin).
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                if (!TryGetUserId(out var userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var request = await _orderRequestService.GetByIdAsync(id);
                if (request == null)
                {
                    return NotFound(new { message = "Request not found" });
                }

                if (!User.IsInRole("Admin") && request.UserId != userId)
                {
                    return Forbid();
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching order request {Id}", id);
                return StatusCode(500, new { message = "An error occurred while fetching the request" });
            }
        }

        /// <summary>
        /// Get all return/replacement requests (Admin only), optionally filtered by status.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null)
        {
            try
            {
                var requests = await _orderRequestService.GetAllRequestsAsync(status);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all order requests");
                return StatusCode(500, new { message = "An error occurred while fetching requests" });
            }
        }

        /// <summary>
        /// Approve or reject a pending return/replacement request (Admin only).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/resolve")]
        public async Task<IActionResult> Resolve(int id, [FromBody] ResolveOrderRequestDto dto)
        {
            try
            {
                if (!TryGetUserId(out var adminUserId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var (request, error) = await _orderRequestService.ResolveRequestAsync(id, adminUserId, dto);

                if (request == null)
                {
                    return BadRequest(new { message = error ?? "Failed to resolve request" });
                }

                // Notify the customer of the outcome. Never let email failures
                // affect the (already successful) resolution response.
                try
                {
                    var order = await _orderService.GetOrderByIdAsync(request.OrderId);
                    if (order != null)
                    {
                        var statusLabel = dto.Status == "Approved"
                            ? $"{request.RequestType}Approved"
                            : $"{request.RequestType}Rejected";
                        await _emailService.SendOrderStatusUpdateEmailAsync(order, statusLabel);
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Unexpected error sending request resolution email for OrderRequest {Id}", id);
                }

                return Ok(new
                {
                    message = $"Request {dto.Status.ToLower()} successfully",
                    request
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving order request {Id}", id);
                return StatusCode(500, new { message = "An error occurred while resolving the request" });
            }
        }
    }
}