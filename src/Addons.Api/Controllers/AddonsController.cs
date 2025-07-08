using Microsoft.AspNetCore.Mvc;
using Addons.Api.Services;
using Addons.Api.Models;

namespace Addons.Api.Controllers;

/// <summary>
/// Controller for managing scenery addons.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AddonsController : ControllerBase
{
    private readonly AddonsListingService _listingService;
    private readonly AddonUpdaterService _updaterService;
    private readonly ILogger<AddonsController> _logger;

    public AddonsController(
        AddonsListingService listingService,
        AddonUpdaterService updaterService,
        ILogger<AddonsController> logger)
    {
        _listingService = listingService;
        _updaterService = updaterService;
        _logger = logger;
    }

    /// <summary>
    /// Get all addons with pagination, filtering, and sorting.
    /// </summary>
    /// <param name="request">The request parameters for listing addons</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of addons or table format based on request</returns>
    /// <response code="200">Returns the list of addons</response>
    /// <response code="400">If the request parameters are invalid</response>
    [HttpGet]
    [ProducesResponseType(typeof(AddonsListResponse), 200)]
    [ProducesResponseType(typeof(AddonsTableResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetAddons([FromQuery] AddonsListRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _listingService.GetAddonsAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request parameters");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving addons");
            return StatusCode(500, new { error = "An error occurred while retrieving addons" });
        }
    }

    /// <summary>
    /// Get the latest addons (most recently added).
    /// </summary>
    /// <param name="count">Number of latest addons to retrieve (default: 10, max: 50)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of latest addons</returns>
    /// <response code="200">Returns the latest addons</response>
    /// <response code="400">If the count parameter is invalid</response>
    [HttpGet("latest")]
    [ProducesResponseType(typeof(List<AddonSummary>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetLatestAddons([FromQuery] int count = 10, CancellationToken cancellationToken = default)
    {
        if (count <= 0 || count > 50)
        {
            return BadRequest(new { error = "Count must be between 1 and 50" });
        }

        try
        {
            var addons = await _listingService.GetLatestAddonsAsync(count, cancellationToken);
            return Ok(addons);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving latest addons");
            return StatusCode(500, new { error = "An error occurred while retrieving latest addons" });
        }
    }

    /// <summary>
    /// Get addon compatibility information by filename.
    /// </summary>
    /// <param name="fileName">The filename of the addon</param>
    /// <returns>Compatibility information for the addon</returns>
    /// <response code="200">Returns the addon compatibility information</response>
    /// <response code="400">If the filename parameter is missing</response>
    /// <response code="404">If the addon is not found</response>
    [HttpGet("compatibility")]
    [ProducesResponseType(typeof(CompatibilityResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCompatibility([FromQuery] string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return BadRequest(new { error = "fileName parameter is required" });
        }

        try
        {
            var addon = await _updaterService.GetAddonByFileNameAsync(fileName);

            if (addon == null)
            {
                return NotFound(new { error = $"Addon with filename '{fileName}' not found" });
            }

            var response = new CompatibilityResponse
            {
                FileName = addon.FileName,
                Compatibility = addon.Compatibility
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving addon compatibility for {FileName}", fileName);
            return StatusCode(500, new { error = "An error occurred while retrieving addon compatibility" });
        }
    }

    /// <summary>
    /// Get addon statistics.
    /// </summary>
    /// <returns>Basic statistics about the addon database</returns>
    /// <response code="200">Returns the addon statistics</response>
    [HttpGet("stats")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var totalCount = await _updaterService.GetTotalAddonCountAsync();

            return Ok(new
            {
                totalAddons = totalCount,
                lastUpdated = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving addon statistics");
            return StatusCode(500, new { error = "An error occurred while retrieving statistics" });
        }
    }

    /// <summary>
    /// Get distinct authors from the database.
    /// </summary>
    /// <returns>List of distinct authors</returns>
    /// <response code="200">Returns the list of authors</response>
    [HttpGet("authors")]
    [ProducesResponseType(typeof(List<string>), 200)]
    public async Task<IActionResult> GetAuthors()
    {
        try
        {
            var authors = await _listingService.GetAuthorsAsync();
            return Ok(authors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving authors");
            return StatusCode(500, new { error = "An error occurred while retrieving authors" });
        }
    }

    /// <summary>
    /// Get distinct categories from the database.
    /// </summary>
    /// <returns>List of distinct categories</returns>
    /// <response code="200">Returns the list of categories</response>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(List<string>), 200)]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _listingService.GetCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, new { error = "An error occurred while retrieving categories" });
        }
    }
}
