namespace CNCDataCollector.Api.DTOs;

public sealed class MachineStatusDto
{
    public int State { get; set; }

    public bool EmergencyStop { get; set; }

    public bool FeedHold { get; set; }

    public bool CycleStart { get; set; }
}