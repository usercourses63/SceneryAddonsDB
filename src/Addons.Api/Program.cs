using Addons.Api.Extensions;
using Addons.Api.Services;
using Addons.Api.Hubs;
using MongoDB.Entities;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add CORS support for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add SignalR
builder.Services.AddSignalR();

// Add Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Scenery Addons API",
        Version = "v1",
        Description = "API for managing and browsing flight simulator scenery addons",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Scenery Addons API",
            Url = new Uri("https://github.com/sceneryaddons/api")
        }
    });

    // Include XML comments for better documentation
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Configure MongoDB and application services
builder.Services.AddMongoDb(builder.Configuration);
builder.Services.AddApplicationServices();

// Add new services
builder.Services.AddScoped<ReportService>();
builder.Services.AddSingleton<MongoDbDockerService>();

// Add download services
builder.Services.AddHttpClient<DownloadableAddonScraperService>();
builder.Services.AddSingleton<TorrentDownloadService>();
builder.Services.AddSingleton<DownloadableAddonScraperService>();
builder.Services.AddSingleton<DownloadManagerService>();

// Add SignalR notification service
builder.Services.AddScoped<ISignalRNotificationService, SignalRNotificationService>();

var app = builder.Build();

// Ensure MongoDB is available (Docker container or existing instance)
var mongoDockerService = app.Services.GetRequiredService<MongoDbDockerService>();
var mongoReady = await mongoDockerService.EnsureMongoDbRunningAsync();

// Initialize MongoDB.Entities regardless of Docker status (might be running natively)
var databaseName = builder.Configuration.GetValue<string>("Mongo:DatabaseName") ?? "sceneryaddons";
var host = "localhost";
var port = 27017;

try
{
    await MongoDB.Entities.DB.InitAsync(databaseName, host, port);

    // Create indexes
    await MongoDB.Entities.DB.Index<Addons.Api.Models.Addon>()
        .Key(x => x.FileName, MongoDB.Entities.KeyType.Ascending)
        .Option(o => o.Unique = true)
        .CreateAsync();

    app.Logger.LogInformation("MongoDB.Entities initialized successfully");

    // Display initial status report
    try
    {
        using var scope = app.Services.CreateScope();
        var reportService = scope.ServiceProvider.GetRequiredService<ReportService>();
        var initialReport = await reportService.GenerateStatusReportAsync();
        reportService.DisplayReportToConsole(initialReport);
    }
    catch (Exception reportEx)
    {
        app.Logger.LogWarning(reportEx, "Failed to generate initial status report");
    }
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Failed to initialize MongoDB.Entities. Please ensure MongoDB is running on localhost:27017");
    app.Logger.LogInformation("Application will continue but database features will not work.");
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Scenery Addons API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Scenery Addons API Documentation";
    });
}

// Enable CORS
app.UseCors("AllowFrontend");

app.UseRouting();
app.MapControllers();

// Map SignalR hub
app.MapHub<DownloadProgressHub>("/downloadProgressHub");

// Add a redirect from root to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger"))
    .WithName("Root")
    .WithSummary("Redirect to API documentation");

app.Run();

// Make Program class accessible for testing
public partial class Program { }
