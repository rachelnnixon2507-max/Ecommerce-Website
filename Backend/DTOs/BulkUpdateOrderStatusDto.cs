using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class BulkUpdateOrderStatusDto
    {
        [Required]
        public List<int> OrderIds { get; set; } = new List<int>();

        [Required]
        [RegularExpression(@"^(Pending|Confirmed|Processing|Shipped|Delivered|Cancelled|PaymentFailed)$", 
            ErrorMessage = "Invalid status")]
        public string NewStatus { get; set; } = string.Empty;
    }
}