using Xunit;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Net;
using Addons.Api.Services;

namespace Addons.Api.Tests;

/// <summary>
/// Unit tests for the ScraperService.
/// </summary>
public class ScraperTests
{
    private readonly Mock<ILogger<ScraperService>> _mockLogger;
    private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
    private readonly HttpClient _httpClient;

    public ScraperTests()
    {
        _mockLogger = new Mock<ILogger<ScraperService>>();
        _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_mockHttpMessageHandler.Object);
    }

    [Fact]
    public async Task ScrapeAddonsAsync_WithValidHtml_ReturnsCorrectAddons()
    {
        // Arrange
        var htmlContent = GetSampleHtmlContent();
        
        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(htmlContent)
            });

        var scraper = new ScraperService(_httpClient, _mockLogger.Object);

        // Act
        var result = await scraper.ScrapeAddonsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);

        // Verify first addon
        var firstAddon = result[0];
        Assert.Equal("inibuilds-airport-kpvd-providence-v1-0-1-msfs-2024.rar", firstAddon.FileName);
        Assert.Equal("iniBuilds – KPVD Rhode Island T. F. Green International / Providence Airport v1.0.1", firstAddon.Name);
        Assert.Equal("MSFS 2024", firstAddon.Compatibility);
        Assert.Equal(new DateTime(2025, 6, 26, 0, 0, 0, DateTimeKind.Utc), firstAddon.DateAdded);

        // Verify second addon
        var secondAddon = result[1];
        Assert.Equal("mmsimulations-airport-lgsm-samos-v1-0-0.rar", secondAddon.FileName);
        Assert.Equal("M'M SIMULATIONS – LGSM Samos International Airport v1.0.0", secondAddon.Name);
        Assert.Equal("MSFS 2020/2024", secondAddon.Compatibility);

        // Verify third addon
        var thirdAddon = result[2];
        Assert.Equal("c3d-airport-dtka-tabarka-v2-1-0-msfs-2024.rar", thirdAddon.FileName);
        Assert.Equal("CAT3Dual Studios – DTKA Tabarka-Ain Draham International Airport v2.1.0", thirdAddon.Name);
        Assert.Equal("MSFS 2024", thirdAddon.Compatibility);
    }

    [Fact]
    public async Task ScrapeAddonsAsync_WithEmptyHtml_ReturnsEmptyList()
    {
        // Arrange
        var htmlContent = "<html><body></body></html>";
        
        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(htmlContent)
            });

        var scraper = new ScraperService(_httpClient, _mockLogger.Object);

        // Act
        var result = await scraper.ScrapeAddonsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task ScrapeAddonsAsync_WithHttpError_ThrowsException()
    {
        // Arrange
        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.InternalServerError
            });

        var scraper = new ScraperService(_httpClient, _mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<HttpRequestException>(() => scraper.ScrapeAddonsAsync());
    }

    [Fact]
    public async Task ScrapeAddonsAsync_WithMalformedHtml_HandlesGracefully()
    {
        // Arrange
        var htmlContent = GetMalformedHtmlContent();
        
        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(htmlContent)
            });

        var scraper = new ScraperService(_httpClient, _mockLogger.Object);

        // Act
        var result = await scraper.ScrapeAddonsAsync();

        // Assert
        Assert.NotNull(result);
        // Should handle malformed HTML gracefully and return what it can parse
    }

    /// <summary>
    /// Sample HTML content that mimics the structure of sceneryaddons.org master list.
    /// </summary>
    private static string GetSampleHtmlContent()
    {
        return @"
<!DOCTYPE html>
<html>
<head><title>Master List – SceneryAddons</title></head>
<body>
    <h1>Master List</h1>
    
    <strong>June 26, 2025</strong>
    
    <p>
        <a href=""https://account.sceneryaddons.org/download.php?file=inibuilds-airport-kpvd-providence-v1-0-1-msfs-2024.rar&hash=30de1fe9e07234f9a9b8137d60112e4e"">Private</a>
        <a href=""https://dl.sceneryaddons.org/get.php?hoster=rapidgator&file=inibuilds-airport-kpvd-providence-v1-0-1-msfs-2024.rar&hash=c62a51e32d520347cfd8734f17563b30"">Rapidgator</a>
        <a href=""https://sceneryaddons.org/inibuilds-kpvd-rhode-island-t-f-green-international-providence-airport-msfs-2024/"">iniBuilds – KPVD Rhode Island T. F. Green International / Providence Airport v1.0.1</a>
    </p>
    
    MSFS 2024
    
    <p>
        <a href=""https://account.sceneryaddons.org/download.php?file=mmsimulations-airport-lgsm-samos-v1-0-0.rar&hash=ce80ff79d2b5c1b4356cc508b7dac123"">Private</a>
        <a href=""https://dl.sceneryaddons.org/get.php?hoster=rapidgator&file=mmsimulations-airport-lgsm-samos-v1-0-0.rar&hash=cb6584af84d8734cfb9fd3166ba7a2ae"">Rapidgator</a>
        <a href=""https://sceneryaddons.org/m-m-simulations-lgsm-samos-international-airport/"">M'M SIMULATIONS – LGSM Samos International Airport v1.0.0</a>
    </p>
    
    MSFS 2020/2024
    
    <p>
        <a href=""https://account.sceneryaddons.org/download.php?file=c3d-airport-dtka-tabarka-v2-1-0-msfs-2024.rar&hash=d569f18c4e24a51eff7409b750500d2b"">Private</a>
        <a href=""https://dl.sceneryaddons.org/get.php?hoster=rapidgator&file=c3d-airport-dtka-tabarka-v2-1-0-msfs-2024.rar&hash=b8aebfa42cdf1be23eef2f269d4127b3"">Rapidgator</a>
        <a href=""https://sceneryaddons.org/cat3dual-studios-dtka-tabarka-ain-draham-international-airport-msfs-2024/"">CAT3Dual Studios – DTKA Tabarka-Ain Draham International Airport v2.1.0</a>
    </p>
    
    MSFS 2024
    
</body>
</html>";
    }

    /// <summary>
    /// Malformed HTML content for testing error handling.
    /// </summary>
    private static string GetMalformedHtmlContent()
    {
        return @"
<html>
<body>
    <strong>June 26, 2025</strong>
    
    <p>
        <a href=""invalid-url"">Invalid Link</a>
        <a href=""https://example.com/file.rar"">Some Addon</a>
    </p>
    
    <!-- Missing compatibility info -->
    
    <p>
        <a href=""https://account.sceneryaddons.org/download.php?file=test.rar"">Private</a>
        <!-- Missing addon name link -->
    </p>
    
    Invalid Compatibility
    
</body>
</html>";
    }
}
