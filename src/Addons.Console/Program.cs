using Addons.Console.Services;

namespace Addons.Console;

/// <summary>
/// Main program for the Scenery Addons Console application.
/// </summary>
class Program
{
    static async Task Main(string[] args)
    {
        ConsoleDisplay.ShowHeader();

        // Parse command line arguments
        var options = ParseArguments(args);

        // Create downloader with specified download folder
        using var downloader = new AddonDownloader(options.DownloadFolder);

        try
        {
            // Check website availability
            ConsoleDisplay.ShowInfo("Checking sceneryaddons.org availability...");

            var isHealthy = await downloader.CheckWebsiteHealthAsync();
            if (!isHealthy)
            {
                ConsoleDisplay.ShowError("sceneryaddons.org is not accessible");
                ConsoleDisplay.ShowInfo("Please check your internet connection and try again.");
                ConsoleDisplay.PressAnyKey();
                return;
            }

            ConsoleDisplay.ShowSuccess("Connected to sceneryaddons.org");

            // Scrape latest addons
            var latestAddons = await downloader.GetLatestAddonsAsync(options.Count);
            await ProcessAddons(latestAddons, options, downloader);
        }
        catch (Exception ex)
        {
            ConsoleDisplay.ShowError($"Unexpected error: {ex.Message}");
            ConsoleDisplay.PressAnyKey();
        }
    }

    /// <summary>
    /// Processes and displays the scraped addons, with option to download.
    /// </summary>
    /// <param name="addons">List of addons</param>
    /// <param name="options">Application options</param>
    /// <param name="downloader">Downloader service</param>
    private static async Task ProcessAddons(List<Addons.Console.Models.AddonInfo> addons, AppOptions options, AddonDownloader downloader)
    {
        if (!addons.Any())
        {
            ConsoleDisplay.ShowError("No addons were scraped from the website");
            ConsoleDisplay.PressAnyKey();
            return;
        }

        // Display addons in table format
        ConsoleDisplay.ShowAddons(addons);

        if (options.ShowDetails)
        {
            // Show detailed view for each addon
            ConsoleDisplay.ShowInfo("Detailed view:");
            System.Console.WriteLine();

            for (int i = 0; i < addons.Count; i++)
            {
                ConsoleDisplay.ShowAddonDetails(addons[i], i);

                // Pause between addons (except for the last one)
                if (i < addons.Count - 1)
                {
                    System.Console.WriteLine("Press any key for next addon...");
                    System.Console.ReadKey(true);
                    System.Console.WriteLine();
                }
            }
        }

        // Show compatibility summary
        var compatibilityGroups = addons.GroupBy(a => a.Compatibility).ToList();
        if (compatibilityGroups.Any())
        {
            ConsoleDisplay.ShowInfo("Compatibility breakdown:");
            foreach (var group in compatibilityGroups.OrderByDescending(g => g.Count()))
            {
                System.Console.WriteLine($"  • {group.Key}: {group.Count()} addon(s)");
            }
            System.Console.WriteLine();
        }

        // Ask user if they want to download the files
        if (options.AutoDownload || PromptForDownload())
        {
            ConsoleDisplay.ShowInfo("📋 Download Information:");
            ConsoleDisplay.ShowInfo("• SceneryAddons.org uses external file hosts (ModsFire, Rapidgator, etc.)");
            ConsoleDisplay.ShowInfo("• Some downloads may require manual interaction with file host pages");
            ConsoleDisplay.ShowInfo("• Direct downloads work best with ModsFire and Torrent links");
            System.Console.WriteLine();

            var successCount = await downloader.DownloadAddonsAsync(addons);

            System.Console.WriteLine();
            if (successCount == addons.Count)
            {
                ConsoleDisplay.ShowSuccess($"✅ All {successCount} addon(s) downloaded successfully!");
            }
            else if (successCount > 0)
            {
                ConsoleDisplay.ShowSuccess($"✅ {successCount} out of {addons.Count} addon(s) downloaded successfully");
            }
            else
            {
                ConsoleDisplay.ShowError("❌ No addons were downloaded successfully");
            }

            ConsoleDisplay.ShowInfo($"📁 Files saved to: {Path.GetFullPath(options.DownloadFolder)}");
        }
        else
        {
            ConsoleDisplay.ShowInfo($"ℹ️  Scraped {addons.Count} addon(s) - no files downloaded");
        }

        ConsoleDisplay.PressAnyKey();
    }

    /// <summary>
    /// Prompts the user whether to download the files.
    /// </summary>
    /// <returns>True if user wants to download</returns>
    private static bool PromptForDownload()
    {
        System.Console.WriteLine();
        System.Console.ForegroundColor = ConsoleColor.Yellow;
        System.Console.Write("📥 Do you want to download these addon files? (y/N): ");
        System.Console.ResetColor();

        var response = System.Console.ReadLine()?.Trim().ToLower();
        return response == "y" || response == "yes";
    }

    /// <summary>
    /// Parses command line arguments.
    /// </summary>
    /// <param name="args">Command line arguments</param>
    /// <returns>Parsed options</returns>
    private static AppOptions ParseArguments(string[] args)
    {
        var options = new AppOptions();

        for (int i = 0; i < args.Length; i++)
        {
            switch (args[i].ToLower())
            {
                case "--count":
                case "-c":
                    if (i + 1 < args.Length && int.TryParse(args[i + 1], out int count))
                    {
                        options.Count = Math.Max(1, Math.Min(50, count)); // Limit between 1-50
                        i++; // Skip next argument
                    }
                    break;

                case "--folder":
                case "-f":
                    if (i + 1 < args.Length)
                    {
                        options.DownloadFolder = args[i + 1];
                        i++; // Skip next argument
                    }
                    break;

                case "--details":
                case "-d":
                    options.ShowDetails = true;
                    break;

                case "--auto":
                case "-a":
                    options.AutoDownload = true;
                    break;

                case "--help":
                case "-h":
                    ShowHelp();
                    Environment.Exit(0);
                    break;
            }
        }

        return options;
    }

    /// <summary>
    /// Shows help information.
    /// </summary>
    private static void ShowHelp()
    {
        ConsoleDisplay.ShowHeader();
        System.Console.WriteLine("Usage: Addons.Console [options]");
        System.Console.WriteLine();
        System.Console.WriteLine("This tool scrapes sceneryaddons.org and downloads the latest addon files.");
        System.Console.WriteLine();
        System.Console.WriteLine("Options:");
        System.Console.WriteLine("  -c, --count <number>    Number of addons to retrieve (1-50, default: 5)");
        System.Console.WriteLine("  -f, --folder <path>     Download folder (default: Downloads)");
        System.Console.WriteLine("  -d, --details           Show detailed view for each addon");
        System.Console.WriteLine("  -a, --auto              Auto-download without prompting");
        System.Console.WriteLine("  -h, --help              Show this help message");
        System.Console.WriteLine();
        System.Console.WriteLine("Examples:");
        System.Console.WriteLine("  Addons.Console                           # Scrape 5 latest addons");
        System.Console.WriteLine("  Addons.Console -c 10                     # Scrape 10 latest addons");
        System.Console.WriteLine("  Addons.Console -c 3 -d                   # Scrape 3 addons with details");
        System.Console.WriteLine("  Addons.Console -f MyAddons -a            # Auto-download to MyAddons folder");
        System.Console.WriteLine("  Addons.Console -c 10 -f C:\\Addons -a     # Download 10 addons to C:\\Addons");
        System.Console.WriteLine();
        System.Console.WriteLine("Note: Files are downloaded from sceneryaddons.org directly.");
        System.Console.WriteLine();
    }

    /// <summary>
    /// Application options.
    /// </summary>
    private class AppOptions
    {
        public int Count { get; set; } = 5;
        public string DownloadFolder { get; set; } = "Downloads";
        public bool ShowDetails { get; set; } = false;
        public bool AutoDownload { get; set; } = false;
    }
}
