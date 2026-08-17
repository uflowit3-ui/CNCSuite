using CNCDataCollector.Domain.Enums;
using CNCDataCollector.Domain.ValueObjects;

namespace CNCDataCollector.Domain.Entities;

public class Machine
{
    public int Id { get; set; }

    //public string Name { get; set; } = string.Empty;
    public MachineName Name { get; set; } = new("Machine");

    //public string MachineCode { get; set; } = string.Empty;
    public MachineCode MachineCode { get; set; } = new("VMC-01");

    //public string IpAddress { get; set; } = string.Empty;
    public IpAddress IpAddress { get; set; } = new("192.168.1.100");


    //public int Port { get; set; }
    public PortNumber Port { get; set; } = new(8193);

    public ControllerType ControllerType { get; set; }

    public bool IsEnabled { get; set; } = true;

    public MachineConnection Connection { get; set; } = new();

    public MachineStatus Status { get; set; } = new();

    public Production Production { get; set; } = new();

    public Runtime Runtime { get; set; } = new();

    public ProgramInfo Program { get; set; } = new();

    public AxisPosition Axis { get; set; } = new();

    public Spindle Spindle { get; set; } = new();

    public Tool Tool { get; set; } = new();

    public Alarm? ActiveAlarm { get; set; }
}