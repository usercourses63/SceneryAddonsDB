using HtmlAgilityPack;
using Addons.Console.Models;
using System.Text.RegularExpressions;
using System.Web;

namespace Addons.Console.Services;

/// <summary>
/// Service for scraping and downloading addons from sceneryaddons.org.
/// </summary>
public class AddonDownloader : IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl = "https://sceneryaddons.org";
    private readonly string _downloadFolder;
    private readonly TorrentDownloader _torrentDownloader;

    public AddonDownloader(string downloadFolder = "Downloads")
    {
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

        _downloadFolder = downloadFolder;
        Directory.CreateDirectory(_downloadFolder);

        _torrentDownloader = new TorrentDownloader(_downloadFolder);
    }

    /// <summary>
    /// Scrapes the latest addons from sceneryaddons.org.
    /// </summary>
    /// <param name="count">Number of addons to retrieve (default: 5)</param>
    /// <returns>List of latest addons</returns>
    public async Task<List<AddonInfo>> GetLatestAddonsAsync(int count = 5)
    {
        try
        {
            System.Console.WriteLine($"🔍 Scraping {count} latest addons from {_baseUrl}...");

            var url = $"{_baseUrl}/";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                System.Console.WriteLine($"❌ Website request failed: {response.StatusCode} - {response.ReasonPhrase}");
                return new List<AddonInfo>();
            }

            var htmlContent = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            var addons = new List<AddonInfo>();

            // Find article elements that contain addon information
            var articles = doc.DocumentNode.SelectNodes("//article[contains(@class, 'post')]");
            if (articles == null || !articles.Any())
            {
                System.Console.WriteLine("❌ Could not find addon articles on the website");
                return new List<AddonInfo>();
            }

            int processed = 0;
            foreach (var article in articles)
            {
                if (processed >= count) break;

                var addon = await ParseAddonArticleAsync(article);
                if (addon != null)
                {
                    addons.Add(addon);
                    processed++;
                }
            }

            System.Console.WriteLine($"✅ Successfully scraped {addons.Count} addons");
            return addons;
        }
        catch (HttpRequestException ex)
        {
            System.Console.WriteLine($"❌ Network error: {ex.Message}");
            return new List<AddonInfo>();
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"❌ Unexpected error: {ex.Message}");
            return new List<AddonInfo>();
        }
    }

    /// <summary>
    /// Parses an addon article from the HTML.
    /// </summary>
    /// <param name="article">HTML article element</param>
    /// <returns>AddonInfo object or null if parsing fails</returns>
    private async Task<AddonInfo?> ParseAddonArticleAsync(HtmlNode article)
    {
        try
        {
            var addon = new AddonInfo();

            // Get the main link to the addon page
            var titleLink = article.SelectSingleNode(".//h2//a[@href]") ??
                           article.SelectSingleNode(".//h1//a[@href]") ??
                           article.SelectSingleNode(".//a[@href]");

            if (titleLink == null) return null;

            var addonPageUrl = titleLink.GetAttributeValue("href", "");
            if (string.IsNullOrEmpty(addonPageUrl)) return null;

            // Make sure URL is absolute
            if (!addonPageUrl.StartsWith("http"))
            {
                addonPageUrl = _baseUrl + "/" + addonPageUrl.TrimStart('/');
            }

            // Extract addon name from title
            addon.Name = titleLink.InnerText.Trim();

            // Extract compatibility from the title or subtitle
            var compatibilityMatch = Regex.Match(addon.Name, @"(MSFS \d{4}(?:/\d{4})?)", RegexOptions.IgnoreCase);
            if (compatibilityMatch.Success)
            {
                addon.Compatibility = compatibilityMatch.Groups[1].Value;
            }

            // Extract date from the article
            var dateElement = article.SelectSingleNode(".//time[@datetime]") ??
                             article.SelectSingleNode(".//span[contains(@class, 'date')]") ??
                             article.SelectSingleNode(".//div[contains(@class, 'date')]");

            if (dateElement != null)
            {
                var dateText = dateElement.GetAttributeValue("datetime", "") ?? dateElement.InnerText.Trim();
                if (DateTime.TryParse(dateText, out DateTime dateAdded))
                {
                    addon.DateAdded = dateAdded;
                    var daysAgo = (DateTime.Now - dateAdded).Days;
                    addon.DaysAgo = daysAgo == 0 ? "Today" :
                                   daysAgo == 1 ? "1 day ago" :
                                   $"{daysAgo} days ago";
                }
            }

            // We need to visit the addon page to get the download link
            addon.DownloadUrl = await GetDownloadUrlFromAddonPage(addonPageUrl);

            // Generate a filename from the addon name and download URL
            addon.FileName = GenerateFileName(addon.Name, addon.DownloadUrl);

            return addon;
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"⚠️  Error parsing addon article: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Gets the download URL from an addon page.
    /// </summary>
    /// <param name="addonPageUrl">URL of the addon page</param>
    /// <returns>Download URL or empty string if not found</returns>
    private async Task<string> GetDownloadUrlFromAddonPage(string addonPageUrl)
    {
        try
        {
            var response = await _httpClient.GetAsync(addonPageUrl);
            if (!response.IsSuccessStatusCode) return "";

            var htmlContent = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            // Look for SceneryAddons.org specific download patterns
            // Priority order: ModsFire (free) > Torrent > Rapidgator > Private

            // 1. Try ModsFire (ad-supported, free)
            var modsFireLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'modsfire') and contains(@href, 'dl.sceneryaddons.org')]");
            if (modsFireLink != null)
            {
                var downloadUrl = modsFireLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    System.Console.WriteLine($"🔗 Found ModsFire download link");
                    return downloadUrl;
                }
            }

            // 2. Try Torrent download
            var torrentLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'torrent') and contains(@href, 'dl.sceneryaddons.org')]");
            if (torrentLink != null)
            {
                var downloadUrl = torrentLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    System.Console.WriteLine($"🔗 Found Torrent download link");
                    return downloadUrl;
                }
            }

            // 3. Try Rapidgator (premium)
            var rapidgatorLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'rapidgator') and contains(@href, 'dl.sceneryaddons.org')]");
            if (rapidgatorLink != null)
            {
                var downloadUrl = rapidgatorLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    System.Console.WriteLine($"🔗 Found Rapidgator download link");
                    return downloadUrl;
                }
            }

            // 4. Try Private Direct Download (requires account)
            var privateLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'account.sceneryaddons.org/download.php')]");
            if (privateLink != null)
            {
                var downloadUrl = privateLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    System.Console.WriteLine($"🔗 Found Private download link (requires account)");
                    return downloadUrl;
                }
            }

            // 5. Fallback: any download link
            var genericDownloadLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'download') or contains(text(), 'Download')]");
            if (genericDownloadLink != null)
            {
                var downloadUrl = genericDownloadLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    System.Console.WriteLine($"🔗 Found generic download link");
                    return downloadUrl;
                }
            }

            System.Console.WriteLine($"⚠️  No download links found on page");
            return "";
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"⚠️  Error getting download URL: {ex.Message}");
            return "";
        }
    }

    /// <summary>
    /// Generates a safe filename from an addon name and download URL.
    /// </summary>
    /// <param name="addonName">Addon name</param>
    /// <param name="downloadUrl">Download URL to extract file extension</param>
    /// <returns>Safe filename</returns>
    private static string GenerateFileName(string addonName, string downloadUrl = "")
    {
        if (string.IsNullOrEmpty(addonName)) return "addon.zip";

        // Extract meaningful parts and create filename
        var fileName = addonName;

        // Remove version numbers and compatibility info for cleaner filename
        fileName = Regex.Replace(fileName, @"v\d+\.\d+\.\d+", "", RegexOptions.IgnoreCase);
        fileName = Regex.Replace(fileName, @"MSFS \d{4}(?:/\d{4})?", "", RegexOptions.IgnoreCase);

        // Clean up and sanitize
        fileName = fileName.Trim().Replace(" – ", "_").Replace(" - ", "_").Replace(" ", "_");
        fileName = SanitizeFileName(fileName);

        // Extract file extension from download URL
        var extension = ".zip"; // Default
        if (!string.IsNullOrEmpty(downloadUrl))
        {
            // Look for file parameter in URL (e.g., file=something.rar)
            var fileMatch = Regex.Match(downloadUrl, @"[?&]file=([^&]+)", RegexOptions.IgnoreCase);
            if (fileMatch.Success)
            {
                var fileParam = HttpUtility.UrlDecode(fileMatch.Groups[1].Value);
                var extractedExt = Path.GetExtension(fileParam);
                if (!string.IsNullOrEmpty(extractedExt))
                {
                    extension = extractedExt;
                }
            }
        }

        // Ensure it has the correct extension
        if (!fileName.EndsWith(extension, StringComparison.OrdinalIgnoreCase))
        {
            fileName += extension;
        }

        return fileName;
    }

    /// <summary>
    /// Resolves the final download URL by following redirects.
    /// </summary>
    /// <param name="initialUrl">Initial download URL</param>
    /// <returns>Final download URL or empty string if failed</returns>
    private async Task<string> GetFinalDownloadUrl(string initialUrl)
    {
        try
        {
            // For SceneryAddons.org URLs, we need to handle their redirect system
            if (initialUrl.Contains("dl.sceneryaddons.org/get.php"))
            {
                // These URLs redirect to external file hosts
                // We'll try to follow the redirect but may hit file host pages that require interaction

                var request = new HttpRequestMessage(HttpMethod.Head, initialUrl);
                using var response = await _httpClient.SendAsync(request);

                if (response.Headers.Location != null)
                {
                    var redirectUrl = response.Headers.Location.ToString();
                    System.Console.WriteLine($"🔄 Redirect detected: {redirectUrl}");

                    // Check if this is a direct file URL
                    if (redirectUrl.Contains(".zip") || redirectUrl.Contains(".rar") || redirectUrl.Contains(".7z"))
                    {
                        return redirectUrl;
                    }

                    // If it's a file host page, we can't automatically download
                    System.Console.WriteLine($"⚠️  Redirected to file host page - manual download required");
                    return "";
                }

                // If no redirect, the URL might be the direct download
                return initialUrl;
            }

            // For direct URLs, return as-is
            return initialUrl;
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"⚠️  Error resolving download URL: {ex.Message}");
            return initialUrl; // Return original URL as fallback
        }
    }

    /// <summary>
    /// Checks if the website is accessible.
    /// </summary>
    /// <returns>True if website is accessible</returns>
    public async Task<bool> CheckWebsiteHealthAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync(_baseUrl);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Downloads an addon file with progress reporting.
    /// </summary>
    /// <param name="addon">Addon to download</param>
    /// <param name="progressCallback">Progress callback</param>
    /// <returns>True if download was successful</returns>
    public async Task<bool> DownloadAddonAsync(AddonInfo addon, Action<DownloadProgress>? progressCallback = null)
    {
        try
        {
            if (string.IsNullOrEmpty(addon.DownloadUrl))
            {
                System.Console.WriteLine($"❌ No download URL for {addon.FileName}");
                return false;
            }

            var fileName = SanitizeFileName(addon.FileName);
            var filePath = Path.Combine(_downloadFolder, fileName);

            // Check if file already exists
            if (File.Exists(filePath))
            {
                System.Console.WriteLine($"⚠️  File already exists: {fileName}");
                return true;
            }

            System.Console.WriteLine($"📥 Downloading: {fileName}");
            System.Console.WriteLine($"🔗 URL: {addon.DownloadUrl}");

            // Check if this is a torrent download
            if (addon.DownloadUrl.Contains("hoster=torrent"))
            {
                return await DownloadViaTorrent(addon, fileName, progressCallback);
            }

            // Handle regular HTTP downloads
            return await DownloadViaHttp(addon, fileName, progressCallback);
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"❌ Download error for {addon.FileName}: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Downloads an addon via BitTorrent.
    /// </summary>
    /// <param name="addon">Addon to download</param>
    /// <param name="fileName">Filename</param>
    /// <param name="progressCallback">Progress callback</param>
    /// <returns>True if download was successful</returns>
    private async Task<bool> DownloadViaTorrent(AddonInfo addon, string fileName, Action<DownloadProgress>? progressCallback)
    {
        try
        {
            System.Console.WriteLine($"🧲 Using BitTorrent download");

            // Get the magnet link
            var magnetLink = await _torrentDownloader.GetMagnetLinkAsync(addon.DownloadUrl);
            if (string.IsNullOrEmpty(magnetLink))
            {
                System.Console.WriteLine($"❌ Could not get magnet link");
                return false;
            }

            // Download via torrent
            return await _torrentDownloader.DownloadTorrentAsync(magnetLink, fileName, progressCallback);
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"❌ Torrent download error: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Downloads an addon via HTTP.
    /// </summary>
    /// <param name="addon">Addon to download</param>
    /// <param name="fileName">Filename</param>
    /// <param name="progressCallback">Progress callback</param>
    /// <returns>True if download was successful</returns>
    private async Task<bool> DownloadViaHttp(AddonInfo addon, string fileName, Action<DownloadProgress>? progressCallback)
    {
        try
        {
            var filePath = Path.Combine(_downloadFolder, fileName);

            // Handle SceneryAddons.org redirect URLs
            var finalDownloadUrl = await GetFinalDownloadUrl(addon.DownloadUrl);
            if (string.IsNullOrEmpty(finalDownloadUrl))
            {
                System.Console.WriteLine($"❌ Could not resolve final download URL");
                return false;
            }

            if (finalDownloadUrl != addon.DownloadUrl)
            {
                System.Console.WriteLine($"🔄 Redirected to: {finalDownloadUrl}");
            }

            using var response = await _httpClient.GetAsync(finalDownloadUrl, HttpCompletionOption.ResponseHeadersRead);

            if (!response.IsSuccessStatusCode)
            {
                System.Console.WriteLine($"❌ Download failed: {response.StatusCode} - {response.ReasonPhrase}");
                return false;
            }

            var totalBytes = response.Content.Headers.ContentLength ?? 0;
            addon.FileSizeBytes = totalBytes;
            addon.FileSizeFormatted = DownloadProgress.FormatBytes(totalBytes);

            using var contentStream = await response.Content.ReadAsStreamAsync();
            using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 8192, true);

            var buffer = new byte[8192];
            var totalRead = 0L;
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            while (true)
            {
                var bytesRead = await contentStream.ReadAsync(buffer, 0, buffer.Length);
                if (bytesRead == 0) break;

                await fileStream.WriteAsync(buffer, 0, bytesRead);
                totalRead += bytesRead;

                // Report progress
                if (progressCallback != null && stopwatch.ElapsedMilliseconds > 500) // Update every 500ms
                {
                    var progress = new DownloadProgress
                    {
                        FileName = fileName,
                        TotalBytes = totalBytes,
                        DownloadedBytes = totalRead,
                        ElapsedTime = stopwatch.Elapsed,
                        SpeedBytesPerSecond = totalRead / stopwatch.Elapsed.TotalSeconds
                    };
                    progressCallback(progress);
                    stopwatch.Restart();
                }
            }

            System.Console.WriteLine($"✅ Downloaded: {fileName} ({DownloadProgress.FormatBytes(totalRead)})");
            return true;
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"❌ HTTP download error: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Downloads multiple addons with progress reporting.
    /// </summary>
    /// <param name="addons">List of addons to download</param>
    /// <returns>Number of successfully downloaded files</returns>
    public async Task<int> DownloadAddonsAsync(List<AddonInfo> addons)
    {
        var successCount = 0;
        var totalCount = addons.Count;

        System.Console.WriteLine($"🚀 Starting download of {totalCount} addon(s) to '{_downloadFolder}' folder...");
        System.Console.WriteLine();

        for (int i = 0; i < addons.Count; i++)
        {
            var addon = addons[i];
            System.Console.WriteLine($"[{i + 1}/{totalCount}] {addon.FileName}");

            var success = await DownloadAddonAsync(addon, progress =>
            {
                // Simple progress display
                System.Console.Write($"\r  Progress: {progress.ProgressPercentage:F1}% ({progress.SpeedFormatted})");
            });

            if (success)
            {
                successCount++;
                System.Console.WriteLine(); // New line after progress
            }
            else
            {
                System.Console.WriteLine("\r  ❌ Download failed");
            }

            System.Console.WriteLine();
        }

        return successCount;
    }

    /// <summary>
    /// Sanitizes a filename for safe file system usage.
    /// </summary>
    /// <param name="fileName">Original filename</param>
    /// <returns>Sanitized filename</returns>
    private static string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        return sanitized.Length > 200 ? sanitized.Substring(0, 200) : sanitized;
    }

    /// <summary>
    /// Disposes the HTTP client and torrent downloader.
    /// </summary>
    public void Dispose()
    {
        _torrentDownloader?.Dispose();
        _httpClient?.Dispose();
    }
}
