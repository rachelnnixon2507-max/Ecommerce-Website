using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(AppDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<OrderResponseDto?> CreateOrderAsync(int userId, OrderCreateDto orderDto)
        {
            try
            {
                // Calculate total from actual product prices in the database
                decimal total = 0;
                var orderItems = new List<OrderItem>();

                foreach (var item in orderDto.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                        throw new Exception($"Product {item.ProductId} not found");

                    total += product.Price * item.Quantity;

                    orderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Price = product.Price
                    });
                }

                var order = new Order
                {
                    UserId = userId,
                    TotalAmount = total,
                    Status = "Pending",
                    ShippingAddress = orderDto.ShippingAddress,
                    Notes = orderDto.Notes,
                    PaymentMethod = string.IsNullOrWhiteSpace(orderDto.PaymentMethod) ? "card" : orderDto.PaymentMethod,
                    CreatedDate = DateTime.UtcNow,
                    OrderItems = orderItems
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                return await GetOrderByIdAsync(order.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating order for user {userId}");
                throw;
            }
        }

        public async Task<OrderResponseDto?> GetOrderByIdAsync(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null) return null;

                return MapToDto(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting order {id}");
                throw;
            }
        }

        public async Task<List<OrderResponseDto>> GetUserOrdersAsync(int userId, int page = 1, int pageSize = 10)
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return orders.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting orders for user {userId}");
                throw;
            }
        }

        public async Task<int> GetUserOrdersCountAsync(int userId)
        {
            return await _context.Orders.CountAsync(o => o.UserId == userId);
        }

        public async Task<List<OrderResponseDto>> GetAllOrdersAsync(int page = 1, int pageSize = 10)
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .OrderByDescending(o => o.CreatedDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return orders.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                throw;
            }
        }

        public async Task<int> GetTotalOrdersCountAsync()
        {
            return await _context.Orders.CountAsync();
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null) return false;

                order.Status = status;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating order {orderId} status");
                throw;
            }
        }

        public async Task<bool> UpdateOrderPaymentInfoAsync(int orderId, string? transactionId, string? paymentStatus)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null) return false;

                order.TransactionId = transactionId;
                order.PaymentStatus = paymentStatus;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating payment info for order {orderId}");
                throw;
            }
        }

        public async Task<bool> UpdateOrderPaymentMethodAsync(int orderId, string paymentMethod)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null) return false;

                order.PaymentMethod = paymentMethod;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating payment method for order {orderId}");
                throw;
            }
        }

        public async Task<bool> UpdateOrderShippingInfoAsync(int orderId, string? trackingNumber, string? carrier, DateTime? estimatedDeliveryDate)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null) return false;

                order.TrackingNumber = trackingNumber;
                order.Carrier = carrier;
                order.EstimatedDeliveryDate = estimatedDeliveryDate;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating shipping info for order {orderId}");
                throw;
            }
        }

        public async Task<bool> UpdateOrderCancellationReasonAsync(int orderId, string reason)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null) return false;

                order.CancellationReason = reason;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating cancellation reason for order {orderId}");
                throw;
            }
        }

        public async Task<OrderStatisticsDto> GetOrderStatisticsAsync()
        {
            var orders = await _context.Orders.ToListAsync();
            var today = DateTime.UtcNow.Date;

            return new OrderStatisticsDto
            {
                TotalOrders = orders.Count,
                TotalRevenue = orders.Sum(o => o.TotalAmount),
                AverageOrderValue = orders.Count > 0 ? orders.Average(o => o.TotalAmount) : 0,
                OrdersToday = orders.Count(o => o.CreatedDate.Date == today),
                RevenueToday = orders.Where(o => o.CreatedDate.Date == today).Sum(o => o.TotalAmount),
                OrdersByStatus = orders.GroupBy(o => o.Status).ToDictionary(g => g.Key, g => g.Count()),
                PendingOrders = orders.Count(o => o.Status == "Pending"),
                ShippedOrders = orders.Count(o => o.Status == "Shipped"),
                DeliveredOrders = orders.Count(o => o.Status == "Delivered"),
                CancelledOrders = orders.Count(o => o.Status == "Cancelled"),
            };
        }

        public async Task<List<OrderResponseDto>> GetOrdersByStatusAsync(string status, int page, int pageSize)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        public async Task<int> GetOrdersByStatusCountAsync(string status)
        {
            return await _context.Orders.CountAsync(o => o.Status == status);
        }

        // ── Helper: map Order entity → OrderResponseDto ──
        private static OrderResponseDto MapToDto(Order order)
        {
            return new OrderResponseDto
            {
                Id = order.Id,
                UserId = order.UserId,
                UserName = order.User?.Name ?? "",
                UserEmail = order.User?.Email ?? "",
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                OrderDate = order.CreatedDate,
                TransactionId = order.TransactionId,
                PaymentStatus = order.PaymentStatus,
                PaymentMethod = order.PaymentMethod,
                Notes = order.Notes,
                CancellationReason = order.CancellationReason,
                TrackingNumber = order.TrackingNumber,
                Carrier = order.Carrier,
                EstimatedDeliveryDate = order.EstimatedDeliveryDate,
                OrderItems = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "",
                    ProductImage = oi.Product?.ImageUrl ?? "",
                    UnitPrice = oi.Price,
                    Quantity = oi.Quantity,
                    TotalPrice = oi.Price * oi.Quantity
                }).ToList()
            };
        }
    }
}