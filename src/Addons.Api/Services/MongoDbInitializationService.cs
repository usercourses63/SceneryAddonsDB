using MongoDB.Entities;

namespace Addons.Api.Services;

/// <summary>
/// Service to initialize MongoDB.Entities connection.
/// </summary>
public class MongoDbInitializationService : IHostedService
{
    private readonly string _connectionString;
    private readonly string _databaseName;

    public MongoDbInitializationService(string connectionString, string databaseName)
    {
        _connectionString = connectionString;
        _databaseName = databaseName;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Initialize MongoDB.Entities
            await DB.InitAsync(_databaseName, _connectionString);

            // Create indexes
            await CreateIndexesAsync();
        }
        catch (Exception)
        {
            // Log error but don't fail startup
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    private async Task CreateIndexesAsync()
    {
        try
        {
            // Create unique index on FileName
            await DB.Index<Models.Addon>()
                .Key(x => x.FileName, KeyType.Ascending)
                .Option(o => o.Unique = true)
                .CreateAsync();

            // Create index on Compatibility for filtering
            await DB.Index<Models.Addon>()
                .Key(x => x.Compatibility, KeyType.Ascending)
                .CreateAsync();

            // Create index on DateAdded for sorting
            await DB.Index<Models.Addon>()
                .Key(x => x.DateAdded, KeyType.Descending)
                .CreateAsync();
        }
        catch (Exception)
        {
            // Ignore index creation errors
        }
    }
}
