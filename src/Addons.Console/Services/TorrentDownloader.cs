using MonoTorrent;
using MonoTorrent.Client;
using Addons.Console.Models;
using System.Text.RegularExpressions;
using System.Web;

namespace Addons.Console.Services;

/// <summary>
/// Service for downloading files via BitTorrent using MonoTorrent.
/// </summary>
public class TorrentDownloader : IDisposable
{
    private readonly ClientEngine _engine;
    private readonly string _downloadFolder;
    private readonly List<TorrentManager> _activeTorrents;

    public TorrentDownloader(string downloadFolder = "Downloads")
    {
        _downloadFolder = downloadFolder;
        Directory.CreateDirectory(_downloadFolder);

        _activeTorrents = new List<TorrentManager>();

        // Configure torrent engine for MonoTorrent 3.0.2
        var engineSettings = new EngineSettings();

        _engine = new ClientEngine(engineSettings);
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
            System.Console.WriteLine($"🔍 Getting magnet link from: {torrentUrl}");
            
            // Decode HTML entities in the URL
            var decodedUrl = HttpUtility.HtmlDecode(torrentUrl);
            System.Console.WriteLine($"🔗 Decoded URL: {decodedUrl}");
            
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("User-Agent", 
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            
            var response = await httpClient.GetAsync(decodedUrl);
            if (!response.IsSuccessStatusCode)
            {
                System.Console.WriteLine($"❌ Failed to get torrent page: {response.StatusCode}");
                return "";
            }
            
            var content = await response.Content.ReadAsStringAsync();
            
            // Look for magnet link in the response
            var magnetMatch = Regex.Match(content, @"magnet:\?[^""'\s]+", RegexOptions.IgnoreCase);
            if (magnetMatch.Success)
            {
                var magnetLink = magnetMatch.Value;
                System.Console.WriteLine($"🧲 Found magnet link: {magnetLink.Substring(0, Math.Min(80, magnetLink.Length))}...");
                return magnetLink;
            }
            
            // If no magnet link found, check if the response itself is a magnet link
            if (content.StartsWith("magnet:"))
            {
                System.Console.WriteLine($"🧲 Response is magnet link");
                return content.Trim();
            }
            
            System.Console.WriteLine($"❌ No magnet link found in response");
            return "";
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"❌ Error getting magnet link: {ex.Message}");
            return "";
        }
    }

    /// <summary>
    /// Downloads a file using BitTorrent.
    /// </summary>
    /// <param name="magnetLink">Magnet link</param>
    /// <param name="fileName">Expected filename</param>
    /// <param name="progressCallback">Progress callback</param>
    /// <returns>True if download was successful</returns>
    public async Task<bool> DownloadTorrentAsync(string magnetLink, string fileName, Action<DownloadProgress>? progressCallback = null)
    {
        try
        {
            System.Console.WriteLine($"🧲 Starting torrent download: {fileName}");
            System.Console.WriteLine($"🔗 Magnet: {magnetLink.Substring(0, Math.Min(80, magnetLink.Length))}...");

            // Parse magnet link
            var magnet = MagnetLink.Parse(magnetLink);

            // Create torrent manager with torrent settings
            var torrentSettings = new TorrentSettings();
            var torrentManager = await _engine.AddAsync(magnet, _downloadFolder, torrentSettings);
            _activeTorrents.Add(torrentManager);

            // Start the download
            await torrentManager.StartAsync();

            var startTime = DateTime.Now;
            var lastUpdate = DateTime.Now;
            var lastProgress = 0.0;

            System.Console.WriteLine($"🔍 Searching for peers...");

            // Monitor progress
            while (torrentManager.State != TorrentState.Seeding &&
                   torrentManager.State != TorrentState.Stopped &&
                   torrentManager.State != TorrentState.Error)
            {
                await Task.Delay(1000); // Update every second

                var now = DateTime.Now;
                var currentProgress = torrentManager.Progress;

                // Report progress every 2 seconds or when progress changes significantly
                if ((now - lastUpdate).TotalMilliseconds >= 2000 || Math.Abs(currentProgress - lastProgress) >= 1.0)
                {
                    var progress = new DownloadProgress
                    {
                        FileName = fileName,
                        TotalBytes = torrentManager.Torrent?.Size ?? 0,
                        DownloadedBytes = (long)(torrentManager.Progress / 100.0 * (torrentManager.Torrent?.Size ?? 0)),
                        ElapsedTime = now - startTime,
                        SpeedBytesPerSecond = torrentManager.Monitor.DownloadRate
                    };

                    progressCallback?.Invoke(progress);

                    System.Console.Write($"\r  📥 Progress: {currentProgress:F1}% " +
                                       $"({DownloadProgress.FormatBytes(progress.DownloadedBytes)}/{DownloadProgress.FormatBytes(progress.TotalBytes)}) " +
                                       $"Speed: {DownloadProgress.FormatBytes((long)progress.SpeedBytesPerSecond)}/s " +
                                       $"State: {torrentManager.State}");

                    lastUpdate = now;
                    lastProgress = currentProgress;
                }

                // Timeout after 15 minutes if no progress
                if ((now - startTime).TotalMinutes > 15 && torrentManager.Progress == 0)
                {
                    System.Console.WriteLine($"\r❌ Download timeout - no progress in 15 minutes");
                    await torrentManager.StopAsync();
                    return false;
                }

                // If we have some progress but it's been stuck for 10 minutes, also timeout
                if ((now - startTime).TotalMinutes > 10 && Math.Abs(currentProgress - lastProgress) < 0.1)
                {
                    System.Console.WriteLine($"\r⚠️  Download appears stuck at {currentProgress:F1}% - stopping");
                    await torrentManager.StopAsync();
                    return false;
                }
            }

            System.Console.WriteLine(); // New line after progress

            if (torrentManager.State == TorrentState.Error)
            {
                System.Console.WriteLine($"❌ Torrent download failed: {torrentManager.Error}");
                return false;
            }

            if (torrentManager.State == TorrentState.Seeding || torrentManager.Progress >= 99.9)
            {
                System.Console.WriteLine($"✅ Torrent download completed: {fileName}");
                System.Console.WriteLine($"📁 Files saved to: {Path.GetFullPath(_downloadFolder)}");

                // List downloaded files
                if (torrentManager.Torrent != null)
                {
                    System.Console.WriteLine($"📋 Downloaded files:");
                    foreach (var file in torrentManager.Torrent.Files)
                    {
                        var filePath = Path.Combine(_downloadFolder, file.Path);
                        if (File.Exists(filePath))
                        {
                            var fileInfo = new FileInfo(filePath);
                            System.Console.WriteLine($"  • {file.Path} ({DownloadProgress.FormatBytes(fileInfo.Length)})");
                        }
                    }
                }

                // Stop seeding after download completes
                await torrentManager.StopAsync();
                return true;
            }

            System.Console.WriteLine($"⚠️  Download incomplete: {torrentManager.Progress:F1}%");
            return false;
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"❌ Torrent download error: {ex.Message}");
            return false;
        }
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
                System.Console.WriteLine($"⚠️  Error stopping torrent: {ex.Message}");
            }
        }
        _activeTorrents.Clear();
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
            System.Console.WriteLine($"⚠️  Error disposing torrent engine: {ex.Message}");
        }
    }
}
