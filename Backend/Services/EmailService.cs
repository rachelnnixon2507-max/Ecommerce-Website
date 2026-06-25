using Backend.DTOs;
using Backend.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Backend.Services
{
    /// <summary>
    /// Sends transactional emails over SMTP using MailKit.
    ///
    /// IMPORTANT: This service intentionally swallows and logs all exceptions.
    /// Email delivery is a "best effort, side-channel" operation — a flaky SMTP
    /// server or wrong app password must NEVER cause an order or payment to fail.
    /// Callers get a bool back so they can decide whether to surface anything
    /// to the user (normally they should not; the order itself already succeeded).
    ///
    /// Gmail setup: generate an App Password at
    ///   https://myaccount.google.com/apppasswords
    /// and use it as SmtpPass. Your normal Gmail password will NOT work when
    /// 2-Factor Authentication is enabled on the account.
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<bool> SendOrderConfirmationEmailAsync(OrderResponseDto order)
        {
            if (string.IsNullOrWhiteSpace(order.UserEmail))
            {
                _logger.LogWarning("Skipping order confirmation email for Order {OrderId}: no customer email on file.", order.Id);
                return false;
            }

            var subject = $"Order Confirmed — #{order.Id} (Rachel's Store)";
            var body = EmailTemplateBuilder.BuildOrderConfirmationEmail(order);

            return await SendEmailAsync(order.UserEmail, order.UserName, subject, body);
        }

        public async Task<bool> SendOrderStatusUpdateEmailAsync(OrderResponseDto order, string newStatus)
        {
            if (string.IsNullOrWhiteSpace(order.UserEmail))
            {
                _logger.LogWarning("Skipping status update email for Order {OrderId}: no customer email on file.", order.Id);
                return false;
            }

            var subjectStatus = System.Text.RegularExpressions.Regex.Replace(newStatus, "(?<!^)([A-Z])", " $1");
            var subject = $"Order #{order.Id} Update — {subjectStatus} (Rachel's Store)";
            var body = EmailTemplateBuilder.BuildOrderStatusUpdateEmail(order, newStatus);

            return await SendEmailAsync(order.UserEmail, order.UserName, subject, body);
        }

        /// <summary>
        /// Core SMTP send routine with a small retry loop for transient network/server
        /// errors. Configuration mistakes (auth failure, bad host) are NOT retried.
        /// 
        /// Port selection:
        ///   465  → SSL/TLS directly  (SecureSocketOptions.SslOnConnect)
        ///   587  → STARTTLS upgrade  (SecureSocketOptions.StartTls)  ← Gmail default
        ///   25   → plain / STARTTLS  (SecureSocketOptions.StartTlsWhenAvailable)
        /// </summary>
        private async Task<bool> SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            if (!_settings.EnableEmailSending)
            {
                _logger.LogInformation(
                    "Email sending disabled (EnableEmailSending=false). Would have sent '{Subject}' to {Email}.",
                    subject, toEmail);
                return true; // Treat as success so callers don't surface a spurious warning
            }

            if (string.IsNullOrWhiteSpace(_settings.SmtpHost) || string.IsNullOrWhiteSpace(_settings.SmtpUser))
            {
                _logger.LogError("Email not sent: SMTP settings are not configured (SmtpHost/SmtpUser missing).");
                return false;
            }

            if (string.IsNullOrWhiteSpace(_settings.SmtpPass))
            {
                _logger.LogError(
                    "Email not sent: SmtpPass is empty. For Gmail, generate an App Password at " +
                    "https://myaccount.google.com/apppasswords and set it as SmtpPass.");
                return false;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            // Choose the correct SSL mode based on the configured port
            var socketOptions = _settings.SmtpPort == 465
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            const int maxAttempts = 3;
            for (var attempt = 1; attempt <= maxAttempts; attempt++)
            {
                try
                {
                    using var client = new SmtpClient();
                    await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, socketOptions);
                    await client.AuthenticateAsync(_settings.SmtpUser, _settings.SmtpPass);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);

                    _logger.LogInformation("Email '{Subject}' sent to {Email}.", subject, toEmail);
                    return true;
                }
                catch (AuthenticationException ex)
                {
                    // Wrong username/app-password — retrying will not help.
                    _logger.LogError(ex,
                        "SMTP authentication failed sending '{Subject}' to {Email}. " +
                        "Check SmtpUser/SmtpPass. Gmail requires an App Password " +
                        "(https://myaccount.google.com/apppasswords), not your normal password.",
                        subject, toEmail);
                    return false;
                }
                catch (Exception ex) when (attempt < maxAttempts)
                {
                    _logger.LogWarning(ex,
                        "Attempt {Attempt}/{Max} failed sending '{Subject}' to {Email}. Retrying...",
                        attempt, maxAttempts, subject, toEmail);
                    await Task.Delay(TimeSpan.FromSeconds(attempt * 2));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to send email '{Subject}' to {Email} after {Max} attempts.",
                        subject, toEmail, maxAttempts);
                    return false;
                }
            }

            return false;
        }
    }
}
