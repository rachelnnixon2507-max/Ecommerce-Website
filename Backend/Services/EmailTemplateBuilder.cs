using System.Globalization;
using System.Text;
using Backend.DTOs;

namespace Backend.Services
{
    /// <summary>
    /// Builds the HTML content for order-related emails. Kept separate from
    /// EmailService so the transport logic and the content logic can change
    /// independently (e.g. swapping in Razor templates later).
    /// </summary>
    public static class EmailTemplateBuilder
    {
        private static string FormatCurrency(decimal amount) =>
            amount.ToString("C2", new CultureInfo("en-IN"));

        private static string FormatDate(DateTime utcDate) =>
            // Store dates are UTC; render in a fixed, friendly, unambiguous format.
            utcDate.ToString("dd MMM yyyy, hh:mm tt 'UTC'", CultureInfo.InvariantCulture);

        private static string FormatPaymentMethod(string? method) => method switch
        {
            "card" => "Credit/Debit Card",
            "paypal" => "PayPal",
            "gpay" => "Google Pay (UPI)",
            "cod" => "Cash on Delivery",
            _ => method ?? "—",
        };

        public static string BuildOrderConfirmationEmail(OrderResponseDto order)
        {
            var itemsHtml = new StringBuilder();
            foreach (var item in order.OrderItems)
            {
                itemsHtml.Append($@"
                <tr>
                    <td style=""padding:12px 0;border-bottom:1px solid #eee;"">
                        <strong>{System.Net.WebUtility.HtmlEncode(item.ProductName)}</strong><br/>
                        <span style=""color:#666;font-size:13px;"">Qty: {item.Quantity} &times; {FormatCurrency(item.UnitPrice)}</span>
                    </td>
                    <td style=""padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-weight:bold;"">
                        {FormatCurrency(item.TotalPrice)}
                    </td>
                </tr>");
            }

            return $@"
<!DOCTYPE html>
<html>
<head><meta charset=""utf-8""/></head>
<body style=""margin:0;padding:0;background:#f4f4f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;"">
  <div style=""max-width:600px;margin:0 auto;padding:24px;"">
    <div style=""background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);"">
      <div style=""background:linear-gradient(135deg,#7c3aed,#f43f5e);padding:28px 32px;color:#ffffff;"">
        <h1 style=""margin:0;font-size:22px;"">Order Confirmed! 🎉</h1>
        <p style=""margin:6px 0 0;opacity:0.9;font-size:14px;"">Thank you for shopping with Rachel's Store</p>
      </div>

      <div style=""padding:28px 32px;"">
        <p style=""font-size:15px;color:#333;"">Hi {System.Net.WebUtility.HtmlEncode(order.UserName)},</p>
        <p style=""font-size:15px;color:#333;"">
          We've received your payment and your order is now <strong>{System.Net.WebUtility.HtmlEncode(order.Status)}</strong>.
          Here's a summary:
        </p>

        <table style=""width:100%;border-collapse:collapse;font-size:13px;color:#666;margin:18px 0;"">
          <tr>
            <td style=""padding:4px 0;"">Order Number</td>
            <td style=""padding:4px 0;text-align:right;font-weight:bold;color:#111;"">#{order.Id}</td>
          </tr>
          <tr>
            <td style=""padding:4px 0;"">Order Date</td>
            <td style=""padding:4px 0;text-align:right;"">{FormatDate(order.OrderDate)}</td>
          </tr>
          <tr>
            <td style=""padding:4px 0;"">Payment Method</td>
            <td style=""padding:4px 0;text-align:right;"">{FormatPaymentMethod(order.PaymentMethod)}</td>
          </tr>
          {(string.IsNullOrEmpty(order.TransactionId) ? "" : $@"<tr><td style=""padding:4px 0;"">Transaction ID</td><td style=""padding:4px 0;text-align:right;"">{System.Net.WebUtility.HtmlEncode(order.TransactionId)}</td></tr>")}
          {(order.PaymentMethod == "cod" ? @"<tr><td style=""padding:4px 0;"" colspan=""2""><em>Please keep the exact amount ready for the delivery agent.</em></td></tr>" : "")}
        </table>

        <table style=""width:100%;border-collapse:collapse;margin-top:8px;"">
          <thead>
            <tr>
              <th style=""text-align:left;font-size:12px;color:#999;text-transform:uppercase;border-bottom:2px solid #eee;padding-bottom:8px;"">Item</th>
              <th style=""text-align:right;font-size:12px;color:#999;text-transform:uppercase;border-bottom:2px solid #eee;padding-bottom:8px;"">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {itemsHtml}
          </tbody>
        </table>

        <div style=""text-align:right;margin-top:16px;font-size:18px;font-weight:bold;color:#111;"">
          Total: {FormatCurrency(order.TotalAmount)}
        </div>

        <div style=""margin-top:24px;padding:16px;background:#f8f8fb;border-radius:8px;font-size:13px;color:#555;"">
          <strong>Shipping to:</strong><br/>
          {System.Net.WebUtility.HtmlEncode(order.ShippingAddress)}
        </div>

        <p style=""font-size:13px;color:#999;margin-top:28px;"">
          You can view your order anytime from the ""My Orders"" page in your account.
          If you have any questions, just reply to this email.
        </p>
      </div>

      <div style=""background:#fafafa;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;"">
        Rachel's Store · This is an automated message, please do not reply if not needed.
      </div>
    </div>
  </div>
</body>
</html>";
        }

        public static string BuildOrderStatusUpdateEmail(OrderResponseDto order, string newStatus)
        {
            var statusMessages = new Dictionary<string, string>
            {
                { "Confirmed", "Your order has been confirmed and is being prepared." },
                { "Processing", "Your order is now being processed." },
                { "Shipped", "Great news — your order is on its way!" },
                { "Delivered", "Your order has been delivered. We hope you love it!" },
                { "Cancelled", "Your order has been cancelled." },
                { "PaymentFailed", "There was an issue with your payment for this order." },
                { "ReturnApproved", "Your return request has been approved. Your refund is being processed." },
                { "ReturnRejected", "Your return request has been reviewed and could not be approved. See details below." },
                { "ReplacementApproved", "Your replacement request has been approved. A new item is being prepared for shipment." },
                { "ReplacementRejected", "Your replacement request has been reviewed and could not be approved. See details below." },
            };
            var message = statusMessages.TryGetValue(newStatus, out var m) ? m : $"Your order status is now {newStatus}.";

            // These synthetic "statuses" describe a request outcome, not the order's
            // actual Status field — show a friendlier label for them in the email
            // body so customers aren't confused by camelCase technical names.
            var displayLabels = new Dictionary<string, string>
            {
                { "ReturnApproved", "Return Approved" },
                { "ReturnRejected", "Return Rejected" },
                { "ReplacementApproved", "Replacement Approved" },
                { "ReplacementRejected", "Replacement Rejected" },
            };
            var displayStatus = displayLabels.TryGetValue(newStatus, out var d) ? d : newStatus;

            var trackingHtml = "";
            if (newStatus == "Shipped" && !string.IsNullOrEmpty(order.TrackingNumber))
            {
                trackingHtml = $@"
                <div style=""margin-top:16px;padding:16px;background:#eef2ff;border-radius:8px;font-size:13px;color:#3730a3;"">
                    <strong>Tracking Number:</strong> {System.Net.WebUtility.HtmlEncode(order.TrackingNumber)}<br/>
                    {(string.IsNullOrEmpty(order.Carrier) ? "" : $"<strong>Carrier:</strong> {System.Net.WebUtility.HtmlEncode(order.Carrier)}")}
                </div>";
            }

            return $@"
<!DOCTYPE html>
<html>
<head><meta charset=""utf-8""/></head>
<body style=""margin:0;padding:0;background:#f4f4f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;"">
  <div style=""max-width:600px;margin:0 auto;padding:24px;"">
    <div style=""background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);"">
      <div style=""background:linear-gradient(135deg,#7c3aed,#f43f5e);padding:28px 32px;color:#ffffff;"">
        <h1 style=""margin:0;font-size:22px;"">Order Update</h1>
        <p style=""margin:6px 0 0;opacity:0.9;font-size:14px;"">Order #{order.Id}</p>
      </div>
      <div style=""padding:28px 32px;"">
        <p style=""font-size:15px;color:#333;"">Hi {System.Net.WebUtility.HtmlEncode(order.UserName)},</p>
        <p style=""font-size:15px;color:#333;"">{message}</p>
        <div style=""margin-top:16px;font-size:14px;color:#555;"">
          <strong>New Status:</strong> {System.Net.WebUtility.HtmlEncode(displayStatus)}
        </div>
        {trackingHtml}
      </div>
      <div style=""background:#fafafa;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;"">
        Rachel's Store · This is an automated message, please do not reply if not needed.
      </div>
    </div>
  </div>
</body>
</html>";
        }
    }
}