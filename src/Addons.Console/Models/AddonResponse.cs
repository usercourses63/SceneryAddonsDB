namespace Addons.Console.Models;

/// <summary>
/// Individual addon information scraped from sceneryaddons.org.
/// </summary>
public class AddonInfo
{
    public string FileName { get; set; } = "";
    public string Name { get; set; } = "";
    public string Compatibility { get; set; } = "";
    public DateTime DateAdded { get; set; }
    public string DaysAgo { get; set; } = "";
    public string DownloadUrl { get; set; } = "";
    public long FileSizeBytes { get; set; }
    public string FileSizeFormatted { get; set; } = "";
}

/// <summary>
/// Download progress information.
/// </summary>
public class DownloadProgress
{
    public string FileName { get; set; } = "";
    public long TotalBytes { get; set; }
    public long DownloadedBytes { get; set; }
    public double ProgressPercentage => TotalBytes > 0 ? (double)DownloadedBytes / TotalBytes * 100 : 0;
    public TimeSpan ElapsedTime { get; set; }
    public double SpeedBytesPerSecond { get; set; }
    public string SpeedFormatted => FormatBytes((long)SpeedBytesPerSecond) + "/s";

    public static string FormatBytes(long bytes)
    {
        string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
        int counter = 0;
        decimal number = bytes;
        while (Math.Round(number / 1024) >= 1)
        {
            number /= 1024;
            counter++;
        }
        return $"{number:n1} {suffixes[counter]}";
    }
}
