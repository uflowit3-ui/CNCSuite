namespace CNCDataCollector.Domain.Entities;

public class AxisPosition
{
    /// <summary>
    /// X Axis Position.
    /// </summary>
    public double X { get; set; }

    /// <summary>
    /// Y Axis Position.
    /// </summary>
    public double Y { get; set; }

    /// <summary>
    /// Z Axis Position.
    /// </summary>
    public double Z { get; set; }

    /// <summary>
    /// A Axis Position.
    /// </summary>
    public double A { get; set; }

    /// <summary>
    /// B Axis Position.
    /// </summary>
    public double B { get; set; }

    /// <summary>
    /// C Axis Position.
    /// </summary>
    public double C { get; set; }

    /// <summary>
    /// Last Updated Time.
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}