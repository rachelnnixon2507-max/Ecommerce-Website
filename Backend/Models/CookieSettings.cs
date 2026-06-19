namespace Backend.Models;

public class CookieSettings
{
    public string Name { get; set; } = "auth_token";
    public bool HttpOnly { get; set; }
    public bool Secure { get; set; }
    public string SameSite { get; set; } = "Lax";
    public int ExpiresDays { get; set; }
}