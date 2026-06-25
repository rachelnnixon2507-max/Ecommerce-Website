using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class OrderRequestService : IOrderRequestService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OrderRequestService> _logger;

        public OrderRequestService(AppDbContext context, ILogger<OrderRequestService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(OrderRequestResponseDto? Request, string? Error)> CreateRequestAsync(
            int userId, int orderId, CreateOrderRequestDto dto)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return (null, "Order not found");

                if (order.UserId != userId)
                    return (null, "You can only request returns/replacements for your own orders");

                if (order.Status != "Delivered")
                    return (null, "Return/replacement requests can only be made for delivered orders");

                // Check for existing pending request
                var existing = await _context.OrderRequests
                    .AnyAsync(r => r.OrderId == orderId && r.Status == "Pending");

                if (existing)
                    return (null, "There is already a pending request for this order");

                var request = new OrderRequest
                {
                    OrderId = orderId,
                    UserId = userId,
                    RequestType = dto.RequestType,
                    Reason = dto.Reason,
                    Status = "Pending",
                    CreatedDate = DateTime.UtcNow
                };

                _context.OrderRequests.Add(request);
                await _context.SaveChangesAsync();

                // Reload with navigation properties
                var saved = await _context.OrderRequests
                    .Include(r => r.Order).ThenInclude(o => o!.User)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == request.Id);

                return (MapToDto(saved!), null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order request for order {OrderId}", orderId);
                throw;
            }
        }

        public async Task<OrderRequestResponseDto?> GetByIdAsync(int id)
        {
            var request = await _context.OrderRequests
                .Include(r => r.Order).ThenInclude(o => o!.User)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            return request == null ? null : MapToDto(request);
        }

        public async Task<List<OrderRequestResponseDto>> GetUserRequestsAsync(int userId)
        {
            var requests = await _context.OrderRequests
                .Include(r => r.Order).ThenInclude(o => o!.User)
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();

            return requests.Select(MapToDto).ToList();
        }

        public async Task<List<OrderRequestResponseDto>> GetAllRequestsAsync(string? statusFilter = null)
        {
            var query = _context.OrderRequests
                .Include(r => r.Order).ThenInclude(o => o!.User)
                .Include(r => r.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(statusFilter))
                query = query.Where(r => r.Status == statusFilter);

            var requests = await query.OrderByDescending(r => r.CreatedDate).ToListAsync();
            return requests.Select(MapToDto).ToList();
        }

        public async Task<(OrderRequestResponseDto? Request, string? Error)> ResolveRequestAsync(
            int requestId, int adminUserId, ResolveOrderRequestDto dto)
        {
            try
            {
                var request = await _context.OrderRequests
                    .Include(r => r.Order).ThenInclude(o => o!.User)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == requestId);

                if (request == null)
                    return (null, "Request not found");

                if (request.Status != "Pending")
                    return (null, "Only pending requests can be resolved");

                request.Status = dto.Status;
                request.AdminNote = dto.AdminNote;
                request.ResolvedDate = DateTime.UtcNow;
                request.ResolvedByUserId = adminUserId;

                await _context.SaveChangesAsync();

                return (MapToDto(request), null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving order request {RequestId}", requestId);
                throw;
            }
        }

        private static OrderRequestResponseDto MapToDto(OrderRequest r) => new()
        {
            Id = r.Id,
            OrderId = r.OrderId,
            OrderTotalAmount = r.Order?.TotalAmount ?? 0,
            OrderStatus = r.Order?.Status ?? "",
            UserId = r.UserId,
            UserName = r.User?.Name ?? r.Order?.User?.Name ?? "",
            UserEmail = r.User?.Email ?? r.Order?.User?.Email ?? "",
            RequestType = r.RequestType,
            Status = r.Status,
            Reason = r.Reason,
            AdminNote = r.AdminNote,
            CreatedDate = r.CreatedDate,
            ResolvedDate = r.ResolvedDate
        };
    }
}
