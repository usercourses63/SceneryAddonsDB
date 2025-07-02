using Microsoft.AspNetCore.Mvc;
using Addons.Api.Services;

namespace Addons.Api.Controllers;

/// <summary>
/// Controller for application reports and status information.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(ReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    /// <summary>
    /// Get comprehensive application status and addon check report.
    /// </summary>
    /// <returns>Detailed application status report</returns>
    /// <response code="200">Returns the application status report</response>
    /// <response code="500">Internal server error while generating report</response>
    [HttpGet("status")]
    [ProducesResponseType(typeof(ApplicationStatusReport), 200)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> GetStatusReport()
    {
        try
        {
            var report = await _reportService.GenerateStatusReportAsync();
            
            // Also display to console
            _reportService.DisplayReportToConsole(report);
            
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating status report");
            return StatusCode(500, new { error = "An error occurred while generating the status report" });
        }
    }

    /// <summary>
    /// Display application status report to console only.
    /// </summary>
    /// <returns>Confirmation that report was displayed to console</returns>
    /// <response code="200">Report displayed to console successfully</response>
    /// <response code="500">Internal server error while generating report</response>
    [HttpPost("status/console")]
    [ProducesResponseType(200)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> DisplayStatusToConsole()
    {
        try
        {
            var report = await _reportService.GenerateStatusReportAsync();
            _reportService.DisplayReportToConsole(report);
            
            return Ok(new { message = "Status report displayed to console" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating status report for console display");
            return StatusCode(500, new { error = "An error occurred while generating the status report" });
        }
    }
}
