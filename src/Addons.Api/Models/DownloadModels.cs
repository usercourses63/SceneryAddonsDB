using System.ComponentModel.DataAnnotations;

namespace Addons.Api.Models;

/// <summary>
/// Request model for starting downloads.
/// </summary>
public class DownloadRequest
{
    /// <summary>
    /// Number of latest addons to download (1-50).
    /// </summary>
    [Range(1, 50)]
    public int Count { get; set; } = 5;

    /// <summary>
    /// Maximum concurrent downloads (1-10).
    /// </summary>
    [Range(1, 10)]
    public int MaxConcurrency { get; set; } = 3;

    /// <summary>
    /// Filter by compatibility (optional).
    /// </summary>
    public string? Compatibility { get; set; }

    /// <summary>
    /// Whether to force re-download existing files.
    /// </summary>
    public bool ForceRedownload { get; set; } = false;
}

/// <summary>
/// Response model for download operations.
/// </summary>
public class DownloadResponse
{
    /// <summary>
    /// Unique download session ID.
    /// </summary>
    public string SessionId { get; set; } = "";

    /// <summary>
    /// Number of addons queued for download.
    /// </summary>
    public int QueuedCount { get; set; }

    /// <summary>
    /// List of addons in the download queue.
    /// </summary>
    public List<DownloadItem> Items { get; set; } = new();

    /// <summary>
    /// Timestamp when download session started.
    /// </summary>
    public DateTime StartedAt { get; set; }
}

/// <summary>
/// Individual download item information.
/// </summary>
public class DownloadItem
{
    /// <summary>
    /// Unique item ID.
    /// </summary>
    public string Id { get; set; } = "";

    /// <summary>
    /// Addon file name.
    /// </summary>
    public string FileName { get; set; } = "";

    /// <summary>
    /// Addon display name.
    /// </summary>
    public string Name { get; set; } = "";

    /// <summary>
    /// Compatibility (MSFS 2020, MSFS 2024, MSFS 2020/2024).
    /// </summary>
    public string Compatibility { get; set; } = "";

    /// <summary>
    /// Download URL (magnet link).
    /// </summary>
    public string DownloadUrl { get; set; } = "";

    /// <summary>
    /// Current download status.
    /// </summary>
    public DownloadStatus Status { get; set; } = DownloadStatus.Queued;

    /// <summary>
    /// Download progress percentage (0-100).
    /// </summary>
    public double Progress { get; set; }

    /// <summary>
    /// Download speed in bytes per second.
    /// </summary>
    public long SpeedBytesPerSecond { get; set; }

    /// <summary>
    /// Total file size in bytes.
    /// </summary>
    public long TotalBytes { get; set; }

    /// <summary>
    /// Downloaded bytes.
    /// </summary>
    public long DownloadedBytes { get; set; }

    /// <summary>
    /// Error message if download failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Timestamp when download started.
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// Timestamp when download completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Local file path where addon is saved.
    /// </summary>
    public string? LocalPath { get; set; }
}

/// <summary>
/// Download status enumeration.
/// </summary>
public enum DownloadStatus
{
    /// <summary>
    /// Waiting in queue.
    /// </summary>
    Queued,

    /// <summary>
    /// Currently downloading.
    /// </summary>
    Downloading,

    /// <summary>
    /// Download completed successfully.
    /// </summary>
    Completed,

    /// <summary>
    /// Download failed.
    /// </summary>
    Failed,

    /// <summary>
    /// Download was cancelled.
    /// </summary>
    Cancelled,

    /// <summary>
    /// File already exists (skipped).
    /// </summary>
    Skipped
}

/// <summary>
/// Download session status response.
/// </summary>
public class DownloadStatusResponse
{
    /// <summary>
    /// Session ID.
    /// </summary>
    public string SessionId { get; set; } = "";

    /// <summary>
    /// Overall session status.
    /// </summary>
    public SessionStatus Status { get; set; }

    /// <summary>
    /// Total number of items in session.
    /// </summary>
    public int TotalItems { get; set; }

    /// <summary>
    /// Number of completed downloads.
    /// </summary>
    public int CompletedItems { get; set; }

    /// <summary>
    /// Number of failed downloads.
    /// </summary>
    public int FailedItems { get; set; }

    /// <summary>
    /// Number of currently downloading items.
    /// </summary>
    public int ActiveDownloads { get; set; }

    /// <summary>
    /// Overall progress percentage.
    /// </summary>
    public double OverallProgress { get; set; }

    /// <summary>
    /// Combined download speed.
    /// </summary>
    public long TotalSpeedBytesPerSecond { get; set; }

    /// <summary>
    /// List of all download items.
    /// </summary>
    public List<DownloadItem> Items { get; set; } = new();

    /// <summary>
    /// Session start time.
    /// </summary>
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// Session completion time (if finished).
    /// </summary>
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Session status enumeration.
/// </summary>
public enum SessionStatus
{
    /// <summary>
    /// Session is active with downloads in progress.
    /// </summary>
    Active,

    /// <summary>
    /// All downloads completed successfully.
    /// </summary>
    Completed,

    /// <summary>
    /// Session completed with some failures.
    /// </summary>
    CompletedWithErrors,

    /// <summary>
    /// Session was cancelled.
    /// </summary>
    Cancelled
}

/// <summary>
/// Download configuration settings.
/// </summary>
public class DownloadSettings
{
    /// <summary>
    /// Base download directory.
    /// </summary>
    public string BaseDownloadPath { get; set; } = "Downloads";

    /// <summary>
    /// Maximum concurrent downloads globally.
    /// </summary>
    public int MaxGlobalConcurrency { get; set; } = 5;

    /// <summary>
    /// Download timeout in minutes.
    /// </summary>
    public int DownloadTimeoutMinutes { get; set; } = 30;

    /// <summary>
    /// Whether to organize files by compatibility.
    /// </summary>
    public bool OrganizeByCompatibility { get; set; } = true;

    /// <summary>
    /// Whether to skip existing files.
    /// </summary>
    public bool SkipExistingFiles { get; set; } = true;
}
