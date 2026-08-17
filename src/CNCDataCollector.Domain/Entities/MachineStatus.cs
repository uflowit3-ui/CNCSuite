using CNCDataCollector.Domain.Enums;

namespace CNCDataCollector.Domain.Entities;

public class MachineStatus
{
    public MachineState State { get; set; }

    public bool EmergencyStop { get; set; }

    public bool FeedHold { get; set; }

    public bool CycleStart { get; set; }
}