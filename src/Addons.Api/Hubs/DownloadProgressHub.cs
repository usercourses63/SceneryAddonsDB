using Microsoft.AspNetCore.SignalR;
using Addons.Api.Models;

namespace Addons.Api.Hubs;

/// <summary>
/// SignalR hub for real-time download progress updates
/// </summary>
public class DownloadProgressHub : Hub
{
    private readonly ILogger<DownloadProgressHub> _logger;

    public DownloadProgressHub(ILogger<DownloadProgressHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Allows clients to join a specific download session group
    /// </summary>
    public async Task JoinSessionGroup(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{sessionId}");
        _logger.LogDebug("Client {ConnectionId} joined session group: {SessionId}", Context.ConnectionId, sessionId);
    }

    /// <summary>
    /// Allows clients to leave a specific download session group
    /// </summary>
    public async Task LeaveSessionGroup(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session_{sessionId}");
        _logger.LogDebug("Client {ConnectionId} left session group: {SessionId}", Context.ConnectionId, sessionId);
    }

    /// <summary>
    /// Sends progress update to all clients in a session group
    /// </summary>
    public async Task SendProgressUpdate(string sessionId, DownloadStatusResponse progress)
    {
        await Clients.Group($"session_{sessionId}").SendAsync("ProgressUpdate", progress);
        _logger.LogDebug("Sent progress update for session: {SessionId}", sessionId);
    }

    /// <summary>
    /// Sends session completion notification to all clients in a session group
    /// </summary>
    public async Task SendSessionCompleted(string sessionId)
    {
        await Clients.Group($"session_{sessionId}").SendAsync("SessionCompleted", sessionId);
        _logger.LogInformation("Sent session completed notification for: {SessionId}", sessionId);
    }

    /// <summary>
    /// Sends session cancellation notification to all clients in a session group
    /// </summary>
    public async Task SendSessionCancelled(string sessionId)
    {
        await Clients.Group($"session_{sessionId}").SendAsync("SessionCancelled", sessionId);
        _logger.LogInformation("Sent session cancelled notification for: {SessionId}", sessionId);
    }

    /// <summary>
    /// Sends session failure notification to all clients in a session group
    /// </summary>
    public async Task SendSessionFailed(string sessionId, string errorMessage)
    {
        await Clients.Group($"session_{sessionId}").SendAsync("SessionFailed", sessionId, errorMessage);
        _logger.LogWarning("Sent session failed notification for: {SessionId}, Error: {Error}", sessionId, errorMessage);
    }

    /// <summary>
    /// Sends global notification to all connected clients
    /// </summary>
    public async Task SendGlobalNotification(object notification)
    {
        await Clients.All.SendAsync("GlobalNotification", notification);
        _logger.LogInformation("Sent global notification to all clients");
    }

    /// <summary>
    /// Sends statistics update to all connected clients
    /// </summary>
    public async Task SendStatsUpdate(object stats)
    {
        await Clients.All.SendAsync("StatsUpdate", stats);
        _logger.LogDebug("Sent stats update to all clients");
    }
}

/// <summary>
/// Service for sending SignalR notifications from other parts of the application
/// </summary>
public interface ISignalRNotificationService
{
    Task SendProgressUpdateAsync(string sessionId, DownloadStatusResponse progress);
    Task SendSessionCompletedAsync(string sessionId);
    Task SendSessionCancelledAsync(string sessionId);
    Task SendSessionFailedAsync(string sessionId, string errorMessage);
    Task SendGlobalNotificationAsync(object notification);
    Task SendStatsUpdateAsync(object stats);
}

/// <summary>
/// Implementation of SignalR notification service
/// </summary>
public class SignalRNotificationService : ISignalRNotificationService
{
    private readonly IHubContext<DownloadProgressHub> _hubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(IHubContext<DownloadProgressHub> hubContext, ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendProgressUpdateAsync(string sessionId, DownloadStatusResponse progress)
    {
        try
        {
            await _hubContext.Clients.Group($"session_{sessionId}").SendAsync("ProgressUpdate", progress);
            _logger.LogDebug("Sent progress update for session: {SessionId}", sessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending progress update for session: {SessionId}", sessionId);
        }
    }

    public async Task SendSessionCompletedAsync(string sessionId)
    {
        try
        {
            await _hubContext.Clients.Group($"session_{sessionId}").SendAsync("SessionCompleted", sessionId);
            _logger.LogInformation("Sent session completed notification for: {SessionId}", sessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session completed notification for: {SessionId}", sessionId);
        }
    }

    public async Task SendSessionCancelledAsync(string sessionId)
    {
        try
        {
            await _hubContext.Clients.Group($"session_{sessionId}").SendAsync("SessionCancelled", sessionId);
            _logger.LogInformation("Sent session cancelled notification for: {SessionId}", sessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session cancelled notification for: {SessionId}", sessionId);
        }
    }

    public async Task SendSessionFailedAsync(string sessionId, string errorMessage)
    {
        try
        {
            await _hubContext.Clients.Group($"session_{sessionId}").SendAsync("SessionFailed", sessionId, errorMessage);
            _logger.LogWarning("Sent session failed notification for: {SessionId}, Error: {Error}", sessionId, errorMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session failed notification for: {SessionId}", sessionId);
        }
    }

    public async Task SendGlobalNotificationAsync(object notification)
    {
        try
        {
            await _hubContext.Clients.All.SendAsync("GlobalNotification", notification);
            _logger.LogInformation("Sent global notification to all clients");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending global notification");
        }
    }

    public async Task SendStatsUpdateAsync(object stats)
    {
        try
        {
            await _hubContext.Clients.All.SendAsync("StatsUpdate", stats);
            _logger.LogDebug("Sent stats update to all clients");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending stats update");
        }
    }
}
