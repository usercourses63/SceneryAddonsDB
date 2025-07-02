using MongoDB.Entities;
using Addons.Api.Models;
using System.Text;

namespace Addons.Api.Services;

/// <summary>
/// Service for generating application status and addon reports.
/// </summary>
public class ReportService
{
    private readonly ILogger<ReportService> _logger;
    private readonly AddonUpdaterService _updaterService;

    public ReportService(ILogger<ReportService> logger, AddonUpdaterService updaterService)
    {
        _logger = logger;
        _updaterService = updaterService;
    }

    /// <summary>
    /// Generates a comprehensive application status and addon check report.
    /// </summary>
    public async Task<ApplicationStatusReport> GenerateStatusReportAsync()
    {
        try
        {
            // Get basic statistics
            var totalCount = await DB.CountAsync<Addon>();
            var recentCount = await DB.CountAsync<Addon>(a => a.DateAdded >= DateTime.UtcNow.AddDays(-7));
            
            // Get compatibility breakdown
            var compatibilityBreakdown = new Dictionary<string, long>();
            var compatibilities = await DB.Distinct<Addon, string>()
                .Property(a => a.Compatibility)
                .ExecuteAsync();
            
            foreach (var compatibility in compatibilities)
            {
                var count = await DB.CountAsync<Addon>(a => a.Compatibility == compatibility);
                compatibilityBreakdown[compatibility] = count;
            }
            
            // Get date range
            var latestAddon = await DB.Find<Addon>()
                .Sort(a => a.DateAdded, Order.Descending)
                .Limit(1)
                .ExecuteFirstAsync();
            
            var oldestAddon = await DB.Find<Addon>()
                .Sort(a => a.DateAdded, Order.Ascending)
                .Limit(1)
                .ExecuteFirstAsync();
            
            // Get latest addons
            var latestAddons = await DB.Find<Addon>()
                .Sort(a => a.DateAdded, Order.Descending)
                .Limit(10)
                .ExecuteAsync();

            return new ApplicationStatusReport
            {
                GeneratedAt = DateTime.UtcNow,
                DatabaseStatus = "Connected",
                TotalAddons = totalCount,
                RecentAddons = recentCount,
                CompatibilityBreakdown = compatibilityBreakdown,
                LatestAddedDate = latestAddon?.DateAdded,
                OldestAddedDate = oldestAddon?.DateAdded,
                LatestAddons = latestAddons.Select(a => new AddonSummaryForReport
                {
                    FileName = a.FileName,
                    Name = TruncateString(a.Name, 50),
                    Compatibility = a.Compatibility,
                    DateAdded = a.DateAdded,
                    DaysAgo = CalculateDaysAgo(a.DateAdded)
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating status report");
            return new ApplicationStatusReport
            {
                GeneratedAt = DateTime.UtcNow,
                DatabaseStatus = $"Error: {ex.Message}",
                TotalAddons = 0,
                RecentAddons = 0,
                CompatibilityBreakdown = new Dictionary<string, long>(),
                LatestAddedDate = null,
                OldestAddedDate = null,
                LatestAddons = new List<AddonSummaryForReport>()
            };
        }
    }

    /// <summary>
    /// Displays the status report to the console with formatting.
    /// </summary>
    public void DisplayReportToConsole(ApplicationStatusReport report)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine("🎯 Application Status & New Addon Check Results");
        sb.AppendLine(new string('=', 80));
        sb.AppendLine();
        
        // Application Status
        sb.AppendLine("✅ Application Status:");
        sb.AppendLine($"   Generated At: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC");
        sb.AppendLine($"   Database Status: {report.DatabaseStatus}");
        sb.AppendLine($"   Environment: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}");
        sb.AppendLine();
        
        // Database Statistics
        sb.AppendLine("📊 Database Statistics:");
        sb.AppendLine($"   Total Addons: {report.TotalAddons:N0}");
        sb.AppendLine($"   Recent Addons (7 days): {report.RecentAddons}");
        if (report.LatestAddedDate.HasValue && report.OldestAddedDate.HasValue)
        {
            sb.AppendLine($"   Date Range: {report.OldestAddedDate.Value:yyyy-MM-dd} to {report.LatestAddedDate.Value:yyyy-MM-dd}");
        }
        sb.AppendLine();
        
        // Compatibility Breakdown
        sb.AppendLine("🎯 Compatibility Breakdown:");
        foreach (var comp in report.CompatibilityBreakdown.OrderByDescending(x => x.Value))
        {
            var percentage = report.TotalAddons > 0 ? (comp.Value * 100.0 / report.TotalAddons) : 0;
            sb.AppendLine($"   {comp.Key}: {comp.Value:N0} addons ({percentage:F1}%)");
        }
        sb.AppendLine();
        
        // Latest Addons
        if (report.LatestAddons.Any())
        {
            sb.AppendLine("📅 Latest Addons:");
            sb.AppendLine(new string('=', 120));
            sb.AppendLine($"{"FILE NAME",-40} {"ADDON NAME",-50} {"COMPATIBILITY",-15} {"DATE ADDED",-12} {"DAYS AGO",-10}");
            sb.AppendLine(new string('-', 120));
            
            foreach (var addon in report.LatestAddons)
            {
                var fileName = TruncateString(addon.FileName, 38);
                var name = TruncateString(addon.Name, 48);
                sb.AppendLine($"{fileName,-40} {name,-50} {addon.Compatibility,-15} {addon.DateAdded:yyyy-MM-dd,-12} {addon.DaysAgo,-10}");
            }
            sb.AppendLine(new string('=', 120));
        }
        
        sb.AppendLine();
        sb.AppendLine("🎮 Your Scenery Addons API is fully operational! ✈️");
        
        Console.WriteLine(sb.ToString());
    }

    private static string TruncateString(string input, int maxLength)
    {
        if (string.IsNullOrEmpty(input) || input.Length <= maxLength)
            return input ?? "";
        
        return input.Substring(0, maxLength - 3) + "...";
    }

    private static string CalculateDaysAgo(DateTime dateAdded)
    {
        var days = (DateTime.UtcNow.Date - dateAdded.Date).Days;
        return days switch
        {
            0 => "today",
            1 => "1 day ago",
            _ => $"{days} days ago"
        };
    }
}

/// <summary>
/// Application status report model.
/// </summary>
public class ApplicationStatusReport
{
    public DateTime GeneratedAt { get; set; }
    public string DatabaseStatus { get; set; } = "";
    public long TotalAddons { get; set; }
    public long RecentAddons { get; set; }
    public Dictionary<string, long> CompatibilityBreakdown { get; set; } = new();
    public DateTime? LatestAddedDate { get; set; }
    public DateTime? OldestAddedDate { get; set; }
    public List<AddonSummaryForReport> LatestAddons { get; set; } = new();
}

/// <summary>
/// Addon summary for reports.
/// </summary>
public class AddonSummaryForReport
{
    public string FileName { get; set; } = "";
    public string Name { get; set; } = "";
    public string Compatibility { get; set; } = "";
    public DateTime DateAdded { get; set; }
    public string DaysAgo { get; set; } = "";
}
