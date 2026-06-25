using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.DTOs
{
    /// <summary>
    /// Static class containing order status constants and helper methods
    /// </summary>
    public static class OrderStatus
    {
        #region Constants

        /// <summary>
        /// Order is placed but not yet confirmed
        /// </summary>
        public const string Pending = "Pending";

        /// <summary>
        /// Order is confirmed and payment is verified
        /// </summary>
        public const string Confirmed = "Confirmed";

        /// <summary>
        /// Order is being prepared for shipment
        /// </summary>
        public const string Processing = "Processing";

        /// <summary>
        /// Order has been shipped
        /// </summary>
        public const string Shipped = "Shipped";

        /// <summary>
        /// Order has been delivered to the customer
        /// </summary>
        public const string Delivered = "Delivered";

        /// <summary>
        /// Order has been cancelled
        /// </summary>
        public const string Cancelled = "Cancelled";

        /// <summary>
        /// Payment for the order has failed
        /// </summary>
        public const string PaymentFailed = "PaymentFailed";

        #endregion

        #region Status Arrays

        /// <summary>
        /// Array of all valid order statuses
        /// </summary>
        public static readonly string[] AllStatuses = new[]
        {
            Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, PaymentFailed
        };

        /// <summary>
        /// Array of statuses that are considered active (not terminal)
        /// </summary>
        public static readonly string[] ActiveStatuses = new[]
        {
            Pending, Confirmed, Processing, Shipped
        };

        /// <summary>
        /// Array of terminal statuses (order is complete and cannot be changed)
        /// </summary>
        public static readonly string[] TerminalStatuses = new[]
        {
            Delivered, Cancelled, PaymentFailed
        };

        /// <summary>
        /// Array of status colors for UI display
        /// </summary>
        public static readonly string[] StatusColors = new[]
        {
            "yellow", "blue", "purple", "indigo", "green", "red", "red"
        };

        #endregion

        #region Status Dictionaries

        /// <summary>
        /// Dictionary mapping status to display label
        /// </summary>
        public static readonly Dictionary<string, string> StatusLabels = new()
        {
            { Pending, "Pending" },
            { Confirmed, "Confirmed" },
            { Processing, "Processing" },
            { Shipped, "Shipped" },
            { Delivered, "Delivered" },
            { Cancelled, "Cancelled" },
            { PaymentFailed, "Payment Failed" }
        };

        /// <summary>
        /// Dictionary mapping status to description
        /// </summary>
        public static readonly Dictionary<string, string> StatusDescriptions = new()
        {
            { Pending, "Order has been placed but not yet confirmed" },
            { Confirmed, "Order has been confirmed and payment verified" },
            { Processing, "Order is being prepared for shipment" },
            { Shipped, "Order has been shipped to the customer" },
            { Delivered, "Order has been delivered to the customer" },
            { Cancelled, "Order has been cancelled" },
            { PaymentFailed, "Payment for the order has failed" }
        };

        /// <summary>
        /// Dictionary mapping status to CSS color class
        /// </summary>
        public static readonly Dictionary<string, string> StatusColorMap = new()
        {
            { Pending, "bg-yellow-100 text-yellow-800" },
            { Confirmed, "bg-blue-100 text-blue-800" },
            { Processing, "bg-purple-100 text-purple-800" },
            { Shipped, "bg-indigo-100 text-indigo-800" },
            { Delivered, "bg-green-100 text-green-800" },
            { Cancelled, "bg-red-100 text-red-800" },
            { PaymentFailed, "bg-red-100 text-red-800" }
        };

        /// <summary>
        /// Dictionary mapping status to icon name
        /// </summary>
        public static readonly Dictionary<string, string> StatusIcons = new()
        {
            { Pending, "clock" },
            { Confirmed, "check-circle" },
            { Processing, "loader" },
            { Shipped, "truck" },
            { Delivered, "check-circle" },
            { Cancelled, "x-circle" },
            { PaymentFailed, "alert-circle" }
        };

        #endregion

        #region Status Transition Rules

        /// <summary>
        /// Get allowed transitions from a status
        /// </summary>
        public static string[] GetAllowedTransitions(string currentStatus)
        {
            var allowedTransitions = new Dictionary<string, string[]>
            {
                { Pending, new[] { Confirmed, Cancelled, PaymentFailed } },
                { Confirmed, new[] { Processing, Cancelled } },
                { Processing, new[] { Shipped, Cancelled } },
                { Shipped, new[] { Delivered, Cancelled } },
                { Delivered, Array.Empty<string>() },
                { Cancelled, Array.Empty<string>() },
                { PaymentFailed, Array.Empty<string>() }
            };

            return allowedTransitions.TryGetValue(currentStatus, out var transitions) 
                ? transitions 
                : Array.Empty<string>();
        }

        /// <summary>
        /// Check if status transition is allowed
        /// </summary>
        public static bool IsStatusTransitionAllowed(string currentStatus, string newStatus)
        {
            if (!IsValidStatus(currentStatus) || !IsValidStatus(newStatus))
                return false;

            var allowed = GetAllowedTransitions(currentStatus);
            return Array.Exists(allowed, s => s == newStatus);
        }

        /// <summary>
        /// Check if status is terminal (cannot be changed)
        /// </summary>
        public static bool IsTerminalStatus(string status)
        {
            return Array.Exists(TerminalStatuses, s => s == status);
        }

        /// <summary>
        /// Check if status is active
        /// </summary>
        public static bool IsActiveStatus(string status)
        {
            return Array.Exists(ActiveStatuses, s => s == status);
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Check if status is valid
        /// </summary>
        public static bool IsValidStatus(string status)
        {
            return Array.Exists(AllStatuses, s => s == status);
        }

        /// <summary>
        /// Get display name for status
        /// </summary>
        public static string GetStatusDisplayName(string status)
        {
            return StatusLabels.TryGetValue(status, out var label) ? label : status;
        }

        /// <summary>
        /// Get description for status
        /// </summary>
        public static string GetStatusDescription(string status)
        {
            return StatusDescriptions.TryGetValue(status, out var description) ? description : "";
        }

        /// <summary>
        /// Get color for a specific status (simple color name)
        /// </summary>
        public static string GetStatusColor(string status)
        {
            return status switch
            {
                Pending => "yellow",
                Confirmed => "blue",
                Processing => "purple",
                Shipped => "indigo",
                Delivered => "green",
                Cancelled => "red",
                PaymentFailed => "red",
                _ => "gray"
            };
        }

        /// <summary>
        /// Get CSS class for status badge
        /// </summary>
        public static string GetStatusBadgeClass(string status)
        {
            return StatusColorMap.TryGetValue(status, out var cssClass) 
                ? cssClass 
                : "bg-gray-100 text-gray-800";
        }

        /// <summary>
        /// Get icon name for status
        /// </summary>
        public static string GetStatusIcon(string status)
        {
            return StatusIcons.TryGetValue(status, out var icon) ? icon : "circle";
        }

        /// <summary>
        /// Get all statuses with their display information
        /// </summary>
        public static List<StatusInfo> GetAllStatusInfo()
        {
            return AllStatuses.Select(status => new StatusInfo
            {
                Value = status,
                Label = GetStatusDisplayName(status),
                Color = GetStatusColor(status),
                BadgeClass = GetStatusBadgeClass(status),
                Description = GetStatusDescription(status),
                IsTerminal = IsTerminalStatus(status),
                IsActive = IsActiveStatus(status),
                AllowedTransitions = GetAllowedTransitions(status)
            }).ToList();
        }

        /// <summary>
        /// Get statuses that can transition from a given status
        /// </summary>
        public static List<StatusInfo> GetAvailableNextStatuses(string currentStatus)
        {
            var allowedTransitions = GetAllowedTransitions(currentStatus);
            return allowedTransitions
                .Select(status => new StatusInfo
                {
                    Value = status,
                    Label = GetStatusDisplayName(status),
                    Color = GetStatusColor(status),
                    BadgeClass = GetStatusBadgeClass(status),
                    Description = GetStatusDescription(status),
                    IsTerminal = IsTerminalStatus(status),
                    IsActive = IsActiveStatus(status)
                })
                .ToList();
        }

        /// <summary>
        /// Get status history timeline items
        /// </summary>
        public static List<TimelineItem> GetStatusTimeline(string currentStatus, DateTime? statusDate = null)
        {
            var timeline = new List<TimelineItem>();

            // Define the typical order status flow
            var statusFlow = new[] { Pending, Confirmed, Processing, Shipped, Delivered };

            // Find the index of current status
            int currentIndex = Array.IndexOf(statusFlow, currentStatus);
            if (currentIndex < 0) currentIndex = 0;

            // Build timeline with completed and pending items
            for (int i = 0; i < statusFlow.Length; i++)
            {
                var status = statusFlow[i];
                bool isCompleted = i <= currentIndex;
                bool isCurrent = i == currentIndex;

                timeline.Add(new TimelineItem
                {
                    Status = status,
                    Label = GetStatusDisplayName(status),
                    IsCompleted = isCompleted,
                    IsCurrent = isCurrent,
                    Date = isCompleted ? statusDate ?? DateTime.Now : null,
                    Color = isCompleted ? GetStatusColor(status) : "gray"
                });
            }

            return timeline;
        }

        #endregion
    }

    #region Helper Classes

    /// <summary>
    /// Status information DTO
    /// </summary>
    public class StatusInfo
    {
        public string Value { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string BadgeClass { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsTerminal { get; set; }
        public bool IsActive { get; set; }
        public string[]? AllowedTransitions { get; set; }
    }

    /// <summary>
    /// Timeline item for order status history
    /// </summary>
    public class TimelineItem
    {
        public string Status { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public bool IsCurrent { get; set; }
        public DateTime? Date { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    #endregion
}