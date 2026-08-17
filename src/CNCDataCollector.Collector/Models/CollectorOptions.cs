namespace CNCDataCollector.Collector.Models;

/// <summary>
/// Configuration options for the CNC Data Collector.
/// </summary>
public sealed class CollectorOptions
{
    /// <summary>
    /// Collector name.
    /// </summary>
    public string CollectorName { get; set; } = "CNC Data Collector";

    /// <summary>
    /// Polling interval in milliseconds.
    /// </summary>
    public int PollInterval { get; set; } = 1000;

    /// <summary>
    /// Connection timeout in milliseconds.
    /// </summary>
    public int ConnectionTimeout { get; set; } = 5000;

    /// <summary>
    /// Number of retry attempts before marking the machine offline.
    /// </summary>
    public int RetryCount { get; set; } = 3;

    /// <summary>
    /// Enable console logging.
    /// </summary>
    public bool EnableConsoleLog { get; set; } = true;

    /// <summary>
    /// Enable file logging.
    /// </summary>
    public bool EnableFileLog { get; set; } = false;

    /// <summary>
    /// Laravel ERP API URL.
    /// </summary>
    public string ApiBaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// API authentication token.
    /// </summary>
    public string ApiToken { get; set; } = string.Empty;
}