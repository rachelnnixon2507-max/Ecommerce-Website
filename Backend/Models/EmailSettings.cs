namespace Backend.Models;

/// <summary>
/// SMTP / outgoing email configuration, bound from the "EmailSettings" section
/// of appsettings.json (and overridden by environment variables in production).
/// </summary>
public class EmailSettings
{
    /// <summary>SMTP server host, e.g. smtp.gmail.com</summary>
    public string SmtpHost { get; set; } = string.Empty;

    /// <summary>SMTP port. 587 for STARTTLS (recommended), 465 for implicit SSL.</summary>
    public int SmtpPort { get; set; } = 587;

    /// <summary>The mailbox username used to authenticate with the SMTP server.</summary>
    public string SmtpUser { get; set; } = string.Empty;

    /// <summary>
    /// The mailbox password / app password. For Gmail this MUST be a 16-character
    /// "App Password" generated from the Google Account security settings —
    /// your normal Gmail password will not work and Google will reject the login.
    /// </summary>
    public string SmtpPass { get; set; } = string.Empty;

    /// <summary>The "From" address shown to recipients.</summary>
    public string FromEmail { get; set; } = string.Empty;

    /// <summary>The "From" display name shown to recipients, e.g. "Rachel's Store".</summary>
    public string FromName { get; set; } = "Rachel's Store";

    /// <summary>If false, the email service logs instead of sending (safe default for dev/test).</summary>
    public bool EnableEmailSending { get; set; } = true;
}
