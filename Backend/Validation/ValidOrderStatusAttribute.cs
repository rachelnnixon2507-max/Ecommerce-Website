using System.ComponentModel.DataAnnotations;
using Backend.DTOs;

namespace Backend.Validation
{
    /// <summary>
    /// Custom validation attribute for order status
    /// </summary>
    public class ValidOrderStatusAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return new ValidationResult("Status is required");
            }

            var status = value.ToString();
            
            if (string.IsNullOrEmpty(status))
            {
                return new ValidationResult("Status cannot be empty");
            }

            if (!OrderStatus.IsValidStatus(status))
            {
                return new ValidationResult($"Invalid status. Valid values are: {string.Join(", ", OrderStatus.AllStatuses)}");
            }

            return ValidationResult.Success; // Changed from Valid to Success
        }
    }
}