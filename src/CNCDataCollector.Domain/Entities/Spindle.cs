namespace CNCDataCollector.Domain.Entities;

public class Spindle
{
    /// <summary>
    /// Current spindle speed (RPM).
    /// </summary>
    public int CurrentRpm { get; set; }

    /// <summary>
    /// Commanded spindle speed (RPM).
    /// </summary>
    public int TargetRpm { get; set; }

    /// <summary>
    /// Current spindle load (%).
    /// </summary>
    public double LoadPercentage { get; set; }

    /// <summary>
    /// Current spindle power (kW).
    /// </summary>
    public double Power { get; set; }

    /// <summary>
    /// Spindle temperature (°C).
    /// </summary>
    public double Temperature { get; set; }

    /// <summary>
    /// Is spindle currently running?
    /// </summary>
    public bool IsRunning { get; set; }

    /// <summary>
    /// Clockwise rotation.
    /// </summary>
    public bool Clockwise { get; set; }

    /// <summary>
    /// Last updated time.
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}