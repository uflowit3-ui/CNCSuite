namespace CNCDataCollector.Api.DTOs;

public sealed class AxisPositionDto
{
    public double X { get; set; }

    public double Y { get; set; }

    public double Z { get; set; }

    public double A { get; set; }

    public double B { get; set; }

    public double C { get; set; }

    public DateTime LastUpdated { get; set; }
}