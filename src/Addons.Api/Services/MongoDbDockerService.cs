using System.Diagnostics;
using System.Text.Json;

namespace Addons.Api.Services;

/// <summary>
/// Service for managing MongoDB Docker container.
/// </summary>
public class MongoDbDockerService
{
    private readonly ILogger<MongoDbDockerService> _logger;
    private const string ContainerName = "scenery-addons-mongodb";
    private const string ImageName = "mongo:7.0";
    private const string DataVolume = "scenery-addons-mongodb-data";

    public MongoDbDockerService(ILogger<MongoDbDockerService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Ensures MongoDB is available (either via Docker container or existing instance).
    /// </summary>
    public async Task<bool> EnsureMongoDbRunningAsync()
    {
        try
        {
            // First check if MongoDB is already accessible on port 27017
            if (await IsMongoDbAccessibleAsync())
            {
                _logger.LogInformation("MongoDB is already accessible on port 27017");
                return true;
            }

            // Check if Docker is available
            if (!await IsDockerAvailableAsync())
            {
                _logger.LogWarning("Docker is not available and MongoDB is not accessible. Please ensure MongoDB is running or Docker Desktop is installed.");
                return false;
            }

            // Check if container exists and is running
            var containerStatus = await GetContainerStatusAsync();

            switch (containerStatus)
            {
                case ContainerStatus.Running:
                    _logger.LogInformation("MongoDB container is already running");
                    return true;

                case ContainerStatus.Stopped:
                    _logger.LogInformation("MongoDB container exists but is stopped. Starting...");
                    return await StartContainerAsync();

                case ContainerStatus.NotFound:
                    _logger.LogInformation("MongoDB container not found. Creating and starting...");
                    return await CreateAndStartContainerAsync();

                default:
                    _logger.LogWarning("Unknown container status");
                    return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ensuring MongoDB is running");
            return false;
        }
    }

    /// <summary>
    /// Checks if MongoDB is accessible on the default port.
    /// </summary>
    private async Task<bool> IsMongoDbAccessibleAsync()
    {
        try
        {
            using var client = new System.Net.Sockets.TcpClient();
            await client.ConnectAsync("localhost", 27017);
            return client.Connected;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Checks if Docker is available on the system.
    /// </summary>
    private async Task<bool> IsDockerAvailableAsync()
    {
        try
        {
            var result = await RunDockerCommandAsync("--version");
            return result.Success;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Gets the status of the MongoDB container.
    /// </summary>
    private async Task<ContainerStatus> GetContainerStatusAsync()
    {
        try
        {
            var result = await RunDockerCommandAsync($"ps -a --filter name={ContainerName} --format json");
            
            if (!result.Success || string.IsNullOrWhiteSpace(result.Output))
            {
                return ContainerStatus.NotFound;
            }

            // Parse Docker output (each line is a JSON object)
            var lines = result.Output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            foreach (var line in lines)
            {
                try
                {
                    var container = JsonSerializer.Deserialize<DockerContainer>(line);
                    if (container?.Names?.Contains(ContainerName) == true)
                    {
                        return container.State?.ToLower() == "running" 
                            ? ContainerStatus.Running 
                            : ContainerStatus.Stopped;
                    }
                }
                catch (JsonException)
                {
                    // Skip invalid JSON lines
                    continue;
                }
            }

            return ContainerStatus.NotFound;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking container status");
            return ContainerStatus.NotFound;
        }
    }

    /// <summary>
    /// Creates and starts the MongoDB container.
    /// </summary>
    private async Task<bool> CreateAndStartContainerAsync()
    {
        try
        {
            // Create volume if it doesn't exist
            await RunDockerCommandAsync($"volume create {DataVolume}");

            // Run MongoDB container with persistent volume
            var command = $"run -d " +
                         $"--name {ContainerName} " +
                         $"-p 27017:27017 " +
                         $"-v {DataVolume}:/data/db " +
                         $"-e MONGO_INITDB_ROOT_USERNAME=admin " +
                         $"-e MONGO_INITDB_ROOT_PASSWORD=password " +
                         $"--restart unless-stopped " +
                         ImageName;

            var result = await RunDockerCommandAsync(command);

            if (result.Success)
            {
                _logger.LogInformation("MongoDB container created and started successfully");

                // Wait a moment for the container to fully start
                await Task.Delay(3000);
                return true;
            }
            else
            {
                // Check if the error is due to port already in use
                if (result.Error.Contains("port is already allocated") || result.Error.Contains("address already in use"))
                {
                    _logger.LogInformation("Port 27017 is already in use. Checking if MongoDB is accessible...");
                    return await IsMongoDbAccessibleAsync();
                }

                _logger.LogError("Failed to create MongoDB container: {Error}", result.Error);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating MongoDB container");
            return false;
        }
    }

    /// <summary>
    /// Starts an existing MongoDB container.
    /// </summary>
    private async Task<bool> StartContainerAsync()
    {
        try
        {
            var result = await RunDockerCommandAsync($"start {ContainerName}");
            
            if (result.Success)
            {
                _logger.LogInformation("MongoDB container started successfully");
                await Task.Delay(2000); // Wait for startup
                return true;
            }
            else
            {
                _logger.LogError("Failed to start MongoDB container: {Error}", result.Error);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting MongoDB container");
            return false;
        }
    }

    /// <summary>
    /// Runs a Docker command and returns the result.
    /// </summary>
    private async Task<DockerCommandResult> RunDockerCommandAsync(string arguments)
    {
        try
        {
            using var process = new Process();
            process.StartInfo = new ProcessStartInfo
            {
                FileName = "docker",
                Arguments = arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            process.Start();
            
            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();
            
            await process.WaitForExitAsync();
            
            var output = await outputTask;
            var error = await errorTask;

            return new DockerCommandResult
            {
                Success = process.ExitCode == 0,
                Output = output.Trim(),
                Error = error.Trim(),
                ExitCode = process.ExitCode
            };
        }
        catch (Exception ex)
        {
            return new DockerCommandResult
            {
                Success = false,
                Output = "",
                Error = ex.Message,
                ExitCode = -1
            };
        }
    }

    private enum ContainerStatus
    {
        NotFound,
        Stopped,
        Running
    }

    private class DockerCommandResult
    {
        public bool Success { get; set; }
        public string Output { get; set; } = "";
        public string Error { get; set; } = "";
        public int ExitCode { get; set; }
    }

    private class DockerContainer
    {
        public string? Names { get; set; }
        public string? State { get; set; }
    }
}
