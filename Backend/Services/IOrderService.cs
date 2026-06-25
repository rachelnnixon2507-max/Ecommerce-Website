using Backend.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IOrderService
    {
        Task<OrderResponseDto?> CreateOrderAsync(int userId, OrderCreateDto orderDto);
        Task<OrderResponseDto?> GetOrderByIdAsync(int id);
        Task<List<OrderResponseDto>> GetUserOrdersAsync(int userId, int page = 1, int pageSize = 10);
        Task<int> GetUserOrdersCountAsync(int userId);
        Task<List<OrderResponseDto>> GetAllOrdersAsync(int page = 1, int pageSize = 10);
        Task<int> GetTotalOrdersCountAsync();
        Task<bool> UpdateOrderStatusAsync(int orderId, string status);
        Task<bool> UpdateOrderPaymentInfoAsync(int orderId, string? transactionId, string? paymentStatus);
        Task<bool> UpdateOrderPaymentMethodAsync(int orderId, string paymentMethod);
        Task<OrderStatisticsDto> GetOrderStatisticsAsync();
        Task<bool> UpdateOrderShippingInfoAsync(int orderId, string? trackingNumber, string? carrier, DateTime? estimatedDeliveryDate);
        Task<bool> UpdateOrderCancellationReasonAsync(int orderId, string reason);
        Task<List<OrderResponseDto>> GetOrdersByStatusAsync(string status, int page, int pageSize);
        Task<int> GetOrdersByStatusCountAsync(string status);
    }
}