using HtmlAgilityPack;
using Addons.Api.Models;
using System.Text.RegularExpressions;

namespace Addons.Api.Services;

/// <summary>
/// Service for scraping addons with download URLs from sceneryaddons.org.
/// </summary>
public class DownloadableAddonScraperService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DownloadableAddonScraperService> _logger;
    private const string BaseUrl = "https://sceneryaddons.org";

    public DownloadableAddonScraperService(HttpClient httpClient, ILogger<DownloadableAddonScraperService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        // Configure HttpClient
        _httpClient.DefaultRequestHeaders.Add("User-Agent", 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
    }

    /// <summary>
    /// Scrapes the latest addons with download URLs.
    /// </summary>
    /// <param name="count">Number of addons to scrape</param>
    /// <param name="compatibilityFilter">Optional compatibility filter</param>
    /// <returns>List of downloadable addon information</returns>
    public async Task<List<DownloadableAddonInfo>> ScrapeDownloadableAddonsAsync(int count = 10, string? compatibilityFilter = null)
    {
        try
        {
            _logger.LogInformation("Scraping {Count} downloadable addons with compatibility filter: {Filter}", count, compatibilityFilter ?? "none");

            var response = await _httpClient.GetAsync(BaseUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to fetch sceneryaddons.org: {StatusCode}", response.StatusCode);
                return new List<DownloadableAddonInfo>();
            }

            var htmlContent = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            var addons = new List<DownloadableAddonInfo>();

            // Find article elements that contain addon information
            var articles = doc.DocumentNode.SelectNodes("//article[contains(@class, 'post')]");
            if (articles == null || !articles.Any())
            {
                _logger.LogWarning("Could not find addon articles on the website");
                return new List<DownloadableAddonInfo>();
            }

            int processed = 0;
            foreach (var article in articles)
            {
                if (processed >= count) break;

                var addon = await ParseAddonArticleAsync(article);
                if (addon != null)
                {
                    // Apply compatibility filter if specified
                    if (string.IsNullOrEmpty(compatibilityFilter) || 
                        addon.Compatibility.Contains(compatibilityFilter, StringComparison.OrdinalIgnoreCase))
                    {
                        addons.Add(addon);
                        processed++;
                    }
                }
            }

            _logger.LogInformation("Successfully scraped {Count} downloadable addons", addons.Count);
            return addons;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping downloadable addons");
            return new List<DownloadableAddonInfo>();
        }
    }

    /// <summary>
    /// Parses an addon article from the HTML.
    /// </summary>
    /// <param name="article">HTML article element</param>
    /// <returns>DownloadableAddonInfo object or null if parsing fails</returns>
    private async Task<DownloadableAddonInfo?> ParseAddonArticleAsync(HtmlNode article)
    {
        try
        {
            var addon = new DownloadableAddonInfo();

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
                addonPageUrl = BaseUrl + "/" + addonPageUrl.TrimStart('/');
            }

            // Extract addon name from title
            addon.Name = titleLink.InnerText.Trim();

            // Extract compatibility from the title or subtitle
            var compatibilityMatch = Regex.Match(addon.Name, @"(MSFS \d{4}(?:/\d{4})?)", RegexOptions.IgnoreCase);
            if (compatibilityMatch.Success)
            {
                addon.Compatibility = compatibilityMatch.Groups[1].Value;
            }
            else
            {
                // Default compatibility if not found in title
                addon.Compatibility = "MSFS 2020/2024";
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
                }
            }

            // Get the download URL from the addon page
            addon.DownloadUrl = await GetDownloadUrlFromAddonPageAsync(addonPageUrl);
            
            if (string.IsNullOrEmpty(addon.DownloadUrl))
            {
                _logger.LogDebug("No download URL found for addon: {Name}", addon.Name);
                return null; // Skip addons without download URLs
            }

            // Generate a filename from the addon name and download URL
            addon.FileName = GenerateFileName(addon.Name, addon.DownloadUrl);

            return addon;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error parsing addon article");
            return null;
        }
    }

    /// <summary>
    /// Gets the download URL from an addon page.
    /// </summary>
    /// <param name="addonPageUrl">URL of the addon page</param>
    /// <returns>Download URL or empty string if not found</returns>
    private async Task<string> GetDownloadUrlFromAddonPageAsync(string addonPageUrl)
    {
        try
        {
            var response = await _httpClient.GetAsync(addonPageUrl);
            if (!response.IsSuccessStatusCode) return "";

            var htmlContent = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            // Look for SceneryAddons.org specific download patterns
            // Priority order: Torrent > ModsFire > Rapidgator

            // 1. Try Torrent download (preferred for our implementation)
            var torrentLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'torrent') and contains(@href, 'dl.sceneryaddons.org')]");
            if (torrentLink != null)
            {
                var downloadUrl = torrentLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    _logger.LogDebug("Found torrent download link");
                    return downloadUrl;
                }
            }

            // 2. Try ModsFire (ad-supported, free)
            var modsFireLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'modsfire') and contains(@href, 'dl.sceneryaddons.org')]");
            if (modsFireLink != null)
            {
                var downloadUrl = modsFireLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    _logger.LogDebug("Found ModsFire download link");
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
                    _logger.LogDebug("Found Rapidgator download link");
                    return downloadUrl;
                }
            }

            // 4. Try any dl.sceneryaddons.org link
            var genericLink = doc.DocumentNode.SelectSingleNode("//a[contains(@href, 'dl.sceneryaddons.org')]");
            if (genericLink != null)
            {
                var downloadUrl = genericLink.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(downloadUrl))
                {
                    _logger.LogDebug("Found generic download link");
                    return downloadUrl;
                }
            }

            _logger.LogDebug("No download link found on page: {Url}", addonPageUrl);
            return "";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting download URL from page: {Url}", addonPageUrl);
            return "";
        }
    }

    /// <summary>
    /// Generates a filename from addon name and download URL.
    /// </summary>
    /// <param name="addonName">Addon name</param>
    /// <param name="downloadUrl">Download URL</param>
    /// <returns>Generated filename</returns>
    private static string GenerateFileName(string addonName, string downloadUrl)
    {
        try
        {
            // Try to extract filename from URL
            var urlMatch = Regex.Match(downloadUrl, @"[?&]file=([^&]+)", RegexOptions.IgnoreCase);
            if (urlMatch.Success)
            {
                var fileName = System.Web.HttpUtility.UrlDecode(urlMatch.Groups[1].Value);
                if (!string.IsNullOrEmpty(fileName) && fileName.Contains('.'))
                {
                    return fileName;
                }
            }

            // Fallback: generate from addon name
            var cleanName = Regex.Replace(addonName, @"[^\w\s-]", "").Trim();
            cleanName = Regex.Replace(cleanName, @"\s+", "-").ToLowerInvariant();
            
            // Limit length and add extension
            if (cleanName.Length > 50)
            {
                cleanName = cleanName.Substring(0, 50);
            }
            
            return $"{cleanName}.rar";
        }
        catch
        {
            return "addon-download.rar";
        }
    }
}

/// <summary>
/// Downloadable addon information.
/// </summary>
public class DownloadableAddonInfo
{
    /// <summary>
    /// Addon name.
    /// </summary>
    public string Name { get; set; } = "";

    /// <summary>
    /// Generated filename.
    /// </summary>
    public string FileName { get; set; } = "";

    /// <summary>
    /// Compatibility (MSFS 2020, MSFS 2024, MSFS 2020/2024).
    /// </summary>
    public string Compatibility { get; set; } = "";

    /// <summary>
    /// Download URL.
    /// </summary>
    public string DownloadUrl { get; set; } = "";

    /// <summary>
    /// Date when addon was added.
    /// </summary>
    public DateTime DateAdded { get; set; }
}
