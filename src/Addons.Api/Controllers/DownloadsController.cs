using Microsoft.AspNetCore.Mvc;
using Addons.Api.Models;
using Addons.Api.Services;

namespace Addons.Api.Controllers;

/// <summary>
/// Controller for managing addon downloads.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DownloadsController : ControllerBase
{
    private readonly DownloadManagerService _downloadManager;
    private readonly ILogger<DownloadsController> _logger;

    public DownloadsController(DownloadManagerService downloadManager, ILogger<DownloadsController> logger)
    {
        _downloadManager = downloadManager;
        _logger = logger;
    }

    /// <summary>
    /// Downloads a specific addon by ID.
    /// </summary>
    /// <param name="addonId">The ID of the addon to download</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Download session information</returns>
    /// <response code="200">Download started successfully</response>
    /// <response code="404">Addon not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("addon/{addonId}")]
    [ProducesResponseType(typeof(DownloadResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    [ProducesResponseType(typeof(ProblemDetails), 500)]
    public async Task<ActionResult<DownloadResponse>> DownloadAddon(
        string addonId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting download for addon: {AddonId}", addonId);

            var response = await _downloadManager.DownloadAddonAsync(addonId, cancellationToken);

            if (response == null)
            {
                return NotFound(new { error = $"Addon with ID '{addonId}' not found" });
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading addon: {AddonId}", addonId);
            return StatusCode(500, new { error = "An error occurred while starting the download" });
        }
    }

    /// <summary>
    /// Starts a new download session for the latest addons.
    /// </summary>
    /// <param name="request">Download request parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Download session information</returns>
    /// <response code="200">Download session started successfully</response>
    /// <response code="400">Invalid request parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("start")]
    [ProducesResponseType(typeof(DownloadResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    [ProducesResponseType(typeof(ProblemDetails), 500)]
    public async Task<ActionResult<DownloadResponse>> StartDownload(
        [FromBody] DownloadRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting download request for {Count} addons", request.Count);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _downloadManager.StartDownloadSessionAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting download session");
            return Problem("An error occurred while starting the download session");
        }
    }

    /// <summary>
    /// Gets the status of a specific download session.
    /// </summary>
    /// <param name="sessionId">Download session ID</param>
    /// <returns>Download session status</returns>
    /// <response code="200">Session status retrieved successfully</response>
    /// <response code="404">Session not found</response>
    [HttpGet("sessions/{sessionId}/status")]
    [ProducesResponseType(typeof(DownloadStatusResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public ActionResult<DownloadStatusResponse> GetSessionStatus(string sessionId)
    {
        try
        {
            var status = _downloadManager.GetSessionStatus(sessionId);
            if (status == null)
            {
                return NotFound($"Download session '{sessionId}' not found");
            }

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting session status for {SessionId}", sessionId);
            return Problem("An error occurred while retrieving session status");
        }
    }

    /// <summary>
    /// Gets the status of all active download sessions.
    /// </summary>
    /// <returns>List of all active download sessions</returns>
    /// <response code="200">Sessions retrieved successfully</response>
    [HttpGet("sessions")]
    [ProducesResponseType(typeof(List<DownloadStatusResponse>), 200)]
    public ActionResult<List<DownloadStatusResponse>> GetAllSessions()
    {
        try
        {
            var sessions = _downloadManager.GetAllSessions();
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all sessions");
            return Problem("An error occurred while retrieving sessions");
        }
    }

    /// <summary>
    /// Pauses a specific download session.
    /// </summary>
    /// <param name="sessionId">Download session ID</param>
    /// <returns>Pause result</returns>
    /// <response code="200">Session paused successfully</response>
    /// <response code="404">Session not found</response>
    [HttpPost("sessions/{sessionId}/pause")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public ActionResult PauseSession(string sessionId)
    {
        try
        {
            var paused = _downloadManager.PauseSession(sessionId);
            if (!paused)
            {
                return NotFound($"Download session '{sessionId}' not found");
            }

            _logger.LogInformation("Download session {SessionId} paused", sessionId);
            return Ok(new { message = "Session paused successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing session {SessionId}", sessionId);
            return Problem("An error occurred while pausing the session");
        }
    }

    /// <summary>
    /// Cancels a specific download session.
    /// </summary>
    /// <param name="sessionId">Download session ID</param>
    /// <returns>Cancellation result</returns>
    /// <response code="200">Session cancelled successfully</response>
    /// <response code="404">Session not found</response>
    [HttpPost("sessions/{sessionId}/cancel")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public ActionResult CancelSession(string sessionId)
    {
        try
        {
            var cancelled = _downloadManager.CancelSession(sessionId);
            if (!cancelled)
            {
                return NotFound($"Download session '{sessionId}' not found");
            }

            _logger.LogInformation("Download session {SessionId} cancelled", sessionId);
            return Ok(new { message = "Session cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling session {SessionId}", sessionId);
            return Problem("An error occurred while cancelling the session");
        }
    }

    /// <summary>
    /// Resumes a specific download session.
    /// </summary>
    /// <param name="sessionId">Download session ID</param>
    /// <returns>Resume result</returns>
    /// <response code="200">Session resumed successfully</response>
    /// <response code="404">Session not found</response>
    [HttpPost("sessions/{sessionId}/resume")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public ActionResult ResumeSession(string sessionId)
    {
        try
        {
            var resumed = _downloadManager.ResumeSession(sessionId);
            if (!resumed)
            {
                return NotFound($"Download session '{sessionId}' not found");
            }

            _logger.LogInformation("Download session {SessionId} resumed", sessionId);
            return Ok(new { message = "Session resumed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming session {SessionId}", sessionId);
            return Problem("An error occurred while resuming the session");
        }
    }

    /// <summary>
    /// Pauses a specific download item.
    /// </summary>
    /// <param name="sessionId">Download session ID</param>
    /// <param name="itemId">Download item ID</param>
    /// <returns>Pause result</returns>
    /// <response code="200">Item paused successfully</response>
    /// <response code="404">Session or item not found</response>
    [HttpPost("sessions/{sessionId}/items/{itemId}/pause")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public ActionResult PauseDownloadItem(string sessionId, string itemId)
    {
        try
        {
            var paused = _downloadManager.PauseDownloadItem(sessionId, itemId);
            if (!paused)
            {
                return NotFound($"Download item '{itemId}' not found in session '{sessionId}'");
            }

            _logger.LogInformation("Download item {ItemId} in session {SessionId} paused", itemId, sessionId);
            return Ok(new { message = "Download item paused successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing download item {ItemId} in session {SessionId}", itemId, sessionId);
            return Problem("An error occurred while pausing the download item");
        }
    }

    /// <summary>
    /// Resumes a specific download item.
    /// </summary>
    /// <param name="sessionId">Download session ID</param>
    /// <param name="itemId">Download item ID</param>
    /// <returns>Resume result</returns>
    /// <response code="200">Item resumed successfully</response>
    /// <response code="404">Session or item not found</response>
    [HttpPost("sessions/{sessionId}/items/{itemId}/resume")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public ActionResult ResumeDownloadItem(string sessionId, string itemId)
    {
        try
        {
            var resumed = _downloadManager.ResumeDownloadItem(sessionId, itemId);
            if (!resumed)
            {
                return NotFound($"Download item '{itemId}' not found in session '{sessionId}'");
            }

            _logger.LogInformation("Download item {ItemId} in session {SessionId} resumed", itemId, sessionId);
            return Ok(new { message = "Download item resumed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming download item {ItemId} in session {SessionId}", itemId, sessionId);
            return Problem("An error occurred while resuming the download item");
        }
    }

    /// <summary>
    /// Cancels a specific download item.
    /// </summary>
    /// <param name="sessionId">Download session ID</param>
    /// <param name="itemId">Download item ID</param>
    /// <returns>Cancel result</returns>
    /// <response code="200">Item cancelled successfully</response>
    /// <response code="404">Session or item not found</response>
    [HttpPost("sessions/{sessionId}/items/{itemId}/cancel")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public ActionResult CancelDownloadItem(string sessionId, string itemId)
    {
        try
        {
            var cancelled = _downloadManager.CancelDownloadItem(sessionId, itemId);
            if (!cancelled)
            {
                return NotFound($"Download item '{itemId}' not found in session '{sessionId}'");
            }

            _logger.LogInformation("Download item {ItemId} in session {SessionId} cancelled", itemId, sessionId);
            return Ok(new { message = "Download item cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling download item {ItemId} in session {SessionId}", itemId, sessionId);
            return Problem("An error occurred while cancelling the download item");
        }
    }

    /// <summary>
    /// Clears all download sessions history.
    /// </summary>
    /// <returns>Clear result</returns>
    /// <response code="200">Sessions history cleared successfully</response>
    [HttpDelete("sessions")]
    [ProducesResponseType(200)]
    public ActionResult ClearSessionsHistory()
    {
        try
        {
            var clearedCount = _downloadManager.ClearSessionsHistory();
            _logger.LogInformation("Cleared {Count} download sessions from history", clearedCount);
            return Ok(new { message = $"Cleared {clearedCount} sessions from history" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing sessions history");
            return Problem("An error occurred while clearing sessions history");
        }
    }

    /// <summary>
    /// Gets download statistics and metrics.
    /// </summary>
    /// <returns>Download statistics</returns>
    /// <response code="200">Statistics retrieved successfully</response>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DownloadStats), 200)]
    public ActionResult<DownloadStats> GetDownloadStats()
    {
        try
        {
            var sessions = _downloadManager.GetAllSessions();
            
            var stats = new DownloadStats
            {
                ActiveSessions = sessions.Count(s => s.Status == SessionStatus.Active),
                TotalSessions = sessions.Count,
                TotalDownloads = sessions.Sum(s => s.TotalItems),
                CompletedDownloads = sessions.Sum(s => s.CompletedItems),
                FailedDownloads = sessions.Sum(s => s.FailedItems),
                ActiveDownloads = sessions.Sum(s => s.ActiveDownloads),
                TotalSpeedBytesPerSecond = sessions.Sum(s => s.TotalSpeedBytesPerSecond)
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting download stats");
            return Problem("An error occurred while retrieving download statistics");
        }
    }

    /// <summary>
    /// Gets available download folders organized by compatibility.
    /// </summary>
    /// <returns>List of download folders and their contents</returns>
    /// <response code="200">Folders retrieved successfully</response>
    [HttpGet("folders")]
    [ProducesResponseType(typeof(List<DownloadFolder>), 200)]
    public ActionResult<List<DownloadFolder>> GetDownloadFolders()
    {
        try
        {
            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "Downloads");
            var folders = new List<DownloadFolder>();

            if (Directory.Exists(basePath))
            {
                var compatibilityFolders = new[] { "2020", "2024", "2020-2024", "Other" };
                
                foreach (var folder in compatibilityFolders)
                {
                    var folderPath = Path.Combine(basePath, folder);
                    if (Directory.Exists(folderPath))
                    {
                        var files = Directory.GetFiles(folderPath)
                            .Select(f => new DownloadedFile
                            {
                                FileName = Path.GetFileName(f),
                                FilePath = f,
                                FileSize = new FileInfo(f).Length,
                                CreatedAt = System.IO.File.GetCreationTime(f)
                            })
                            .OrderByDescending(f => f.CreatedAt)
                            .ToList();

                        folders.Add(new DownloadFolder
                        {
                            Name = folder,
                            Path = folderPath,
                            FileCount = files.Count(),
                            TotalSize = files.Sum(f => f.FileSize),
                            Files = files
                        });
                    }
                }
            }

            return Ok(folders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting download folders");
            return Problem("An error occurred while retrieving download folders");
        }
    }
}

/// <summary>
/// Download statistics model.
/// </summary>
public class DownloadStats
{
    /// <summary>
    /// Number of active download sessions.
    /// </summary>
    public int ActiveSessions { get; set; }

    /// <summary>
    /// Total number of download sessions.
    /// </summary>
    public int TotalSessions { get; set; }

    /// <summary>
    /// Total number of downloads across all sessions.
    /// </summary>
    public int TotalDownloads { get; set; }

    /// <summary>
    /// Number of completed downloads.
    /// </summary>
    public int CompletedDownloads { get; set; }

    /// <summary>
    /// Number of failed downloads.
    /// </summary>
    public int FailedDownloads { get; set; }

    /// <summary>
    /// Number of currently active downloads.
    /// </summary>
    public int ActiveDownloads { get; set; }

    /// <summary>
    /// Combined download speed across all active downloads.
    /// </summary>
    public long TotalSpeedBytesPerSecond { get; set; }
}

/// <summary>
/// Download folder information.
/// </summary>
public class DownloadFolder
{
    /// <summary>
    /// Folder name (compatibility).
    /// </summary>
    public string Name { get; set; } = "";

    /// <summary>
    /// Full folder path.
    /// </summary>
    public string Path { get; set; } = "";

    /// <summary>
    /// Number of files in folder.
    /// </summary>
    public int FileCount { get; set; }

    /// <summary>
    /// Total size of all files in bytes.
    /// </summary>
    public long TotalSize { get; set; }

    /// <summary>
    /// List of files in the folder.
    /// </summary>
    public List<DownloadedFile> Files { get; set; } = new();
}

/// <summary>
/// Downloaded file information.
/// </summary>
public class DownloadedFile
{
    /// <summary>
    /// File name.
    /// </summary>
    public string FileName { get; set; } = "";

    /// <summary>
    /// Full file path.
    /// </summary>
    public string FilePath { get; set; } = "";

    /// <summary>
    /// File size in bytes.
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// File creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
