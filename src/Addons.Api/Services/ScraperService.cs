using HtmlAgilityPack;
using System.Web;
using System.Text.RegularExpressions;
using Addons.Api.Models;

namespace Addons.Api.Services;

/// <summary>
/// Service responsible for scraping addon data from sceneryaddons.org.
/// </summary>
public class ScraperService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ScraperService> _logger;
    private const string TargetUrl = "https://sceneryaddons.org/master-list/";

    /// <summary>
    /// Initializes a new instance of the ScraperService.
    /// </summary>
    /// <param name="httpClient">The HTTP client for making requests.</param>
    /// <param name="logger">The logger instance.</param>
    public ScraperService(HttpClient httpClient, ILogger<ScraperService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    /// <summary>
    /// Scrapes addon data from the sceneryaddons.org master list.
    /// </summary>
    /// <returns>A list of scraped addon records.</returns>
    public async Task<List<Addon>> ScrapeAddonsAsync()
    {
        _logger.LogInformation("Starting scrape of {Url}", TargetUrl);
        
        try
        {
            var html = await _httpClient.GetStringAsync(TargetUrl);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var addons = new List<Addon>();
            var currentDate = DateTime.UtcNow; // Default fallback date

            // Find all text nodes and elements to process sequentially
            var contentNodes = doc.DocumentNode.SelectNodes("//text()[normalize-space()] | //a[@href] | //strong")
                ?.Where(n => !string.IsNullOrWhiteSpace(n.InnerText?.Trim()))
                .ToList() ?? new List<HtmlNode>();

            for (int i = 0; i < contentNodes.Count; i++)
            {
                var node = contentNodes[i];
                var text = node.InnerText?.Trim();

                if (string.IsNullOrEmpty(text)) continue;

                // Check if this is a date heading
                if (TryParseDate(text, out var parsedDate))
                {
                    currentDate = parsedDate;
                    _logger.LogDebug("Found date heading: {Date}", currentDate.ToString("yyyy-MM-dd"));
                    continue;
                }

                // Check if this is a download link with file parameter
                if (node.Name == "a" && node.GetAttributeValue("href", "").Contains("file="))
                {
                    var href = node.GetAttributeValue("href", "");
                    var fileName = ExtractFileNameFromUrl(href);

                    if (!string.IsNullOrEmpty(fileName) && fileName.EndsWith(".rar", StringComparison.OrdinalIgnoreCase))
                    {
                        // Check if we already have this addon (avoid duplicates from multiple download links)
                        if (addons.Any(a => a.FileName.Equals(fileName, StringComparison.OrdinalIgnoreCase)))
                        {
                            continue;
                        }

                        // Look for the addon name in subsequent anchor tags
                        var addonName = FindAddonName(contentNodes, i);
                        var compatibility = FindCompatibility(contentNodes, i, addonName);

                        if (!string.IsNullOrEmpty(addonName) && !string.IsNullOrEmpty(compatibility))
                        {
                            var addon = new Addon
                            {
                                FileName = fileName,
                                Name = addonName,
                                Compatibility = compatibility,
                                DateAdded = currentDate,
                                LastUpdated = DateTime.UtcNow
                            };

                            addons.Add(addon);
                            _logger.LogDebug("Found addon: {FileName} - {Name} - {Compatibility}",
                                fileName, addonName, compatibility);
                        }
                    }
                }
            }

            _logger.LogInformation("Scraping completed. Found {Count} addons", addons.Count);
            return addons;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while scraping addons");
            throw;
        }
    }

    /// <summary>
    /// Attempts to parse a date string from various formats.
    /// </summary>
    private bool TryParseDate(string text, out DateTime date)
    {
        date = default;

        // Common date patterns found on the site
        var datePatterns = new[]
        {
            @"^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$",
            @"^\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$"
        };

        foreach (var pattern in datePatterns)
        {
            if (Regex.IsMatch(text, pattern, RegexOptions.IgnoreCase))
            {
                if (DateTime.TryParse(text, out date))
                {
                    date = DateTime.SpecifyKind(date, DateTimeKind.Utc);
                    return true;
                }
            }
        }

        return false;
    }

    /// <summary>
    /// Extracts the filename from a download URL.
    /// </summary>
    private string ExtractFileNameFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var query = HttpUtility.ParseQueryString(uri.Query);
            var fileName = query["file"];
            
            if (!string.IsNullOrEmpty(fileName))
            {
                return HttpUtility.UrlDecode(fileName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract filename from URL: {Url}", url);
        }

        return string.Empty;
    }

    /// <summary>
    /// Finds the addon name by looking for the title anchor after download links.
    /// </summary>
    private string FindAddonName(List<HtmlNode> nodes, int startIndex)
    {
        // Look ahead for the next anchor that contains the addon title
        for (int i = startIndex + 1; i < Math.Min(nodes.Count, startIndex + 20); i++)
        {
            var node = nodes[i];
            if (node.Name == "a" && !string.IsNullOrEmpty(node.InnerText?.Trim()))
            {
                var text = node.InnerText.Trim();
                // Skip if it's another download link
                if (node.GetAttributeValue("href", "").Contains("file=") || 
                    text.Equals("Private", StringComparison.OrdinalIgnoreCase) ||
                    text.Equals("Rapidgator", StringComparison.OrdinalIgnoreCase) ||
                    text.Equals("MixDrop", StringComparison.OrdinalIgnoreCase) ||
                    text.Equals("ModsFire", StringComparison.OrdinalIgnoreCase) ||
                    text.Equals("Torrent", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }
                
                // This should be the addon title
                return text;
            }
        }

        return string.Empty;
    }

    /// <summary>
    /// Finds the compatibility information that appears after the addon name.
    /// </summary>
    private string FindCompatibility(List<HtmlNode> nodes, int startIndex, string addonName)
    {
        if (string.IsNullOrEmpty(addonName)) return string.Empty;

        // Look for compatibility info after finding the addon name
        for (int i = startIndex + 1; i < Math.Min(nodes.Count, startIndex + 30); i++)
        {
            var node = nodes[i];
            var text = node.InnerText?.Trim();
            
            if (string.IsNullOrEmpty(text)) continue;

            // Check if this text contains the addon name (we found the title)
            if (text.Contains(addonName, StringComparison.OrdinalIgnoreCase))
            {
                // Look for compatibility in the next few nodes
                for (int j = i + 1; j < Math.Min(nodes.Count, i + 10); j++)
                {
                    var compatNode = nodes[j];
                    var compatText = compatNode.InnerText?.Trim();
                    
                    if (IsValidCompatibility(compatText))
                    {
                        return compatText;
                    }
                }
            }
        }

        return string.Empty;
    }

    /// <summary>
    /// Validates if the text represents a valid compatibility string.
    /// </summary>
    private bool IsValidCompatibility(string? text)
    {
        if (string.IsNullOrEmpty(text)) return false;

        var validCompatibilities = new[]
        {
            "MSFS 2020",
            "MSFS 2024", 
            "MSFS 2020/2024"
        };

        return validCompatibilities.Any(compat => 
            string.Equals(text, compat, StringComparison.OrdinalIgnoreCase));
    }
}
