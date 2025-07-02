using Addons.Api.Services;

namespace Addons.Api.BackgroundJobs;

/// <summary>
/// Background service that performs scheduled scraping of addon data.
/// </summary>
public class ScrapeWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ScrapeWorker> _logger;
    private readonly TimeSpan _scrapeInterval = TimeSpan.FromHours(24);

    /// <summary>
    /// Initializes a new instance of the ScrapeWorker.
    /// </summary>
    /// <param name="serviceProvider">The service provider for creating scoped services.</param>
    /// <param name="logger">The logger instance.</param>
    public ScrapeWorker(IServiceProvider serviceProvider, ILogger<ScrapeWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Executes the background service.
    /// </summary>
    /// <param name="stoppingToken">Cancellation token to stop the service.</param>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ScrapeWorker started");

        // Wait until the top of the next hour before starting
        await WaitUntilNextHour(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PerformScrapeAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during scheduled scrape");
            }

            // Wait for the next scrape interval
            try
            {
                await Task.Delay(_scrapeInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
        }

        _logger.LogInformation("ScrapeWorker stopped");
    }

    /// <summary>
    /// Performs the scraping operation using scoped services.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    private async Task PerformScrapeAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting scheduled scrape operation");
        var startTime = DateTime.UtcNow;

        using var scope = _serviceProvider.CreateScope();
        var scraper = scope.ServiceProvider.GetRequiredService<ScraperService>();
        var updater = scope.ServiceProvider.GetRequiredService<AddonUpdaterService>();

        try
        {
            // Scrape the addons
            var addons = await scraper.ScrapeAddonsAsync();
            _logger.LogInformation("Scraped {Count} addons from source", addons.Count);

            if (addons.Count > 0)
            {
                // Update the database
                var summary = await updater.UpdateAddonsAsync(addons);
                
                var duration = DateTime.UtcNow - startTime;
                _logger.LogInformation(
                    "Scrape operation completed in {Duration:mm\\:ss}. Summary: {NewCount} new, {UpdatedCount} updated, {UnchangedCount} unchanged, {FailedCount} failed",
                    duration, summary.NewCount, summary.UpdatedCount, summary.UnchangedCount, summary.FailedCount);

                // Log warning if there were failures
                if (summary.FailedCount > 0)
                {
                    _logger.LogWarning("Scrape operation had {FailedCount} failures out of {TotalCount} total records",
                        summary.FailedCount, summary.TotalProcessed);
                }
            }
            else
            {
                _logger.LogWarning("No addons were scraped from the source");
            }
        }
        catch (Exception ex)
        {
            var duration = DateTime.UtcNow - startTime;
            _logger.LogError(ex, "Scrape operation failed after {Duration:mm\\:ss}", duration);
            throw;
        }
    }

    /// <summary>
    /// Waits until the top of the next hour before starting the first scrape.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    private async Task WaitUntilNextHour(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var nextHour = new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0, DateTimeKind.Utc).AddHours(1);
        var delay = nextHour - now;

        if (delay.TotalMilliseconds > 0)
        {
            _logger.LogInformation("Waiting {Delay:mm\\:ss} until next hour ({NextHour:yyyy-MM-dd HH:mm} UTC) to start scraping",
                delay, nextHour);
            
            try
            {
                await Task.Delay(delay, cancellationToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                throw;
            }
        }

        _logger.LogInformation("Starting scrape operations at {StartTime:yyyy-MM-dd HH:mm} UTC", DateTime.UtcNow);
    }

    /// <summary>
    /// Triggers a manual scrape operation (for testing or manual refresh).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the scrape operation.</returns>
    public async Task TriggerManualScrapeAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Manual scrape triggered");
        await PerformScrapeAsync(cancellationToken);
    }
}
