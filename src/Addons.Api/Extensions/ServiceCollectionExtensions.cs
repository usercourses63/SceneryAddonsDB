using Addons.Api.Models;
using Addons.Api.Services;
using Addons.Api.BackgroundJobs;

namespace Addons.Api.Extensions;

/// <summary>
/// Extension methods for configuring services in the DI container.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Configures MongoDB using MongoDB.Entities.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddMongoDb(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetValue<string>("Mongo:ConnectionString") ?? "mongodb://localhost:27017";
        var databaseName = configuration.GetValue<string>("Mongo:DatabaseName") ?? "sceneryaddons";

        // Initialize MongoDB.Entities
        services.AddSingleton<IHostedService>(serviceProvider =>
        {
            return new MongoDbInitializationService(connectionString, databaseName);
        });

        return services;
    }

    /// <summary>
    /// Configures application services including scraper and background jobs.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpClient<ScraperService>(client =>
        {
            client.DefaultRequestHeaders.Add("User-Agent", "AddonCompatibilityBot/1.0");
            client.Timeout = TimeSpan.FromMinutes(5);
        });

        services.AddScoped<ScraperService>();
        services.AddScoped<AddonUpdaterService>();
        services.AddScoped<AddonsListingService>();
        services.AddScoped<ReportService>();
        services.AddSingleton<MongoDbDockerService>();
        services.AddScoped<ScrapeWorker>();
        services.AddHostedService<ScrapeWorker>();

        return services;
    }


}
