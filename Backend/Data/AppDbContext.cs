using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<OrderRequest> OrderRequests { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Price precision
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.Price)
                .HasPrecision(18, 2);

            // Disable FK constraint on CategoryId to allow NULL and non-existent category references
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // ── OrderRequest relationships ──
            // An OrderRequest belongs to exactly one Order and was filed by exactly
            // one User. We restrict (rather than cascade) the User FK to avoid SQL
            // Server's "multiple cascade paths" error, since Order already cascades
            // from User indirectly via other relationships in a larger schema.
            modelBuilder.Entity<OrderRequest>()
                .HasOne(r => r.Order)
                .WithMany()
                .HasForeignKey(r => r.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderRequest>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── UTC DateTime handling ──
            // SQL Server's datetime2 columns store no timezone info. When EF Core
            // reads a row back, DateTime.Kind defaults to Unspecified — which makes
            // System.Text.Json serialize it WITHOUT a "Z" suffix (e.g.
            // "2026-06-21T10:30:00" instead of "2026-06-21T10:30:00Z"). The frontend's
            // `new Date(...)` then either parses it as local time (wrong) or, in some
            // browsers/edge cases, fails to parse it at all ("Invalid Date").
            //
            // Fix: force Kind=Utc on every DateTime read from / written to the
            // database. All our DateTime.UtcNow values already are UTC in practice;
            // this just makes that fact explicit so JSON serialization is unambiguous.
            var utcConverter = new ValueConverter<DateTime, DateTime>(
                toDb => toDb,
                fromDb => DateTime.SpecifyKind(fromDb, DateTimeKind.Utc));

            var nullableUtcConverter = new ValueConverter<DateTime?, DateTime?>(
                toDb => toDb,
                fromDb => fromDb.HasValue ? DateTime.SpecifyKind(fromDb.Value, DateTimeKind.Utc) : fromDb);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(utcConverter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(nullableUtcConverter);
                    }
                }
            }
        }
    }
}

