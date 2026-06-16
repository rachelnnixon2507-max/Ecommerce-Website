using System.Linq;
using Backend.Data;
using Backend.DTOs.Requests;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthController(AppDbContext context)
    {
        _context = context;
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
    // LOGIN
    [HttpPost("login")]
    public IActionResult Login(LoginRequestDto request)
    {
        var user = _context.Users
            .FirstOrDefault(u => u.Email == request.Email);

        if (user == null)
            return Unauthorized("Invalid email or password");

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid email or password");

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Role
        });
    }

    // GET USERS
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