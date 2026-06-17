using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/orders — all orders (admin)
    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.CreatedDate)
            .Select(o => new
            {
                o.Id,
                o.TotalAmount,
                o.Status,
                o.CreatedDate,
                UserName  = o.User != null ? o.User.Name  : "Unknown",
                UserEmail = o.User != null ? o.User.Email : "Unknown",
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.Quantity,
                    oi.Price,
                    ProductName = oi.Product != null ? oi.Product.Name : "Unknown"
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/orders/user/{userId} — orders for a specific user
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserOrders(int userId)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedDate)
            .Select(o => new
            {
                o.Id,
                o.TotalAmount,
                o.Status,
                o.CreatedDate,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Quantity,
                    oi.Price,
                    ProductName = oi.Product != null ? oi.Product.Name : "Unknown"
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    // PUT: api/orders/{id}/status — update order status (admin)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var validStatuses = new[] { "Pending", "Shipped", "Delivered", "Cancelled" };
        if (!validStatuses.Contains(dto.Status))
            return BadRequest("Invalid status value.");

        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound("Order not found.");

        order.Status = dto.Status;
        await _context.SaveChangesAsync();

        return Ok(new { order.Id, order.Status });
    }

    // POST: api/orders — create order
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest("Order must contain at least one item.");

        var order = new Order
        {
            UserId      = dto.UserId,
            TotalAmount = dto.TotalAmount,
            Status      = "Pending",
            CreatedDate = DateTime.UtcNow
        };

        foreach (var item in dto.Items)
        {
            order.OrderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity  = item.Quantity,
                Price     = item.UnitPrice
            });
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(new { order.Id, order.Status, order.TotalAmount });
    }
}

// DTO classes
public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class CreateOrderDto
{
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; } // maps to Price in OrderItem
}
