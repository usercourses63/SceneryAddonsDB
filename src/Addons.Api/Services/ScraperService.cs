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
                            // Clean and decode HTML entities in addon name
                            var cleanedName = CleanAddonName(addonName);
                            
                            // Extract additional metadata
                            var author = ExtractAuthor(cleanedName);
                            var categories = ExtractCategories(cleanedName);
                            var thumbnailUrl = ExtractThumbnailUrl(contentNodes, i, cleanedName);

                            var addon = new Addon
                            {
                                FileName = fileName,
                                Name = cleanedName,
                                Compatibility = compatibility,
                                DateAdded = currentDate,
                                LastUpdated = DateTime.UtcNow,
                                Author = author,
                                Categories = categories,
                                ThumbnailUrl = thumbnailUrl
                            };

                            addons.Add(addon);
                            _logger.LogDebug("Found addon: {FileName} - {Name} - {Compatibility} - Author: {Author} - Categories: {Categories} - Thumbnail: {Thumbnail}",
                                fileName, cleanedName, compatibility, author, string.Join(", ", categories ?? new List<string>()), thumbnailUrl);
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

    /// <summary>
    /// Extracts author information from the addon name.
    /// </summary>
    private string? ExtractAuthor(string addonName)
    {
        try
        {
            _logger.LogDebug("Extracting author from: {AddonName}", addonName);
            
            // Common patterns for author extraction
            // Pattern 1: "Author Name – Addon Title" (cleaned dash)
            if (addonName.Contains("–"))
            {
                var parts = addonName.Split(new[] { "–" }, 2, StringSplitOptions.RemoveEmptyEntries);
                _logger.LogDebug("Split by – found {Count} parts: {Parts}", parts.Length, string.Join(" | ", parts));
                if (parts.Length >= 2)
                {
                    var author = parts[0].Trim();
                    // Remove any leading/trailing brackets or special characters
                    author = author.Trim('[', ']', '(', ')', '{', '}');
                    _logger.LogDebug("Candidate author: '{Author}', Length: {Length}", author, author.Length);
                    if (!string.IsNullOrWhiteSpace(author) && author.Length > 1 && author.Length < 100)
                    {
                        _logger.LogDebug("✅ Extracted author: {Author}", author);
                        return author;
                    }
                }
            }

            // Pattern 2: "Author Name - Addon Title"
            if (addonName.Contains(" - ") && !addonName.StartsWith("v", StringComparison.OrdinalIgnoreCase))
            {
                var parts = addonName.Split(new[] { " - " }, 2, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length >= 2)
                {
                    var author = parts[0].Trim();
                    // Skip if it looks like a version number or code
                    if (!Regex.IsMatch(author, @"^(v\d|version|\d+\.\d)") &&
                        !string.IsNullOrWhiteSpace(author) &&
                        author.Length > 2 && author.Length < 50)
                    {
                        return author;
                    }
                }
            }

            // Pattern 3: Look for "by AuthorName" pattern
            var byMatch = Regex.Match(addonName, @"\bby\s+([^,\-\|]+?)(?:\s|$|,|\-|\|)", RegexOptions.IgnoreCase);
            if (byMatch.Success)
            {
                var author = byMatch.Groups[1].Value.Trim();
                if (!string.IsNullOrWhiteSpace(author) && author.Length > 2 && author.Length < 50)
                {
                    return author;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract author from addon name: {AddonName}", addonName);
        }

        return null;
    }

    /// <summary>
    /// Extracts category information from the addon name.
    /// </summary>
    private List<string>? ExtractCategories(string addonName)
    {
        var categories = new List<string>();

        try
        {
            var lowerName = addonName.ToLowerInvariant();

            // Aircraft-related keywords
            if (Regex.IsMatch(lowerName, @"\b(aircraft|airplane|plane|boeing|airbus|cessna|piper|helicopter|fighter|jet|airliner)\b"))
            {
                categories.Add("Aircraft");
            }

            // Airport-related keywords
            if (Regex.IsMatch(lowerName, @"\b(airport|airfield|airstrip|runway|terminal|gate|hangar|control tower)\b"))
            {
                categories.Add("Airports");
            }

            // Scenery-related keywords
            if (Regex.IsMatch(lowerName, @"\b(scenery|landscape|terrain|city|town|village|mountain|forest|coast|island)\b"))
            {
                categories.Add("Scenery");
            }

            // Livery-related keywords
            if (Regex.IsMatch(lowerName, @"\b(livery|liveries|repaint|skin|texture|airline|charter)\b"))
            {
                categories.Add("Liveries");
            }

            // Weather-related keywords
            if (Regex.IsMatch(lowerName, @"\b(weather|cloud|storm|rain|snow|fog|wind|atmosphere)\b"))
            {
                categories.Add("Weather");
            }

            // Utility/Tool keywords
            if (Regex.IsMatch(lowerName, @"\b(utility|tool|utility|manager|editor|converter|installer)\b"))
            {
                categories.Add("Utilities");
            }

            // Sound-related keywords
            if (Regex.IsMatch(lowerName, @"\b(sound|audio|engine|noise|ambient|music)\b"))
            {
                categories.Add("Sounds");
            }

            // Navigation-related keywords
            if (Regex.IsMatch(lowerName, @"\b(navigation|nav|gps|ils|vor|ndb|approach|chart)\b"))
            {
                categories.Add("Navigation");
            }

            // Traffic-related keywords
            if (Regex.IsMatch(lowerName, @"\b(traffic|ai|artificial intelligence|ground vehicles|vehicles)\b"))
            {
                categories.Add("Traffic");
            }

            // Mission/Flight Plan keywords
            if (Regex.IsMatch(lowerName, @"\b(mission|flight plan|campaign|scenario|training)\b"))
            {
                categories.Add("Missions");
            }

            return categories.Count > 0 ? categories : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract categories from addon name: {AddonName}", addonName);
            return null;
        }
    }

    /// <summary>
    /// Cleans addon names by decoding HTML entities and removing unwanted characters.
    /// </summary>
    private string CleanAddonName(string addonName)
    {
        if (string.IsNullOrEmpty(addonName)) return addonName;

        try
        {
            // Decode HTML entities
            var cleaned = HttpUtility.HtmlDecode(addonName);
            
            // Replace common HTML entities that might not be decoded
            cleaned = cleaned.Replace("&#8211;", "–")  // Em dash
                           .Replace("&#8212;", "—")  // Em dash variation
                           .Replace("&#8216;", "'")  // Left single quotation mark
                           .Replace("&#8217;", "'")  // Right single quotation mark
                           .Replace("&#8220;", "\"")  // Left double quotation mark
                           .Replace("&#8221;", "\"")  // Right double quotation mark
                           .Replace("&#8230;", "…")  // Horizontal ellipsis
                           .Replace("&#038;", "&")   // Ampersand HTML entity
                           .Replace("&amp;", "&")   // Ampersand
                           .Replace("&lt;", "<")    // Less than
                           .Replace("&gt;", ">")    // Greater than
                           .Replace("&quot;", "\"") // Quotation mark
                           .Replace("&apos;", "'");  // Apostrophe

            // Trim whitespace
            cleaned = cleaned.Trim();

            return cleaned;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to clean addon name: {AddonName}", addonName);
            return addonName;
        }
    }

    /// <summary>
    /// Extracts thumbnail URL for the addon from nearby image elements.
    /// </summary>
    private string? ExtractThumbnailUrl(List<HtmlNode> nodes, int startIndex, string addonName)
    {
        try
        {
            // Look for images in a wider range around the addon entry
            for (int i = Math.Max(0, startIndex - 20); i < Math.Min(nodes.Count, startIndex + 50); i++)
            {
                var node = nodes[i];
                
                // Check if this is an img tag
                if (node.Name == "img")
                {
                    var src = node.GetAttributeValue("src", "");
                    var alt = node.GetAttributeValue("alt", "");
                    
                    if (!string.IsNullOrEmpty(src))
                    {
                        // Make sure it's a valid image URL
                        if (src.StartsWith("http") || src.StartsWith("//") || src.StartsWith("/"))
                        {
                            // Convert relative URLs to absolute
                            if (src.StartsWith("//"))
                            {
                                src = "https:" + src;
                            }
                            else if (src.StartsWith("/") && !src.StartsWith("//"))
                            {
                                src = "https://sceneryaddons.org" + src;
                            }

                            // Check if the image seems relevant to the addon
                            if (IsRelevantThumbnail(src, alt, addonName))
                            {
                                return src;
                            }
                        }
                    }
                }

                // Also check for images within anchor tags
                if (node.Name == "a")
                {
                    var imgNodes = node.SelectNodes(".//img");
                    if (imgNodes != null)
                    {
                        foreach (var imgNode in imgNodes)
                        {
                            var src = imgNode.GetAttributeValue("src", "");
                            var alt = imgNode.GetAttributeValue("alt", "");
                            
                            if (!string.IsNullOrEmpty(src))
                            {
                                // Convert relative URLs to absolute
                                if (src.StartsWith("//"))
                                {
                                    src = "https:" + src;
                                }
                                else if (src.StartsWith("/") && !src.StartsWith("//"))
                                {
                                    src = "https://sceneryaddons.org" + src;
                                }

                                if (IsRelevantThumbnail(src, alt, addonName))
                                {
                                    return src;
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract thumbnail for addon: {AddonName}", addonName);
        }

        return null;
    }

    /// <summary>
    /// Determines if an image is relevant as a thumbnail for the addon.
    /// </summary>
    private bool IsRelevantThumbnail(string src, string alt, string addonName)
    {
        // Skip common non-thumbnail images
        var skipPatterns = new[]
        {
            "logo", "header", "footer", "banner", "icon", "button",
            "arrow", "spacer", "divider", "background"
        };

        var lowerSrc = src.ToLowerInvariant();
        var lowerAlt = alt.ToLowerInvariant();

        foreach (var pattern in skipPatterns)
        {
            if (lowerSrc.Contains(pattern) || lowerAlt.Contains(pattern))
            {
                return false;
            }
        }

        // Prefer images that are likely screenshots or previews
        var preferredPatterns = new[]
        {
            "screenshot", "preview", "thumb", "image", "photo", "pic",
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
        };

        foreach (var pattern in preferredPatterns)
        {
            if (lowerSrc.Contains(pattern) || lowerAlt.Contains(pattern))
            {
                return true;
            }
        }

        // If alt text contains parts of the addon name, it's likely relevant
        if (!string.IsNullOrEmpty(alt) && !string.IsNullOrEmpty(addonName))
        {
            var addonWords = addonName.ToLowerInvariant().Split(' ', '-', '_');
            var altWords = alt.ToLowerInvariant().Split(' ', '-', '_');
            
            var matchCount = addonWords.Intersect(altWords).Count();
            if (matchCount >= 2) // At least 2 matching words
            {
                return true;
            }
        }

        // Default to accepting most images that aren't explicitly excluded
        return true;
    }
}
