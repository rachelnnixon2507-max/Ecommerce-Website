using Backend.DTOs;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IPaymentService
    {
        Task<string> CreatePaymentIntentAsync(decimal amount, string currency = "usd");
        Task<PaymentResponseDto> ProcessPaymentAsync(PaymentRequestDto paymentRequest);
        Task<PaymentResponseDto> RefundPaymentAsync(string transactionId, decimal? amount = null);
        Task<PaymentResponseDto> GetPaymentStatusAsync(string transactionId);
    }
}