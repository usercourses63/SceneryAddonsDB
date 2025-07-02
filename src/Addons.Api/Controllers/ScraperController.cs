using Microsoft.AspNetCore.Mvc;
using Addons.Api.BackgroundJobs;

namespace Addons.Api.Controllers;

/// <summary>
/// Controller for scraper operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ScraperController : ControllerBase
{
    private readonly ScrapeWorker _scrapeWorker;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ScraperController> _logger;

    public ScraperController(
        ScrapeWorker scrapeWorker,
        IConfiguration configuration,
        ILogger<ScraperController> logger)
    {
        _scrapeWorker = scrapeWorker;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Manually trigger a scrape operation.
    /// </summary>
    /// <param name="token">Authentication token from X-Refresh-Token header</param>
    /// <returns>Result of the scrape operation</returns>
    /// <response code="200">Scrape operation completed successfully</response>
    /// <response code="401">Unauthorized - invalid or missing token</response>
    /// <response code="500">Internal server error during scrape operation</response>
    /// <response code="501">Not implemented - no refresh token configured</response>
    [HttpPost("refresh")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(500)]
    [ProducesResponseType(501)]
    public async Task<IActionResult> TriggerRefresh([FromHeader(Name = "X-Refresh-Token")] string? token)
    {
        var expectedToken = _configuration.GetValue<string>("RefreshToken");

        if (string.IsNullOrEmpty(expectedToken))
        {
            return StatusCode(501, new { error = "Refresh functionality not configured" });
        }

        if (string.IsNullOrEmpty(token) || token != expectedToken)
        {
            return Unauthorized(new { error = "Invalid or missing refresh token" });
        }

        try
        {
            await _scrapeWorker.TriggerManualScrapeAsync();
            return Ok(new { message = "Manual scrape completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during manual scrape operation");
            return StatusCode(500, new 
            { 
                error = "Scrape operation failed",
                detail = ex.Message 
            });
        }
    }
}
