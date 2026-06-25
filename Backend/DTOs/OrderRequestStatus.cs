namespace Backend.DTOs
{
    /// <summary>
    /// Constants and helpers for the "type" field of an OrderRequest
    /// (Return vs Replacement).
    /// </summary>
    public static class OrderRequestType
    {
        public const string Return = "Return";
        public const string Replacement = "Replacement";

        public static readonly string[] AllTypes = { Return, Replacement };

        public static bool IsValidType(string type) =>
            Array.Exists(AllTypes, t => t == type);
    }

    /// <summary>
    /// Constants and helpers for the "status" field of an OrderRequest
    /// (the admin approval workflow).
    /// </summary>
    public static class OrderRequestStatus
    {
        public const string Pending = "Pending";
        public const string Approved = "Approved";
        public const string Rejected = "Rejected";

        public static readonly string[] AllStatuses = { Pending, Approved, Rejected };

        public static bool IsValidStatus(string status) =>
            Array.Exists(AllStatuses, s => s == status);
    }

    /// <summary>
    /// Constants and helpers for the "PaymentMethod" field of an Order.
    /// </summary>
    public static class PaymentMethod
    {
        public const string Card = "card";
        public const string PayPal = "paypal";
        public const string GPay = "gpay";
        public const string CashOnDelivery = "cod";

        public static readonly string[] AllMethods = { Card, PayPal, GPay, CashOnDelivery };

        public static bool IsValidMethod(string method) =>
            Array.Exists(AllMethods, m => m == method);

        /// <summary>
        /// Methods that require an online payment gateway call (card/paypal/gpay
        /// all go through PaymentService.ProcessPaymentAsync). COD does not —
        /// it's settled in cash at delivery time, so there is nothing to "process"
        /// online at checkout.
        /// </summary>
        public static bool RequiresOnlineProcessing(string method) => method != CashOnDelivery;
    }
}
