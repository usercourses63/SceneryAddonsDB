using Microsoft.AspNetCore.Mvc;
using Addons.Api.Models;

namespace Addons.Api.Controllers;

/// <summary>
/// Controller for health check endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint.
    /// </summary>
    /// <returns>Health status of the API</returns>
    /// <response code="200">Returns the health status</response>
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), 200)]
    public IActionResult GetHealth()
    {
        return Ok(new HealthResponse
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow
        });
    }
}
