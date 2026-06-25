using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Backend.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Services;
using Backend.Models;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

// ======================
// SERVICES
// ======================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<JwtService>();

// Register CookieSettings
builder.Services.Configure<CookieSettings>(
    builder.Configuration.GetSection("CookieSettings"));

// Register EmailSettings (SMTP config) from appsettings.json / environment variables
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Register StripeSettings
builder.Services.Configure<StripeSettings>(
    builder.Configuration.GetSection("Stripe"));
StripeConfiguration.ApiKey = builder.Configuration.GetSection("Stripe")["SecretKey"];

// Register your services here
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOrderRequestService, OrderRequestService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer =
                builder.Configuration["Jwt:Issuer"],

            ValidAudience =
                builder.Configuration["Jwt:Audience"],

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        builder.Configuration["Jwt:Key"]!
                    )
                )
        };

    // Read JWT from the HttpOnly cookie instead of the Authorization header.
    // This keeps the token out of JavaScript and prevents XSS token theft.
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token =
                context.Request.Cookies["auth_token"];

            return Task.CompletedTask;
        }
    };
});

// DATABASE
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// CORS — allow the frontend origin with credentials (required for cookie auth)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            // In development: localhost:5173; in production: set AllowedOrigin in appsettings
            var allowedOrigins = builder.Configuration["AllowedOrigin"]
                ?? "http://localhost:5173";

            policy.WithOrigins(allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries))
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // Required for HttpOnly cookie auth
        });
});

var app = builder.Build();

// ======================
//  AUTO-MIGRATE DATABASE
// ======================
// Apply any pending EF Core migrations automatically on startup.
// This ensures the DB schema is always current without needing to run
// `dotnet ef database update` manually after each deployment.
// db.Database.Migrate() is a no-op when the schema is already up-to-date.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var startupLogger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();
    try
    {
        startupLogger.LogInformation("Applying pending database migrations...");
        db.Database.Migrate();
        startupLogger.LogInformation("Database is up-to-date.");
    }
    catch (Exception ex)
    {
        startupLogger.LogError(ex,
            "Failed to apply database migrations on startup. " +
            "The app will continue, but database-dependent features may fail. " +
            "Run 'dotnet ef database update' manually to fix the schema.");
    }
}

// ======================
//  PIPELINE
// ======================

// Swagger (dev only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Only redirect to HTTPS in production — in development the self-signed cert
// causes cookie / CORS issues with the Vite dev server.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS must come before auth middleware
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check / smoke-test route
app.MapGet("/", () => "API Running");

app.Run();
