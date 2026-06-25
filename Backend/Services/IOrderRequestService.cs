using Backend.DTOs;

namespace Backend.Services
{
    public interface IOrderRequestService
    {
        /// <summary>
        /// Creates a new Return or Replacement request for an order. Returns null
        /// if the order doesn't exist, doesn't belong to the user, isn't eligible
        /// (must be Delivered), or already has a Pending request open.
        /// </summary>
        Task<(OrderRequestResponseDto? Request, string? Error)> CreateRequestAsync(int userId, int orderId, CreateOrderRequestDto dto);

        Task<OrderRequestResponseDto?> GetByIdAsync(int id);

        Task<List<OrderRequestResponseDto>> GetUserRequestsAsync(int userId);

        Task<List<OrderRequestResponseDto>> GetAllRequestsAsync(string? statusFilter = null);

        /// <summary>
        /// Admin approves or rejects a pending request. Returns null if the
        /// request doesn't exist or is not in Pending status.
        /// </summary>
        Task<(OrderRequestResponseDto? Request, string? Error)> ResolveRequestAsync(int requestId, int adminUserId, ResolveOrderRequestDto dto);
    }
}
