using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Hosting;
using System.Net;
using System.Text.Json;
using Testcontainers.MongoDb;
using MongoDB.Driver;
using Addons.Api.Models;
using Addons.Api.Services;
using Addons.Api.BackgroundJobs;

namespace Addons.Api.Tests;

/// <summary>
/// Integration tests for the API endpoints using test containers.
/// </summary>
public class ApiIntegrationTests : IAsyncLifetime
{
    private readonly MongoDbContainer _mongoContainer;
    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;

    public ApiIntegrationTests()
    {
        _mongoContainer = new MongoDbBuilder()
            .WithImage("mongo:latest")
            .WithPortBinding(27017, true)
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _mongoContainer.StartAsync();

        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");

                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["Mongo:ConnectionString"] = _mongoContainer.GetConnectionString(),
                        ["Mongo:DatabaseName"] = "testdb",
                        ["RefreshToken"] = "test-token-123"
                    });
                });

                // Configure services for testing
                builder.ConfigureServices(services =>
                {
                    // Remove the background service for testing but keep ScrapeWorker as scoped
                    var descriptors = services.Where(d => d.ServiceType == typeof(IHostedService)).ToList();
                    foreach (var descriptor in descriptors)
                    {
                        services.Remove(descriptor);
                    }

                    // Re-add ScrapeWorker as a scoped service for manual triggering in tests
                    services.AddScoped<ScrapeWorker>();
                });
            });

        _client = _factory.CreateClient();

        // Seed test data
        await SeedTestDataAsync();
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        if (_factory != null)
            await _factory.DisposeAsync();
        await _mongoContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetHealth_ReturnsHealthyStatus()
    {
        // Act
        var response = await _client.GetAsync("/api/health");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var healthResponse = JsonSerializer.Deserialize<HealthResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(healthResponse);
        Assert.Equal("Healthy", healthResponse.Status);
        Assert.True(healthResponse.Timestamp > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task GetCompatibility_WithValidFileName_ReturnsCompatibilityInfo()
    {
        // Act
        var response = await _client.GetAsync("/api/compatibility?fileName=test-addon-v1-0-0.rar");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var compatibilityResponse = JsonSerializer.Deserialize<CompatibilityResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(compatibilityResponse);
        Assert.Equal("test-addon-v1-0-0.rar", compatibilityResponse.FileName);
        Assert.Equal("MSFS 2020/2024", compatibilityResponse.Compatibility);
    }

    [Fact]
    public async Task GetCompatibility_WithInvalidFileName_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/compatibility?fileName=nonexistent-addon.rar");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetCompatibility_WithMissingFileName_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/compatibility");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetCompatibility_WithEmptyFileName_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/compatibility?fileName=");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetStats_ReturnsCorrectStatistics()
    {
        // Act
        var response = await _client.GetAsync("/api/stats");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var statsResponse = JsonSerializer.Deserialize<JsonElement>(content);

        Assert.True(statsResponse.TryGetProperty("totalAddons", out var totalAddons));
        Assert.Equal(2, totalAddons.GetInt64()); // We seeded 2 test addons
    }

    [Fact]
    public async Task PostRefresh_WithValidToken_ReturnsSuccess()
    {
        // Arrange
        _client.DefaultRequestHeaders.Add("X-Refresh-Token", "test-token-123");

        // Act
        var response = await _client.PostAsync("/api/refresh", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var refreshResponse = JsonSerializer.Deserialize<JsonElement>(content);

        Assert.True(refreshResponse.TryGetProperty("message", out var message));
        Assert.Contains("completed successfully", message.GetString());
    }

    [Fact]
    public async Task PostRefresh_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        _client.DefaultRequestHeaders.Add("X-Refresh-Token", "invalid-token");

        // Act
        var response = await _client.PostAsync("/api/refresh", null);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PostRefresh_WithoutToken_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.PostAsync("/api/refresh", null);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Seeds test data into the MongoDB container.
    /// </summary>
    private async Task SeedTestDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var collection = scope.ServiceProvider.GetRequiredService<IMongoCollection<Addon>>();

        // Create the unique index for testing
        try
        {
            var indexKeysDefinition = Builders<Addon>.IndexKeys.Ascending(x => x.FileName);
            var indexOptions = new CreateIndexOptions { Unique = true };
            var indexModel = new CreateIndexModel<Addon>(indexKeysDefinition, indexOptions);
            await collection.Indexes.CreateOneAsync(indexModel);
        }
        catch (MongoCommandException ex) when (ex.CodeName == "IndexOptionsConflict")
        {
            // Index already exists, this is fine
        }

        var testAddons = new[]
        {
            new Addon
            {
                FileName = "test-addon-v1-0-0.rar",
                Name = "Test Addon v1.0.0",
                Compatibility = "MSFS 2020/2024",
                DateAdded = DateTime.UtcNow.AddDays(-1),
                LastUpdated = DateTime.UtcNow
            },
            new Addon
            {
                FileName = "another-addon-v2-1-0.rar",
                Name = "Another Test Addon v2.1.0",
                Compatibility = "MSFS 2024",
                DateAdded = DateTime.UtcNow.AddDays(-2),
                LastUpdated = DateTime.UtcNow
            }
        };

        await collection.InsertManyAsync(testAddons);
    }
}
