using MonoTorrent;
using MonoTorrent.Client;
using Addons.Api.Models;
using System.Text.RegularExpressions;
using System.Web;

namespace Addons.Api.Services;

/// <summary>
/// Service for downloading files via BitTorrent using MonoTorrent.
/// </summary>
public class TorrentDownloadService : IDisposable
{
    private readonly ClientEngine _engine;
    private readonly string _baseDownloadPath;
    private readonly List<TorrentManager> _activeTorrents;
    private readonly Dictionary<string, TorrentManager> _torrentsByMagnetLink;
    private readonly ILogger<TorrentDownloadService> _logger;

    public TorrentDownloadService(ILogger<TorrentDownloadService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _baseDownloadPath = configuration.GetValue<string>("DownloadSettings:BaseDownloadPath") ?? "Downloads";
        Directory.CreateDirectory(_baseDownloadPath);
        
        _activeTorrents = new List<TorrentManager>();
        _torrentsByMagnetLink = new Dictionary<string, TorrentManager>();
        
        // Configure torrent engine for MonoTorrent 3.0.2
        var engineSettings = new EngineSettings();
        _engine = new ClientEngine(engineSettings);
        
        _logger.LogInformation("TorrentDownloadService initialized with base path: {BasePath}", _baseDownloadPath);
    }

    /// <summary>
    /// Gets the magnet link from a SceneryAddons.org torrent URL.
    /// </summary>
    /// <param name="torrentUrl">Torrent URL from SceneryAddons.org</param>
    /// <returns>Magnet link or empty string if not found</returns>
    public async Task<string> GetMagnetLinkAsync(string torrentUrl)
    {
        try
        {
            _logger.LogDebug("Getting magnet link from: {TorrentUrl}", torrentUrl);
            
            // Decode HTML entities in the URL
            var decodedUrl = HttpUtility.HtmlDecode(torrentUrl);
            _logger.LogDebug("Decoded URL: {DecodedUrl}", decodedUrl);
            
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("User-Agent", 
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            
            var response = await httpClient.GetAsync(decodedUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to get torrent page: {StatusCode}", response.StatusCode);
                return "";
            }
            
            var content = await response.Content.ReadAsStringAsync();
            
            // Look for magnet link in the response
            var magnetMatch = Regex.Match(content, @"magnet:\?[^""'\s]+", RegexOptions.IgnoreCase);
            if (magnetMatch.Success)
            {
                var magnetLink = magnetMatch.Value;
                _logger.LogDebug("Found magnet link: {MagnetLink}", magnetLink.Substring(0, Math.Min(80, magnetLink.Length)) + "...");
                return magnetLink;
            }
            
            // If no magnet link found, check if the response itself is a magnet link
            if (content.StartsWith("magnet:"))
            {
                _logger.LogDebug("Response is magnet link");
                return content.Trim();
            }
            
            _logger.LogWarning("No magnet link found in response");
            return "";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting magnet link from {TorrentUrl}", torrentUrl);
            return "";
        }
    }

    /// <summary>
    /// Downloads a file using BitTorrent.
    /// </summary>
    /// <param name="magnetLink">Magnet link</param>
    /// <param name="downloadItem">Download item to update</param>
    /// <param name="compatibility">Compatibility folder (2020, 2024, 2020/2024)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if download was successful</returns>
    public async Task<bool> DownloadTorrentAsync(string magnetLink, DownloadItem downloadItem, string compatibility, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting torrent download: {FileName}", downloadItem.FileName);
            
            downloadItem.Status = DownloadStatus.Downloading;
            downloadItem.StartedAt = DateTime.UtcNow;
            
            // Create compatibility-based folder
            var compatibilityFolder = GetCompatibilityFolder(compatibility);
            var downloadPath = Path.Combine(_baseDownloadPath, compatibilityFolder);
            Directory.CreateDirectory(downloadPath);
            
            // Parse magnet link
            var magnet = MagnetLink.Parse(magnetLink);
            
            // Check if this torrent is already managed using magnet link as key
            TorrentManager torrentManager;
            if (_torrentsByMagnetLink.TryGetValue(magnetLink, out var existingManager))
            {
                _logger.LogInformation("Found existing torrent manager for {FileName}, reusing it", downloadItem.FileName);
                torrentManager = existingManager;
                
                // Update the save path if different
                if (!torrentManager.SavePath.Equals(downloadPath, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("Moving torrent {FileName} to new path: {Path}", downloadItem.FileName, downloadPath);
                    await torrentManager.MoveFilesAsync(downloadPath, true);
                }
            }
            else
            {
                // Create torrent manager with torrent settings
                var torrentSettings = new TorrentSettings();
                try
                {
                    torrentManager = await _engine.AddAsync(magnet, downloadPath, torrentSettings);
                    _activeTorrents.Add(torrentManager);
                    _torrentsByMagnetLink[magnetLink] = torrentManager;
                    _logger.LogDebug("Created new torrent manager for {FileName}", downloadItem.FileName);
                }
                catch (TorrentException ex) when (ex.Message.Contains("already been registered"))
                {
                    _logger.LogWarning("Torrent {FileName} is already registered in engine, checking existing managers", downloadItem.FileName);
                    
                    // Try to find an existing manager by checking all active torrents
                    var foundManager = _activeTorrents.FirstOrDefault(t => t.SavePath == downloadPath);
                    if (foundManager != null)
                    {
                        torrentManager = foundManager;
                        _torrentsByMagnetLink[magnetLink] = torrentManager;
                        _logger.LogInformation("Found existing torrent manager by path for {FileName}", downloadItem.FileName);
                    }
                    else
                    {
                        _logger.LogError("Could not resolve torrent registration conflict for {FileName}", downloadItem.FileName);
                        downloadItem.Status = DownloadStatus.Failed;
                        downloadItem.ErrorMessage = "Torrent registration conflict - unable to find existing manager";
                        return false;
                    }
                }
            }
            
            // Start the download
            await torrentManager.StartAsync();
            
            var startTime = DateTime.UtcNow;
            var lastProgress = 0.0;
            
            _logger.LogDebug("Searching for peers for {FileName}", downloadItem.FileName);
            
            // Monitor progress
            while (torrentManager.State != TorrentState.Seeding && 
                   torrentManager.State != TorrentState.Stopped &&
                   torrentManager.State != TorrentState.Error &&
                   !cancellationToken.IsCancellationRequested)
            {
                await Task.Delay(2000, cancellationToken); // Update every 2 seconds
                
                var currentProgress = torrentManager.Progress;
                
                // Update download item
                downloadItem.Progress = currentProgress;
                downloadItem.TotalBytes = torrentManager.Torrent?.Size ?? 0;
                downloadItem.DownloadedBytes = (long)(currentProgress / 100.0 * downloadItem.TotalBytes);
                downloadItem.SpeedBytesPerSecond = (long)torrentManager.Monitor.DownloadRate;
                
                // Log progress occasionally
                if (Math.Abs(currentProgress - lastProgress) >= 5.0) // Every 5% progress
                {
                    _logger.LogDebug("Download progress for {FileName}: {Progress:F1}% ({Speed} KB/s)", 
                        downloadItem.FileName, currentProgress, torrentManager.Monitor.DownloadRate / 1024);
                    lastProgress = currentProgress;
                }
                
                // Timeout check
                var elapsed = DateTime.UtcNow - startTime;
                if (elapsed.TotalMinutes > 30 && currentProgress == 0)
                {
                    _logger.LogWarning("Download timeout for {FileName} - no progress in 30 minutes", downloadItem.FileName);
                    await torrentManager.StopAsync();
                    downloadItem.Status = DownloadStatus.Failed;
                    downloadItem.ErrorMessage = "Download timeout - no progress in 30 minutes";
                    return false;
                }
            }
            
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogInformation("Download cancelled for {FileName}", downloadItem.FileName);
                await torrentManager.StopAsync();
                downloadItem.Status = DownloadStatus.Cancelled;
                return false;
            }
            
            if (torrentManager.State == TorrentState.Error)
            {
                _logger.LogError("Torrent download failed for {FileName}: {Error}", downloadItem.FileName, torrentManager.Error);
                downloadItem.Status = DownloadStatus.Failed;
                downloadItem.ErrorMessage = torrentManager.Error?.ToString() ?? "Unknown torrent error";
                return false;
            }
            
            if (torrentManager.State == TorrentState.Seeding || torrentManager.Progress >= 99.9)
            {
                _logger.LogInformation("Torrent download completed: {FileName}", downloadItem.FileName);
                
                downloadItem.Status = DownloadStatus.Completed;
                downloadItem.CompletedAt = DateTime.UtcNow;
                downloadItem.Progress = 100.0;
                
                // Set local path to the first file in the torrent
                if (torrentManager.Torrent != null && torrentManager.Torrent.Files.Count > 0)
                {
                    var firstFile = torrentManager.Torrent.Files[0];
                    downloadItem.LocalPath = Path.Combine(downloadPath, firstFile.Path);
                }
                
                // Stop seeding after download completes
                await torrentManager.StopAsync();
                return true;
            }
            
            _logger.LogWarning("Download incomplete for {FileName}: {Progress:F1}%", downloadItem.FileName, torrentManager.Progress);
            downloadItem.Status = DownloadStatus.Failed;
            downloadItem.ErrorMessage = $"Download incomplete: {torrentManager.Progress:F1}%";
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Torrent download error for {FileName}", downloadItem.FileName);
            downloadItem.Status = DownloadStatus.Failed;
            downloadItem.ErrorMessage = ex.Message;
            return false;
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
    /// Stops all active torrents.
    /// </summary>
    public async Task StopAllTorrentsAsync()
    {
        foreach (var torrent in _activeTorrents.ToList())
        {
            try
            {
                await torrent.StopAsync();
                await _engine.RemoveAsync(torrent);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error stopping torrent");
            }
        }
        _activeTorrents.Clear();
        _torrentsByMagnetLink.Clear();
    }

    /// <summary>
    /// Disposes the torrent engine and stops all downloads.
    /// </summary>
    public void Dispose()
    {
        try
        {
            StopAllTorrentsAsync().Wait(5000); // Wait up to 5 seconds
            _engine?.Dispose();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error disposing torrent engine");
        }
    }
}
