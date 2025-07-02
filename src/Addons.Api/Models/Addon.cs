using MongoDB.Entities;
using System.ComponentModel.DataAnnotations;

namespace Addons.Api.Models;

/// <summary>
/// Represents a scenery addon with compatibility information.
/// </summary>
public class Addon : Entity
{

    /// <summary>
    /// The exact .rar archive filename (unique identifier).
    /// </summary>
    [Required]
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Full addon title and version.
    /// </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility information - one of: "MSFS 2020", "MSFS 2024", or "MSFS 2020/2024".
    /// </summary>
    [Required]
    public string Compatibility { get; set; } = string.Empty;

    /// <summary>
    /// Date when the addon was added to the master list (UTC).
    /// </summary>
    public DateTime DateAdded { get; set; }

    /// <summary>
    /// Timestamp when this record was last updated (UTC).
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Response model for the compatibility API endpoint.
/// </summary>
public class CompatibilityResponse
{
    /// <summary>
    /// The exact .rar archive filename.
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility information.
    /// </summary>
    public string Compatibility { get; set; } = string.Empty;
}

/// <summary>
/// Health check response model.
/// </summary>
public class HealthResponse
{
    /// <summary>
    /// Health status indicator.
    /// </summary>
    public string Status { get; set; } = "Healthy";

    /// <summary>
    /// Timestamp of the health check.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Request model for listing addons with pagination and filtering.
/// </summary>
public class AddonsListRequest
{
    /// <summary>
    /// Page number (1-based).
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of items per page (max 100).
    /// </summary>
    public int PageSize { get; set; } = 20;

    /// <summary>
    /// Sort field: "name", "dateAdded", "lastUpdated", "compatibility".
    /// </summary>
    public string SortBy { get; set; } = "dateAdded";

    /// <summary>
    /// Sort direction: "asc" or "desc".
    /// </summary>
    public string SortDirection { get; set; } = "desc";

    /// <summary>
    /// Filter by compatibility (optional).
    /// </summary>
    public string? Compatibility { get; set; }

    /// <summary>
    /// Search term for addon name (optional).
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Filter by date added after this date (optional).
    /// </summary>
    public DateTime? AddedAfter { get; set; }

    /// <summary>
    /// Filter by date added before this date (optional).
    /// </summary>
    public DateTime? AddedBefore { get; set; }

    /// <summary>
    /// Display format: "list" (default) or "table".
    /// </summary>
    public string Format { get; set; } = "list";
}

/// <summary>
/// Response model for listing addons.
/// </summary>
public class AddonsListResponse
{
    /// <summary>
    /// List of addons for the current page.
    /// </summary>
    public List<AddonSummary> Addons { get; set; } = new();

    /// <summary>
    /// Pagination information.
    /// </summary>
    public PaginationInfo Pagination { get; set; } = new();

    /// <summary>
    /// Summary statistics.
    /// </summary>
    public AddonsSummaryStats Summary { get; set; } = new();
}

/// <summary>
/// Addon summary for list display.
/// </summary>
public class AddonSummary
{
    /// <summary>
    /// MongoDB document identifier.
    /// </summary>
    public string? Id { get; set; }

    /// <summary>
    /// The exact .rar archive filename.
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Full addon title and version.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility information.
    /// </summary>
    public string Compatibility { get; set; } = string.Empty;

    /// <summary>
    /// Date when the addon was added (UTC).
    /// </summary>
    public DateTime DateAdded { get; set; }

    /// <summary>
    /// Last updated timestamp (UTC).
    /// </summary>
    public DateTime LastUpdated { get; set; }

    /// <summary>
    /// Days since the addon was added.
    /// </summary>
    public int DaysSinceAdded { get; set; }

    /// <summary>
    /// Whether this addon was added recently (within last 7 days).
    /// </summary>
    public bool IsRecent { get; set; }
}

/// <summary>
/// Pagination information.
/// </summary>
public class PaginationInfo
{
    /// <summary>
    /// Current page number.
    /// </summary>
    public int CurrentPage { get; set; }

    /// <summary>
    /// Number of items per page.
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of items.
    /// </summary>
    public long TotalItems { get; set; }

    /// <summary>
    /// Total number of pages.
    /// </summary>
    public int TotalPages { get; set; }

    /// <summary>
    /// Whether there is a previous page.
    /// </summary>
    public bool HasPrevious { get; set; }

    /// <summary>
    /// Whether there is a next page.
    /// </summary>
    public bool HasNext { get; set; }
}

/// <summary>
/// Summary statistics for the addon collection.
/// </summary>
public class AddonsSummaryStats
{
    /// <summary>
    /// Total number of addons in the database.
    /// </summary>
    public long TotalAddons { get; set; }

    /// <summary>
    /// Number of addons matching current filters.
    /// </summary>
    public long FilteredAddons { get; set; }

    /// <summary>
    /// Number of addons added in the last 7 days.
    /// </summary>
    public long RecentAddons { get; set; }

    /// <summary>
    /// Breakdown by compatibility.
    /// </summary>
    public Dictionary<string, long> CompatibilityBreakdown { get; set; } = new();

    /// <summary>
    /// Date of the most recently added addon.
    /// </summary>
    public DateTime? LatestAddedDate { get; set; }

    /// <summary>
    /// Date of the oldest addon.
    /// </summary>
    public DateTime? OldestAddedDate { get; set; }
}

/// <summary>
/// Table view response for addons listing.
/// </summary>
public class AddonsTableResponse
{
    /// <summary>
    /// Table headers.
    /// </summary>
    public List<string> Headers { get; set; } = new();

    /// <summary>
    /// Table rows with addon data.
    /// </summary>
    public List<List<string>> Rows { get; set; } = new();

    /// <summary>
    /// Pagination information.
    /// </summary>
    public PaginationInfo Pagination { get; set; } = new();

    /// <summary>
    /// Summary statistics.
    /// </summary>
    public AddonsSummaryStats Summary { get; set; } = new();
}

/// <summary>
/// Minimal addon data for table display.
/// </summary>
public class AddonTableRow
{
    /// <summary>
    /// The exact .rar archive filename.
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Shortened addon name (first 50 characters).
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility information.
    /// </summary>
    public string Compatibility { get; set; } = string.Empty;

    /// <summary>
    /// Date when the addon was added (formatted).
    /// </summary>
    public string DateAdded { get; set; } = string.Empty;

    /// <summary>
    /// Days since the addon was added.
    /// </summary>
    public string DaysAgo { get; set; } = string.Empty;
}
