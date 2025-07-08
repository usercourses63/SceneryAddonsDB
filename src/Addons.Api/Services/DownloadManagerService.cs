using Addons.Api.Models;
using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using System.Web;
using HtmlAgilityPack;
using MongoDB.Entities;

namespace Addons.Api.Services;

/// <summary>
/// Service for managing concurrent addon downloads.
/// </summary>
public class DownloadManagerService : IDisposable
{
    private readonly TorrentDownloadService _torrentService;
    private readonly DownloadableAddonScraperService _downloadableScraperService;
    private readonly ILogger<DownloadManagerService> _logger;
    private readonly ConcurrentDictionary<string, DownloadSession> _activeSessions;
    private readonly SemaphoreSlim _concurrencyLimiter;
    private readonly DownloadSettings _settings;

    public DownloadManagerService(
        TorrentDownloadService torrentService,
        DownloadableAddonScraperService downloadableScraperService,
        ILogger<DownloadManagerService> logger,
        IConfiguration configuration)
    {
        _torrentService = torrentService;
        _downloadableScraperService = downloadableScraperService;
        _logger = logger;
        _activeSessions = new ConcurrentDictionary<string, DownloadSession>();

        // Load settings from configuration
        _settings = new DownloadSettings();
        configuration.GetSection("DownloadSettings").Bind(_settings);

        _concurrencyLimiter = new SemaphoreSlim(_settings.MaxGlobalConcurrency, _settings.MaxGlobalConcurrency);

        _logger.LogInformation("DownloadManagerService initialized with max concurrency: {MaxConcurrency}",
            _settings.MaxGlobalConcurrency);
    }

    /// <summary>
    /// Downloads a specific addon by ID.
    /// </summary>
    /// <param name="addonId">The ID of the addon to download</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Download response with session information</returns>
    public async Task<DownloadResponse?> DownloadAddonAsync(string addonId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting download for addon: {AddonId}", addonId);

            // Get the addon from the database
            var addon = await DB.Find<Addon>().OneAsync(addonId);
            if (addon == null)
            {
                _logger.LogWarning("Addon not found: {AddonId}", addonId);
                return null;
            }

            // Create a download request for this single addon
            var request = new DownloadRequest
            {
                Count = 1,
                MaxConcurrency = 1,
                Compatibility = addon.Compatibility,
                ForceRedownload = false
            };

            // Create a download response for this single addon
            var sessionId = Guid.NewGuid().ToString();
            var downloadItem = new DownloadItem
            {
                Id = Guid.NewGuid().ToString(),
                FileName = addon.FileName,
                Name = addon.Name,
                Compatibility = addon.Compatibility,
                DownloadUrl = $"https://sceneryaddons.org/download/{addon.FileName}",
                Status = DownloadStatus.Queued,
                Progress = 0,
                SpeedBytesPerSecond = 0,
                TotalBytes = 0,
                DownloadedBytes = 0,
                StartedAt = DateTime.UtcNow
            };

            var response = new DownloadResponse
            {
                SessionId = sessionId,
                QueuedCount = 1,
                Items = new List<DownloadItem> { downloadItem },
                StartedAt = DateTime.UtcNow
            };

            // Store the session for tracking (simplified for single addon)
            // In a real implementation, you would start the actual download process here

            _logger.LogInformation("Download queued for addon: {AddonName}", addon.Name);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting download for addon: {AddonId}", addonId);
            throw;
        }
    }

    /// <summary>
    /// Starts a new download session.
    /// </summary>
    /// <param name="request">Download request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Download response with session information</returns>
    public async Task<DownloadResponse> StartDownloadSessionAsync(DownloadRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting download session for {Count} addons with max concurrency {MaxConcurrency}", 
                request.Count, request.MaxConcurrency);

            // Generate session ID
            var sessionId = Guid.NewGuid().ToString("N")[..8];
            
            // Scrape latest addons
            var addons = await ScrapeLatestAddonsAsync(request.Count, request.Compatibility);
            
            // Create download items
            var downloadItems = new List<DownloadItem>();
            foreach (var addon in addons)
            {
                var item = new DownloadItem
                {
                    Id = Guid.NewGuid().ToString("N")[..8],
                    FileName = addon.FileName,
                    Name = addon.Name,
                    Compatibility = addon.Compatibility,
                    DownloadUrl = addon.DownloadUrl,
                    Status = DownloadStatus.Queued
                };
                
                // Check if file already exists
                if (_settings.SkipExistingFiles && !request.ForceRedownload)
                {
                    var compatibilityFolder = GetCompatibilityFolder(addon.Compatibility);
                    var filePath = Path.Combine(_settings.BaseDownloadPath, compatibilityFolder, addon.FileName);
                    if (File.Exists(filePath))
                    {
                        item.Status = DownloadStatus.Skipped;
                        item.LocalPath = filePath;
                        _logger.LogDebug("Skipping existing file: {FileName}", addon.FileName);
                    }
                }
                
                downloadItems.Add(item);
            }

            // Create download session
            var session = new DownloadSession
            {
                Id = sessionId,
                Items = downloadItems,
                StartedAt = DateTime.UtcNow,
                MaxConcurrency = Math.Min(request.MaxConcurrency, _settings.MaxGlobalConcurrency),
                CancellationTokenSource = new CancellationTokenSource()
            };

            _activeSessions[sessionId] = session;

            // Start downloads in background
            _ = Task.Run(() => ProcessDownloadSessionAsync(session), cancellationToken);

            var response = new DownloadResponse
            {
                SessionId = sessionId,
                QueuedCount = downloadItems.Count(i => i.Status == DownloadStatus.Queued),
                Items = downloadItems,
                StartedAt = session.StartedAt
            };

            _logger.LogInformation("Download session {SessionId} started with {QueuedCount} items", 
                sessionId, response.QueuedCount);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting download session");
            throw;
        }
    }

    /// <summary>
    /// Gets the status of a download session.
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <returns>Download status response</returns>
    public DownloadStatusResponse? GetSessionStatus(string sessionId)
    {
        if (!_activeSessions.TryGetValue(sessionId, out var session))
        {
            return null;
        }

        var completedItems = session.Items.Count(i => i.Status == DownloadStatus.Completed);
        var failedItems = session.Items.Count(i => i.Status == DownloadStatus.Failed);
        var activeDownloads = session.Items.Count(i => i.Status == DownloadStatus.Downloading);
        
        var overallProgress = session.Items.Count > 0
            ? session.Items.Average(i => i.Progress)
            : 0;

        var totalSpeed = session.Items
            .Where(i => i.Status == DownloadStatus.Downloading)
            .Sum(i => i.SpeedBytesPerSecond);

        // Calculate ETA for individual items
        foreach (var item in session.Items)
        {
            if (item.Status == DownloadStatus.Downloading && item.SpeedBytesPerSecond > 0 && item.TotalBytes > 0)
            {
                var remainingBytes = item.TotalBytes - item.DownloadedBytes;
                item.EstimatedTimeRemainingSeconds = (long)(remainingBytes / item.SpeedBytesPerSecond);
            }
            else
            {
                item.EstimatedTimeRemainingSeconds = 0;
            }
        }

        // Calculate session-level ETA
        long sessionEta = 0;
        if (totalSpeed > 0)
        {
            var totalRemainingBytes = session.Items
                .Where(i => i.Status == DownloadStatus.Downloading || i.Status == DownloadStatus.Queued)
                .Where(i => i.TotalBytes > 0)
                .Sum(i => i.TotalBytes - i.DownloadedBytes);
            
            if (totalRemainingBytes > 0)
            {
                sessionEta = (long)(totalRemainingBytes / totalSpeed);
            }
        }

        var status = SessionStatus.Active;
        if (completedItems + failedItems == session.Items.Count)
        {
            status = failedItems > 0 ? SessionStatus.CompletedWithErrors : SessionStatus.Completed;
            session.CompletedAt ??= DateTime.UtcNow;
        }

        return new DownloadStatusResponse
        {
            SessionId = sessionId,
            Status = status,
            TotalItems = session.Items.Count,
            CompletedItems = completedItems,
            FailedItems = failedItems,
            ActiveDownloads = activeDownloads,
            OverallProgress = overallProgress,
            TotalSpeedBytesPerSecond = totalSpeed,
            EstimatedTimeRemainingSeconds = sessionEta,
            Items = session.Items,
            StartedAt = session.StartedAt,
            CompletedAt = session.CompletedAt
        };
    }

    /// <summary>
    /// Pauses a download session.
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <returns>True if session was paused</returns>
    public bool PauseSession(string sessionId)
    {
        if (_activeSessions.TryGetValue(sessionId, out var session))
        {
            // For now, we'll implement pause as cancel since MonoTorrent doesn't have built-in pause
            // In a more sophisticated implementation, we could track paused state and resume later
            session.CancellationTokenSource.Cancel();
            _logger.LogInformation("Download session {SessionId} paused (implemented as cancel)", sessionId);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Cancels a download session.
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <returns>True if session was cancelled</returns>
    public bool CancelSession(string sessionId)
    {
        if (_activeSessions.TryGetValue(sessionId, out var session))
        {
            session.CancellationTokenSource.Cancel();
            _logger.LogInformation("Download session {SessionId} cancelled", sessionId);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Resumes a download session.
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <returns>True if session was resumed</returns>
    public bool ResumeSession(string sessionId)
    {
        if (_activeSessions.TryGetValue(sessionId, out var session))
        {
            // Create new cancellation token source for resumed session
            session.CancellationTokenSource = new CancellationTokenSource();
            
            // Restart downloads for queued items
            _ = Task.Run(() => ProcessDownloadSessionAsync(session));
            
            _logger.LogInformation("Download session {SessionId} resumed", sessionId);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Pauses a specific download item.
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <param name="itemId">Item ID</param>
    /// <returns>True if item was paused</returns>
    public bool PauseDownloadItem(string sessionId, string itemId)
    {
        if (_activeSessions.TryGetValue(sessionId, out var session))
        {
            var item = session.Items.FirstOrDefault(i => i.Id == itemId);
            if (item != null && item.Status == DownloadStatus.Downloading)
            {
                item.Status = DownloadStatus.Queued;
                _logger.LogInformation("Download item {ItemId} in session {SessionId} paused", itemId, sessionId);
                return true;
            }
        }
        return false;
    }

    /// <summary>
    /// Resumes a specific download item.
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <param name="itemId">Item ID</param>
    /// <returns>True if item was resumed</returns>
    public bool ResumeDownloadItem(string sessionId, string itemId)
    {
        if (_activeSessions.TryGetValue(sessionId, out var session))
        {
            var item = session.Items.FirstOrDefault(i => i.Id == itemId);
            if (item != null && item.Status == DownloadStatus.Queued)
            {
                // Restart download for this specific item
                _ = Task.Run(() => ProcessDownloadItemAsync(item, session.CancellationTokenSource.Token));
                _logger.LogInformation("Download item {ItemId} in session {SessionId} resumed", itemId, sessionId);
                return true;
            }
        }
        return false;
    }

    /// <summary>
    /// Cancels a specific download item.
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <param name="itemId">Item ID</param>
    /// <returns>True if item was cancelled</returns>
    public bool CancelDownloadItem(string sessionId, string itemId)
    {
        if (_activeSessions.TryGetValue(sessionId, out var session))
        {
            var item = session.Items.FirstOrDefault(i => i.Id == itemId);
            if (item != null && (item.Status == DownloadStatus.Downloading || item.Status == DownloadStatus.Queued))
            {
                item.Status = DownloadStatus.Cancelled;
                item.CompletedAt = DateTime.UtcNow;
                _logger.LogInformation("Download item {ItemId} in session {SessionId} cancelled", itemId, sessionId);
                return true;
            }
        }
        return false;
    }

    /// <summary>
    /// Clears all completed download sessions from history.
    /// </summary>
    /// <returns>Number of sessions cleared</returns>
    public int ClearSessionsHistory()
    {
        var completedSessions = _activeSessions.Where(kvp =>
        {
            var status = GetSessionStatus(kvp.Key);
            return status != null && (status.Status == SessionStatus.Completed ||
                                    status.Status == SessionStatus.CompletedWithErrors ||
                                    status.Status == SessionStatus.Cancelled);
        }).ToList();

        int clearedCount = 0;
        foreach (var sessionKvp in completedSessions)
        {
            if (_activeSessions.TryRemove(sessionKvp.Key, out var session))
            {
                session.CancellationTokenSource.Dispose();
                clearedCount++;
            }
        }

        _logger.LogInformation("Cleared {Count} completed sessions from history", clearedCount);
        return clearedCount;
    }

    /// <summary>
    /// Gets all active download sessions.
    /// </summary>
    /// <returns>List of active sessions</returns>
    public List<DownloadStatusResponse> GetAllSessions()
    {
        return _activeSessions.Keys.Select(GetSessionStatus).Where(s => s != null).ToList()!;
    }

    /// <summary>
    /// Processes a download session with concurrent downloads.
    /// </summary>
    /// <param name="session">Download session</param>
    private async Task ProcessDownloadSessionAsync(DownloadSession session)
    {
        try
        {
            _logger.LogInformation("Processing download session {SessionId} with {ItemCount} items", 
                session.Id, session.Items.Count);

            var queuedItems = session.Items.Where(i => i.Status == DownloadStatus.Queued).ToList();
            var semaphore = new SemaphoreSlim(session.MaxConcurrency, session.MaxConcurrency);

            var downloadTasks = queuedItems.Select(async item =>
            {
                await semaphore.WaitAsync(session.CancellationTokenSource.Token);
                try
                {
                    await _concurrencyLimiter.WaitAsync(session.CancellationTokenSource.Token);
                    try
                    {
                        await ProcessDownloadItemAsync(item, session.CancellationTokenSource.Token);
                    }
                    finally
                    {
                        _concurrencyLimiter.Release();
                    }
                }
                finally
                {
                    semaphore.Release();
                }
            });

            await Task.WhenAll(downloadTasks);

            session.CompletedAt = DateTime.UtcNow;
            _logger.LogInformation("Download session {SessionId} completed", session.Id);
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Download session {SessionId} was cancelled", session.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing download session {SessionId}", session.Id);
        }
    }

    /// <summary>
    /// Processes a single download item.
    /// </summary>
    /// <param name="item">Download item</param>
    /// <param name="cancellationToken">Cancellation token</param>
    private async Task ProcessDownloadItemAsync(DownloadItem item, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogDebug("Processing download item: {FileName}", item.FileName);

            // Check if this is a torrent download
            if (item.DownloadUrl.Contains("hoster=torrent"))
            {
                // Get magnet link
                var magnetLink = await _torrentService.GetMagnetLinkAsync(item.DownloadUrl);
                if (string.IsNullOrEmpty(magnetLink))
                {
                    item.Status = DownloadStatus.Failed;
                    item.ErrorMessage = "Could not retrieve magnet link";
                    return;
                }

                // Download via torrent
                await _torrentService.DownloadTorrentAsync(magnetLink, item, item.Compatibility, cancellationToken);
            }
            else
            {
                // For non-torrent downloads, mark as failed for now
                item.Status = DownloadStatus.Failed;
                item.ErrorMessage = "Only torrent downloads are currently supported";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing download item {FileName}", item.FileName);
            item.Status = DownloadStatus.Failed;
            item.ErrorMessage = ex.Message;
        }
    }

    /// <summary>
    /// Scrapes latest addons from sceneryaddons.org.
    /// </summary>
    /// <param name="count">Number of addons to scrape</param>
    /// <param name="compatibilityFilter">Optional compatibility filter</param>
    /// <returns>List of addon information</returns>
    private async Task<List<AddonInfo>> ScrapeLatestAddonsAsync(int count, string? compatibilityFilter = null)
    {
        try
        {
            _logger.LogInformation("Scraping {Count} latest addons with compatibility filter: {Filter}", count, compatibilityFilter ?? "none");

            // Use the downloadable addon scraper service
            var downloadableAddons = await _downloadableScraperService.ScrapeDownloadableAddonsAsync(count, compatibilityFilter);

            // Convert to AddonInfo format
            var addonInfos = downloadableAddons.Select(da => new AddonInfo
            {
                FileName = da.FileName,
                Name = da.Name,
                Compatibility = da.Compatibility,
                DownloadUrl = da.DownloadUrl
            }).ToList();

            _logger.LogInformation("Successfully scraped {Count} downloadable addons", addonInfos.Count);
            return addonInfos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping addons");
            return new List<AddonInfo>();
        }
    }

    /// <summary>
    /// Gets the appropriate folder name for compatibility.
    /// </summary>
    /// <param name="compatibility">Compatibility string</param>
    /// <returns>Folder name</returns>
    private static string GetCompatibilityFolder(string compatibility)
    {
        return compatibility switch
        {
            "MSFS 2024" => "2024",
            "MSFS 2020" => "2020",
            "MSFS 2020/2024" => "2020-2024",
            _ => "Other"
        };
    }

    /// <summary>
    /// Disposes the download manager.
    /// </summary>
    public void Dispose()
    {
        foreach (var session in _activeSessions.Values)
        {
            session.CancellationTokenSource.Cancel();
            session.CancellationTokenSource.Dispose();
        }
        _activeSessions.Clear();
        _concurrencyLimiter.Dispose();
    }
}

/// <summary>
/// Internal download session class.
/// </summary>
internal class DownloadSession
{
    public string Id { get; set; } = "";
    public List<DownloadItem> Items { get; set; } = new();
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int MaxConcurrency { get; set; }
    public CancellationTokenSource CancellationTokenSource { get; set; } = new();
}

/// <summary>
/// Simplified addon info for scraping.
/// </summary>
public class AddonInfo
{
    public string FileName { get; set; } = "";
    public string Name { get; set; } = "";
    public string Compatibility { get; set; } = "";
    public string DownloadUrl { get; set; } = "";
}
