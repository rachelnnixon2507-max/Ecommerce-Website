using Stripe;
using Microsoft.Extensions.Configuration;
using Backend.Models;
using Backend.DTOs;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(IConfiguration config, ILogger<PaymentService> logger)
        {
            _config = config;
            _logger = logger;
            StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
        }

        public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency = "inr")
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(amount * 100), // Stripe uses smallest currency unit (paise for INR)
                Currency = currency,
                PaymentMethodTypes = new List<string> { "card" },
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);
            return intent.ClientSecret;
        }

        public async Task<PaymentResponseDto> ProcessPaymentAsync(PaymentRequestDto paymentRequest)
        {
            try
            {
                if (string.IsNullOrEmpty(paymentRequest.PaymentToken))
                {
                    return new PaymentResponseDto { Success = false, Message = "Payment token is missing" };
                }

                var method = (paymentRequest.PaymentMethod ?? "card").ToLowerInvariant();

                // ── Non-Stripe simulated methods (GPay mock, PayPal mock) ──
                // The frontend sends a prefixed mock token for these methods.
                // We accept them directly without touching Stripe, simulating
                // a successful authorisation from the respective gateway.
                if (method == "gpay" || method == "paypal")
                {
                    _logger.LogInformation(
                        "Simulated {Method} payment accepted. Token={Token}, OrderId={OrderId}",
                        method, paymentRequest.PaymentToken, paymentRequest.OrderId);

                    return new PaymentResponseDto
                    {
                        Success = true,
                        TransactionId = paymentRequest.PaymentToken,
                        PaymentStatus = "succeeded",
                        Message = $"Payment via {method} accepted"
                    };
                }

                // ── Stripe card ──
                // The frontend sends the PaymentIntent ID (pi_xxx) after
                // stripe.confirmPayment() has already succeeded in the browser.
                // We retrieve the intent to verify it truly succeeded server-side.
                var intentId = paymentRequest.PaymentToken;
                var service = new PaymentIntentService();
                var intent = await service.GetAsync(intentId);

                // Accept "succeeded" (normal) or "requires_capture" (manual capture mode)
                var isSuccess = intent.Status == "succeeded" || intent.Status == "requires_capture";

                if (!isSuccess)
                {
                    _logger.LogWarning(
                        "Stripe PaymentIntent {IntentId} has unexpected status '{Status}' for Order {OrderId}.",
                        intentId, intent.Status, paymentRequest.OrderId);
                }

                return new PaymentResponseDto
                {
                    Success = isSuccess,
                    TransactionId = intent.Id,
                    PaymentStatus = intent.Status,
                    Message = isSuccess ? $"Payment {intent.Status}" : $"Payment not completed (status: {intent.Status})"
                };
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe ProcessPaymentAsync failed");
                return new PaymentResponseDto { Success = false, Message = ex.Message, ErrorCode = ex.StripeError?.Code };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ProcessPaymentAsync unexpected error");
                return new PaymentResponseDto { Success = false, Message = "Payment processing error" };
            }
        }

        public async Task<PaymentResponseDto> RefundPaymentAsync(string transactionId, decimal? amount = null)
        {
            try
            {
                var options = new RefundCreateOptions { PaymentIntent = transactionId };
                if (amount.HasValue) options.Amount = (long)(amount.Value * 100);

                var service = new RefundService();
                var refund = await service.CreateAsync(options);

                return new PaymentResponseDto
                {
                    Success = refund.Status == "succeeded",
                    TransactionId = refund.Id,
                    PaymentStatus = refund.Status,
                    Message = $"Refund {refund.Status}"
                };
            }
            catch (StripeException ex)
            {
                return new PaymentResponseDto { Success = false, Message = ex.Message };
            }
        }

        public async Task<PaymentResponseDto> GetPaymentStatusAsync(string transactionId)
        {
            try
            {
                var service = new PaymentIntentService();
                var intent = await service.GetAsync(transactionId);

                return new PaymentResponseDto
                {
                    Success = intent.Status == "succeeded",
                    TransactionId = intent.Id,
                    PaymentStatus = intent.Status
                };
            }
            catch (StripeException ex)
            {
                return new PaymentResponseDto { Success = false, Message = ex.Message };
            }
        }
    }
}
