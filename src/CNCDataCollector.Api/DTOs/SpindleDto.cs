namespace CNCDataCollector.Api.DTOs;

public sealed class SpindleDto
{
    public int CurrentRpm { get; set; }

    public int TargetRpm { get; set; }

    public double LoadPercentage { get; set; }

    public double Power { get; set; }

    public double Temperature { get; set; }

    public bool IsRunning { get; set; }

    public bool Clockwise { get; set; }

    public DateTime LastUpdated { get; set; }
}