using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Backend.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
           policy.WithOrigins("http://localhost:5173")
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials();
        });
});



var app = builder.Build();

// ======================
// PIPELINE
// ======================

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// TEST ROUTE
app.MapGet("/", () => "API Running");

app.Run();