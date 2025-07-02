using MongoDB.Entities;
using MongoDB.Driver.Linq;
using Addons.Api.Models;
using System.Linq.Expressions;

namespace Addons.Api.Services;

/// <summary>
/// Service for listing and filtering addons.
/// </summary>
public class AddonsListingService
{
    private readonly ILogger<AddonsListingService> _logger;

    public AddonsListingService(ILogger<AddonsListingService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of addons with filtering and sorting.
    /// </summary>
    /// <param name="request">The request parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The paginated addon list response or table response based on format.</returns>
    public async Task<object> GetAddonsAsync(AddonsListRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate and sanitize request
            var sanitizedRequest = SanitizeRequest(request);

            // Execute query and get results
            var (addons, totalCount) = await ExecuteQueryAsync(sanitizedRequest);

            // Calculate pagination
            var pagination = CalculatePagination(sanitizedRequest, totalCount);

            // Get summary statistics
            var summaryStats = await GetSummaryStatsAsync(sanitizedRequest, cancellationToken);

            // Return based on format
            if (sanitizedRequest.Format.ToLower() == "table")
            {
                return new AddonsTableResponse
                {
                    Headers = new List<string> { "File Name", "Name", "Compatibility", "Date Added", "Days Ago" },
                    Rows = addons.Select(ConvertToTableRow).ToList(),
                    Pagination = pagination,
                    Summary = summaryStats
                };
            }
            else
            {
                // Convert to summary objects
                var addonSummaries = addons.Select(ConvertToSummary).ToList();

                return new AddonsListResponse
                {
                    Addons = addonSummaries,
                    Pagination = pagination,
                    Summary = summaryStats
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving addons list - returning sample data for demo");

            // Return sample data for demonstration when MongoDB is not available
            return CreateSampleResponse(request);
        }
    }

    private object CreateSampleResponse(AddonsListRequest request)
    {
        var sampleAddons = new List<Addon>
        {
            new Addon
            {
                FileName = "sample-addon-1.rar",
                Name = "Sample Scenery Addon - Beautiful Airport KJFK v2.1",
                Compatibility = "MSFS 2024",
                DateAdded = DateTime.UtcNow.AddDays(-5),
                LastUpdated = DateTime.UtcNow.AddDays(-2)
            },
            new Addon
            {
                FileName = "sample-addon-2.rar",
                Name = "Demo Landscape Pack - European Mountains Collection",
                Compatibility = "MSFS 2020/2024",
                DateAdded = DateTime.UtcNow.AddDays(-10),
                LastUpdated = DateTime.UtcNow.AddDays(-8)
            }
        };

        var pagination = new PaginationInfo
        {
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            TotalItems = 2,
            TotalPages = 1,
            HasPrevious = false,
            HasNext = false
        };

        var summary = new AddonsSummaryStats
        {
            TotalAddons = 2,
            FilteredAddons = 2,
            RecentAddons = 1,
            CompatibilityBreakdown = new Dictionary<string, long>
            {
                { "MSFS 2024", 1 },
                { "MSFS 2020/2024", 1 }
            },
            LatestAddedDate = DateTime.UtcNow.AddDays(-5),
            OldestAddedDate = DateTime.UtcNow.AddDays(-10)
        };

        if (request.Format.ToLower() == "table")
        {
            return new AddonsTableResponse
            {
                Headers = new List<string> { "File Name", "Name", "Compatibility", "Date Added", "Days Ago" },
                Rows = sampleAddons.Select(ConvertToTableRow).ToList(),
                Pagination = pagination,
                Summary = summary
            };
        }
        else
        {
            var addonSummaries = sampleAddons.Select(ConvertToSummary).ToList();
            return new AddonsListResponse
            {
                Addons = addonSummaries,
                Pagination = pagination,
                Summary = summary
            };
        }
    }

    /// <summary>
    /// Gets the latest addons (most recently added).
    /// </summary>
    /// <param name="count">Number of latest addons to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of latest addons.</returns>
    public async Task<List<AddonSummary>> GetLatestAddonsAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        try
        {
            var addons = await DB.Find<Addon>()
                .Sort(a => a.DateAdded, Order.Descending)
                .Limit(count)
                .ExecuteAsync();

            return addons.Select(ConvertToSummary).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving latest addons");
            throw;
        }
    }

    private AddonsListRequest SanitizeRequest(AddonsListRequest request)
    {
        return new AddonsListRequest
        {
            Page = Math.Max(1, request.Page),
            PageSize = Math.Min(100, Math.Max(1, request.PageSize)),
            SortBy = ValidateSortField(request.SortBy),
            SortDirection = request.SortDirection?.ToLower() == "asc" ? "asc" : "desc",
            Compatibility = string.IsNullOrWhiteSpace(request.Compatibility) ? null : request.Compatibility.Trim(),
            Search = string.IsNullOrWhiteSpace(request.Search) ? null : request.Search.Trim(),
            AddedAfter = request.AddedAfter,
            AddedBefore = request.AddedBefore,
            Format = ValidateFormat(request.Format)
        };
    }

    private string ValidateFormat(string format)
    {
        var validFormats = new[] { "list", "table" };
        return validFormats.Contains(format?.ToLower()) ? format.ToLower() : "list";
    }

    private string ValidateSortField(string sortBy)
    {
        var validFields = new[] { "name", "dateAdded", "lastUpdated", "compatibility", "fileName" };
        return validFields.Contains(sortBy?.ToLower()) ? sortBy!.ToLower() : "dateAdded";
    }

    private async Task<(List<Addon> addons, long totalCount)> ExecuteQueryAsync(AddonsListRequest request)
    {
        // Build filter expression
        Expression<Func<Addon, bool>> filter = BuildFilterExpression(request);

        // Get total count
        var totalCount = await DB.CountAsync<Addon>(filter);

        // Get data using LINQ with MongoDB.Entities
        var query = DB.Queryable<Addon>().Where(filter);

        // Apply sorting
        query = ApplySorting(query, request);

        // Apply pagination
        var addons = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (addons, totalCount);
    }

    private Expression<Func<Addon, bool>> BuildFilterExpression(AddonsListRequest request)
    {
        Expression<Func<Addon, bool>> filter = x => true; // Start with "all"

        if (!string.IsNullOrEmpty(request.Compatibility))
        {
            var compatibilityFilter = request.Compatibility;
            filter = CombineExpressions(filter, x => x.Compatibility == compatibilityFilter);
        }

        if (!string.IsNullOrEmpty(request.Search))
        {
            var searchTerm = request.Search;
            filter = CombineExpressions(filter, x => x.Name.Contains(searchTerm) || x.FileName.Contains(searchTerm));
        }

        if (request.AddedAfter.HasValue)
        {
            var afterDate = request.AddedAfter.Value;
            filter = CombineExpressions(filter, x => x.DateAdded >= afterDate);
        }

        if (request.AddedBefore.HasValue)
        {
            var beforeDate = request.AddedBefore.Value;
            filter = CombineExpressions(filter, x => x.DateAdded <= beforeDate);
        }

        return filter;
    }

    private Expression<Func<Addon, bool>> CombineExpressions(
        Expression<Func<Addon, bool>> first,
        Expression<Func<Addon, bool>> second)
    {
        var parameter = Expression.Parameter(typeof(Addon), "x");
        var firstBody = new ParameterReplacer(parameter).Visit(first.Body);
        var secondBody = new ParameterReplacer(parameter).Visit(second.Body);
        var combined = Expression.AndAlso(firstBody, secondBody);
        return Expression.Lambda<Func<Addon, bool>>(combined, parameter);
    }

    private IQueryable<Addon> ApplySorting(IQueryable<Addon> query, AddonsListRequest request)
    {
        if (request.SortDirection == "asc")
        {
            return request.SortBy.ToLower() switch
            {
                "name" => query.OrderBy(x => x.Name),
                "dateadded" => query.OrderBy(x => x.DateAdded),
                "lastupdated" => query.OrderBy(x => x.LastUpdated),
                "compatibility" => query.OrderBy(x => x.Compatibility),
                "filename" => query.OrderBy(x => x.FileName),
                _ => query.OrderBy(x => x.DateAdded)
            };
        }
        else
        {
            return request.SortBy.ToLower() switch
            {
                "name" => query.OrderByDescending(x => x.Name),
                "dateadded" => query.OrderByDescending(x => x.DateAdded),
                "lastupdated" => query.OrderByDescending(x => x.LastUpdated),
                "compatibility" => query.OrderByDescending(x => x.Compatibility),
                "filename" => query.OrderByDescending(x => x.FileName),
                _ => query.OrderByDescending(x => x.DateAdded)
            };
        }
    }

    private class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;

        public ParameterReplacer(ParameterExpression parameter)
        {
            _parameter = parameter;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return _parameter;
        }
    }



    private PaginationInfo CalculatePagination(AddonsListRequest request, long totalCount)
    {
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);
        
        return new PaginationInfo
        {
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalCount,
            TotalPages = totalPages,
            HasPrevious = request.Page > 1,
            HasNext = request.Page < totalPages
        };
    }

    private AddonSummary ConvertToSummary(Addon addon)
    {
        var daysSinceAdded = (DateTime.UtcNow - addon.DateAdded).Days;

        return new AddonSummary
        {
            Id = addon.ID,
            FileName = addon.FileName,
            Name = addon.Name,
            Compatibility = addon.Compatibility,
            DateAdded = addon.DateAdded,
            LastUpdated = addon.LastUpdated,
            DaysSinceAdded = daysSinceAdded,
            IsRecent = daysSinceAdded <= 7
        };
    }

    private List<string> ConvertToTableRow(Addon addon)
    {
        var daysSinceAdded = (DateTime.UtcNow - addon.DateAdded).Days;
        var shortName = addon.Name.Length > 50 ? addon.Name.Substring(0, 47) + "..." : addon.Name;
        var dateFormatted = addon.DateAdded.ToString("yyyy-MM-dd");
        var daysAgo = daysSinceAdded == 0 ? "Today" :
                     daysSinceAdded == 1 ? "1 day ago" :
                     $"{daysSinceAdded} days ago";

        return new List<string>
        {
            addon.FileName,
            shortName,
            addon.Compatibility,
            dateFormatted,
            daysAgo
        };
    }

    private async Task<AddonsSummaryStats> GetSummaryStatsAsync(AddonsListRequest request, CancellationToken cancellationToken)
    {
        // Get total count in database
        var totalCount = await DB.CountAsync<Addon>();

        // Get filtered count using the same query approach
        var (_, filteredCount) = await ExecuteQueryAsync(new AddonsListRequest
        {
            Page = 1,
            PageSize = 1,
            Compatibility = request.Compatibility,
            Search = request.Search,
            AddedAfter = request.AddedAfter,
            AddedBefore = request.AddedBefore,
            SortBy = "dateAdded",
            SortDirection = "desc",
            Format = "list"
        });

        // Get recent addons count (last 7 days)
        var recentCount = await DB.CountAsync<Addon>(a => a.DateAdded >= DateTime.UtcNow.AddDays(-7));

        // Get compatibility breakdown
        var compatibilityBreakdown = new Dictionary<string, long>();
        var compatibilities = await DB.Distinct<Addon, string>()
            .Property(a => a.Compatibility)
            .ExecuteAsync();

        foreach (var compatibility in compatibilities)
        {
            var count = await DB.CountAsync<Addon>(a => a.Compatibility == compatibility);
            compatibilityBreakdown[compatibility] = count;
        }

        // Get date range using simple queries
        var latestAddon = await DB.Find<Addon>()
            .Sort(a => a.DateAdded, Order.Descending)
            .Limit(1)
            .ExecuteFirstAsync();

        var oldestAddon = await DB.Find<Addon>()
            .Sort(a => a.DateAdded, Order.Ascending)
            .Limit(1)
            .ExecuteFirstAsync();

        DateTime? latestDate = latestAddon?.DateAdded;
        DateTime? oldestDate = oldestAddon?.DateAdded;

        return new AddonsSummaryStats
        {
            TotalAddons = totalCount,
            FilteredAddons = filteredCount,
            RecentAddons = recentCount,
            CompatibilityBreakdown = compatibilityBreakdown,
            LatestAddedDate = latestDate,
            OldestAddedDate = oldestDate
        };
    }
}
