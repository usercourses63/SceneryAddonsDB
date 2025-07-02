using MongoDB.Entities;
using Addons.Api.Models;

namespace Addons.Api.Services;

/// <summary>
/// Service responsible for updating addon records in MongoDB.
/// </summary>
public class AddonUpdaterService
{
    private readonly ILogger<AddonUpdaterService> _logger;

    /// <summary>
    /// Initializes a new instance of the AddonUpdaterService.
    /// </summary>
    /// <param name="logger">The logger instance.</param>
    public AddonUpdaterService(ILogger<AddonUpdaterService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Updates or inserts addon records in the database.
    /// </summary>
    /// <param name="addons">The list of addons to update.</param>
    /// <returns>A summary of the update operation.</returns>
    public async Task<UpdateSummary> UpdateAddonsAsync(IEnumerable<Addon> addons)
    {
        var summary = new UpdateSummary();
        
        foreach (var addon in addons)
        {
            try
            {
                addon.LastUpdated = DateTime.UtcNow;

                // Check if addon already exists
                var existing = await DB.Find<Addon>()
                    .Match(a => a.FileName == addon.FileName)
                    .ExecuteFirstAsync();

                if (existing == null)
                {
                    // Insert new addon
                    await addon.SaveAsync();
                    summary.NewCount++;
                    _logger.LogDebug("Inserted new addon: {FileName}", addon.FileName);
                }
                else
                {
                    // Update existing addon
                    addon.ID = existing.ID; // Preserve the existing ID
                    await addon.SaveAsync();

                    // Check if anything actually changed by comparing key fields
                    if (existing.Name != addon.Name ||
                        existing.Compatibility != addon.Compatibility ||
                        existing.DateAdded != addon.DateAdded)
                    {
                        summary.UpdatedCount++;
                        _logger.LogDebug("Updated existing addon: {FileName}", addon.FileName);
                    }
                    else
                    {
                        summary.UnchangedCount++;
                        _logger.LogDebug("No changes for addon: {FileName}", addon.FileName);
                    }
                }
            }
            catch (Exception ex)
            {
                summary.FailedCount++;
                _logger.LogError(ex, "Failed to update addon: {FileName}", addon.FileName);
            }
        }

        _logger.LogInformation("Update summary: {NewCount} new, {UpdatedCount} updated, {UnchangedCount} unchanged, {FailedCount} failed",
            summary.NewCount, summary.UpdatedCount, summary.UnchangedCount, summary.FailedCount);

        return summary;
    }

    /// <summary>
    /// Retrieves an addon by its filename.
    /// </summary>
    /// <param name="fileName">The exact filename to search for.</param>
    /// <returns>The addon if found, null otherwise.</returns>
    public async Task<Addon?> GetAddonByFileNameAsync(string fileName)
    {
        return await DB.Find<Addon>()
            .Match(a => a.FileName == fileName)
            .ExecuteFirstAsync();
    }

    /// <summary>
    /// Gets the total count of addons in the database.
    /// </summary>
    /// <returns>The total number of addon records.</returns>
    public async Task<long> GetTotalAddonCountAsync()
    {
        return await DB.CountAsync<Addon>();
    }
}

/// <summary>
/// Summary of an update operation.
/// </summary>
public class UpdateSummary
{
    /// <summary>
    /// Number of new records inserted.
    /// </summary>
    public int NewCount { get; set; }

    /// <summary>
    /// Number of existing records updated.
    /// </summary>
    public int UpdatedCount { get; set; }

    /// <summary>
    /// Number of records that remained unchanged.
    /// </summary>
    public int UnchangedCount { get; set; }

    /// <summary>
    /// Number of records that failed to update.
    /// </summary>
    public int FailedCount { get; set; }

    /// <summary>
    /// Total number of records processed.
    /// </summary>
    public int TotalProcessed => NewCount + UpdatedCount + UnchangedCount + FailedCount;
}
