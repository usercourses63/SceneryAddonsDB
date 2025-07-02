using Addons.Console.Models;

namespace Addons.Console.Services;

/// <summary>
/// Service for displaying addon information in the console.
/// </summary>
public static class ConsoleDisplay
{
    /// <summary>
    /// Displays the application header.
    /// </summary>
    public static void ShowHeader()
    {
        System.Console.Clear();
        System.Console.ForegroundColor = ConsoleColor.Cyan;
        System.Console.WriteLine("🎮 Scenery Addons Database - Latest Addons Downloader");
        System.Console.WriteLine(new string('=', 60));
        System.Console.ResetColor();
        System.Console.WriteLine();
    }

    /// <summary>
    /// Displays a list of addons in a formatted table.
    /// </summary>
    /// <param name="addons">List of addons to display</param>
    public static void ShowAddons(List<AddonInfo> addons)
    {
        if (!addons.Any())
        {
            System.Console.ForegroundColor = ConsoleColor.Yellow;
            System.Console.WriteLine("⚠️  No addons found");
            System.Console.ResetColor();
            return;
        }

        System.Console.ForegroundColor = ConsoleColor.Green;
        System.Console.WriteLine($"📋 Latest {addons.Count} Scenery Addons:");
        System.Console.ResetColor();
        System.Console.WriteLine(new string('=', 120));

        // Table headers
        System.Console.ForegroundColor = ConsoleColor.Yellow;
        System.Console.WriteLine($"{"#",-3} {"FILE NAME",-40} {"ADDON NAME",-45} {"COMPATIBILITY",-15} {"DATE ADDED",-12}");
        System.Console.ResetColor();
        System.Console.WriteLine(new string('-', 120));

        // Table rows
        for (int i = 0; i < addons.Count; i++)
        {
            var addon = addons[i];
            var fileName = TruncateString(addon.FileName, 38);
            var name = TruncateString(addon.Name, 43);
            var compatibility = addon.Compatibility;
            var dateAdded = addon.DateAdded.ToString("yyyy-MM-dd");

            // Color code by compatibility
            var color = GetCompatibilityColor(compatibility);
            System.Console.ForegroundColor = color;

            System.Console.WriteLine($"{i + 1,-3} {fileName,-40} {name,-45} {compatibility,-15} {dateAdded,-12}");
        }

        System.Console.ResetColor();
        System.Console.WriteLine(new string('=', 120));
        System.Console.WriteLine();
    }

    /// <summary>
    /// Displays addon details for a specific addon.
    /// </summary>
    /// <param name="addon">Addon to display details for</param>
    /// <param name="index">Index number for display</param>
    public static void ShowAddonDetails(AddonInfo addon, int index)
    {
        System.Console.ForegroundColor = ConsoleColor.Cyan;
        System.Console.WriteLine($"📦 Addon #{index + 1} Details:");
        System.Console.ResetColor();
        System.Console.WriteLine(new string('-', 50));

        System.Console.Write("📁 File Name: ");
        System.Console.ForegroundColor = ConsoleColor.White;
        System.Console.WriteLine(addon.FileName);
        System.Console.ResetColor();

        System.Console.Write("🏷️  Name: ");
        System.Console.ForegroundColor = ConsoleColor.White;
        System.Console.WriteLine(addon.Name);
        System.Console.ResetColor();

        System.Console.Write("🎯 Compatibility: ");
        System.Console.ForegroundColor = GetCompatibilityColor(addon.Compatibility);
        System.Console.WriteLine(addon.Compatibility);
        System.Console.ResetColor();

        System.Console.Write("📅 Date Added: ");
        System.Console.ForegroundColor = ConsoleColor.White;
        System.Console.WriteLine($"{addon.DateAdded:yyyy-MM-dd HH:mm:ss} ({addon.DaysAgo})");
        System.Console.ResetColor();

        if (!string.IsNullOrEmpty(addon.DownloadUrl))
        {
            System.Console.Write("🔗 Download URL: ");
            System.Console.ForegroundColor = ConsoleColor.Blue;
            System.Console.WriteLine(addon.DownloadUrl);
            System.Console.ResetColor();
        }

        if (!string.IsNullOrEmpty(addon.FileSizeFormatted))
        {
            System.Console.Write("📦 File Size: ");
            System.Console.ForegroundColor = ConsoleColor.White;
            System.Console.WriteLine(addon.FileSizeFormatted);
            System.Console.ResetColor();
        }

        System.Console.WriteLine();
    }

    /// <summary>
    /// Shows a loading animation.
    /// </summary>
    /// <param name="message">Message to display</param>
    public static void ShowLoading(string message)
    {
        System.Console.Write($"{message} ");
        for (int i = 0; i < 3; i++)
        {
            System.Console.Write(".");
            Thread.Sleep(500);
        }
        System.Console.WriteLine();
    }

    /// <summary>
    /// Shows an error message.
    /// </summary>
    /// <param name="message">Error message</param>
    public static void ShowError(string message)
    {
        System.Console.ForegroundColor = ConsoleColor.Red;
        System.Console.WriteLine($"❌ {message}");
        System.Console.ResetColor();
    }

    /// <summary>
    /// Shows a success message.
    /// </summary>
    /// <param name="message">Success message</param>
    public static void ShowSuccess(string message)
    {
        System.Console.ForegroundColor = ConsoleColor.Green;
        System.Console.WriteLine($"✅ {message}");
        System.Console.ResetColor();
    }

    /// <summary>
    /// Shows an info message.
    /// </summary>
    /// <param name="message">Info message</param>
    public static void ShowInfo(string message)
    {
        System.Console.ForegroundColor = ConsoleColor.Cyan;
        System.Console.WriteLine($"ℹ️  {message}");
        System.Console.ResetColor();
    }

    /// <summary>
    /// Prompts user to press any key to continue.
    /// </summary>
    public static void PressAnyKey()
    {
        System.Console.WriteLine();
        System.Console.ForegroundColor = ConsoleColor.Gray;
        System.Console.WriteLine("Press any key to continue...");
        System.Console.ResetColor();
        System.Console.ReadKey(true);
    }

    /// <summary>
    /// Gets the appropriate color for a compatibility string.
    /// </summary>
    /// <param name="compatibility">Compatibility string</param>
    /// <returns>Console color</returns>
    private static ConsoleColor GetCompatibilityColor(string compatibility)
    {
        return compatibility switch
        {
            "MSFS 2024" => ConsoleColor.Green,
            "MSFS 2020/2024" => ConsoleColor.Cyan,
            "MSFS 2020" => ConsoleColor.Yellow,
            _ => ConsoleColor.White
        };
    }

    /// <summary>
    /// Truncates a string to the specified length.
    /// </summary>
    /// <param name="input">Input string</param>
    /// <param name="maxLength">Maximum length</param>
    /// <returns>Truncated string</returns>
    private static string TruncateString(string input, int maxLength)
    {
        if (string.IsNullOrEmpty(input) || input.Length <= maxLength)
            return input ?? "";

        return input.Substring(0, maxLength - 3) + "...";
    }
}
