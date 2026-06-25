using System.Linq;
using Backend.Data;
using Backend.DTOs.Requests;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Backend.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
private readonly AppDbContext _context;
private readonly PasswordHasher<User> _passwordHasher = new();
private readonly JwtService _jwtService;
private readonly CookieSettings _cookieSettings;


public AuthController(
    AppDbContext context,
    JwtService jwtService,
    IOptions<CookieSettings> cookieSettings)
{
    _context = context;
    _jwtService = jwtService;
    _cookieSettings = cookieSettings.Value;
}

    // REGISTER
[HttpPost("register")]
public IActionResult Register(RegisterRequestDto request)
{
    var existingUser = _context.Users
        .FirstOrDefault(u => u.Email == request.Email);

    if (existingUser != null)
        return BadRequest("Email already exists");

    var user = new User
    {
        Name = request.Name,
        Email = request.Email,

        // First registered account becomes Admin
        Role = !_context.Users.Any()
            ? "Admin"
            : "User",

        CreatedDate = DateTime.UtcNow
    };

    user.PasswordHash =
        _passwordHasher.HashPassword(user, request.Password);

    _context.Users.Add(user);
    _context.SaveChanges();

    return Ok(new
    {
        user.Id,
        user.Name,
        user.Email,
        user.Role,
        Message = "Registered Successfully"
    });
}
    
    [Authorize(Roles = "Admin")]
    [HttpPut("change-role/{email}")]
    public IActionResult ChangeRole(
    string email,
    [FromQuery] string role)
{
    var user = _context.Users
        .FirstOrDefault(u => u.Email == email);

    if (user == null)
        return NotFound("User not found");

    user.Role = role;

    _context.SaveChanges();

    return Ok(new
    {
        user.Email,
        user.Role
    });
}    
    
    [HttpPost("logout")]
public IActionResult Logout()
{
    Response.Cookies.Delete(_cookieSettings.Name);

    return Ok();
}
    // LOGIN
    [HttpPost("login")]
public IActionResult Login(LoginRequestDto request)
{
    var user = _context.Users
        .FirstOrDefault(
            u => u.Email == request.Email
        );

    if (user == null)
        return Unauthorized(
            "Invalid email or password"
        );

    var result =
        _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

    if (result ==
        PasswordVerificationResult.Failed)
    {
        return Unauthorized(
            "Invalid email or password"
        );
    }

    var token =
        _jwtService.GenerateToken(user);

  Response.Cookies.Append(
    _cookieSettings.Name,
    token,
    new CookieOptions
    {
        HttpOnly = _cookieSettings.HttpOnly,
        Secure = _cookieSettings.Secure,
        SameSite = Enum.Parse<SameSiteMode>(
            _cookieSettings.SameSite,
            true
        ),
        Expires = DateTime.UtcNow.AddDays(
            _cookieSettings.ExpiresDays
        )
    });

return Ok(new
{
    user.Id,
    user.Name,
    user.Email,
    user.Role
});
} // GET USERS
    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        var users = _context.Users
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role
            })
            .ToList();

        return Ok(users);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPut("make-admin/{email}")]
public IActionResult MakeAdmin(string email)
{
    var user = _context.Users.FirstOrDefault(u => u.Email == email);

    if (user == null)
        return NotFound("User not found");

    user.Role = "Admin";

    _context.SaveChanges();

    return Ok(new
    {
        user.Email,
        user.Role
    });
}
}
