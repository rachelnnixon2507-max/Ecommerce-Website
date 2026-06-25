using Backend.DTOs;
using Backend.Services;
using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly AppDbContext _context;

        public PaymentsController(IPaymentService paymentService, AppDbContext context)
        {
            _paymentService = paymentService;
            _context = context;
        }

        public class CreateIntentRequestDto
        {
            public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
        }

        /// <summary>
        /// Creates a Stripe PaymentIntent for the items in the cart.
        /// Currency is INR (paise as the smallest unit).
        /// </summary>
        [HttpPost("create-intent")]
        public async Task<IActionResult> CreateIntent([FromBody] CreateIntentRequestDto request)
        {
            if (request.OrderItems == null || !request.OrderItems.Any())
                return BadRequest(new { Message = "Cart is empty" });

            decimal totalAmount = 0;
            foreach (var item in request.OrderItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                    return BadRequest(new { Message = $"Product with ID {item.ProductId} not found" });

                if (product.Stock < item.Quantity)
                    return BadRequest(new { Message = $"Insufficient stock for {product.Name}" });

                totalAmount += product.Price * item.Quantity;
            }

            if (totalAmount <= 0)
                return BadRequest(new { Message = "Total amount must be greater than 0" });

            // Stripe requires a minimum of 50 paise (₹0.50) for INR
            if (totalAmount < 1)
                return BadRequest(new { Message = "Order total is too small to process" });

            try
            {
                // Use INR so the amount in Stripe matches what the user sees in ₹
                var clientSecret = await _paymentService.CreatePaymentIntentAsync(totalAmount, "inr");
                return Ok(new { ClientSecret = clientSecret });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }
    }
}
