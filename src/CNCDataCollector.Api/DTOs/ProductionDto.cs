namespace CNCDataCollector.Api.DTOs;

public sealed class ProductionDto
{
    public int PartCount { get; set; }

    public int GoodPartCount { get; set; }

    public int RejectPartCount { get; set; }

    public int TargetQuantity { get; set; }

    public int ActualQuantity { get; set; }

    public TimeSpan CycleTime { get; set; }
}