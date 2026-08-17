using CNCDataCollector.Api.DTOs;
using CNCDataCollector.Domain.Entities;

namespace CNCDataCollector.Api.Mapping;

public static class SnapshotMapper
{
    public static MachineSnapshotDto ToDto(
        MachineSnapshot snapshot)
    {
        return new MachineSnapshotDto
        {
            Machine = snapshot.Machine is null
                ? null
                : new MachineDto
                {
                    Id = snapshot.Machine.Id,
                    Name = snapshot.Machine.Name.Value,
                    MachineCode = snapshot.Machine.MachineCode.Value,
                    IpAddress = snapshot.Machine.IpAddress.Value,
                    Port = snapshot.Machine.Port.Value,
                    ControllerType = (int)snapshot.Machine.ControllerType,
                    IsEnabled = snapshot.Machine.IsEnabled
                },

            Status = snapshot.Status is null
                ? null
                : new MachineStatusDto
                {
                    State = (int)snapshot.Status.State,
                    EmergencyStop = snapshot.Status.EmergencyStop,
                    FeedHold = snapshot.Status.FeedHold,
                    CycleStart = snapshot.Status.CycleStart
                },

            Production = snapshot.Production is null
                ? null
                : new ProductionDto
                {
                    PartCount = snapshot.Production.PartCount,
                    GoodPartCount = snapshot.Production.GoodPartCount,
                    RejectPartCount = snapshot.Production.RejectPartCount,
                    TargetQuantity = snapshot.Production.TargetQuantity,
                    ActualQuantity = snapshot.Production.ActualQuantity,
                    CycleTime = snapshot.Production.CycleTime
                },

            Runtime = snapshot.Runtime is null
                ? null
                : new RuntimeDto
                {
                    PowerOnTime = snapshot.Runtime.PowerOnTime,
                    RunningTime = snapshot.Runtime.RunningTime,
                    IdleTime = snapshot.Runtime.IdleTime,
                    AlarmTime = snapshot.Runtime.AlarmTime,
                    StoppedTime = snapshot.Runtime.StoppedTime,
                    LastCycleStart = snapshot.Runtime.LastCycleStart,
                    LastCycleEnd = snapshot.Runtime.LastCycleEnd
                },

            Program = snapshot.Program is null
                ? null
                : new ProgramInfoDto
                {
                    ProgramNumber = snapshot.Program.ProgramNumber,
                    ProgramName = snapshot.Program.ProgramName,
                    CurrentBlockNumber = snapshot.Program.CurrentBlockNumber,
                    IsRunning = snapshot.Program.IsRunning,
                    StartTime = snapshot.Program.StartTime,
                    EndTime = snapshot.Program.EndTime,
                    Progress = snapshot.Program.Progress,
                    RemainingCycleTime = snapshot.Program.RemainingCycleTime
                },

            AxisPosition = snapshot.AxisPosition is null
                ? null
                : new AxisPositionDto
                {
                    X = snapshot.AxisPosition.X,
                    Y = snapshot.AxisPosition.Y,
                    Z = snapshot.AxisPosition.Z,
                    A = snapshot.AxisPosition.A,
                    B = snapshot.AxisPosition.B,
                    C = snapshot.AxisPosition.C,
                    LastUpdated = snapshot.AxisPosition.LastUpdated
                },

            Spindle = snapshot.Spindle is null
                ? null
                : new SpindleDto
                {
                    CurrentRpm = snapshot.Spindle.CurrentRpm,
                    TargetRpm = snapshot.Spindle.TargetRpm,
                    LoadPercentage = snapshot.Spindle.LoadPercentage,
                    Power = snapshot.Spindle.Power,
                    Temperature = snapshot.Spindle.Temperature,
                    IsRunning = snapshot.Spindle.IsRunning,
                    Clockwise = snapshot.Spindle.Clockwise,
                    LastUpdated = snapshot.Spindle.LastUpdated
                },

            Tool = snapshot.Tool is null
                ? null
                : new ToolDto
                {
                    ToolNumber = snapshot.Tool.ToolNumber,
                    ToolName = snapshot.Tool.ToolName,
                    ToolOffset = snapshot.Tool.ToolOffset,
                    Length = snapshot.Tool.Length,
                    Diameter = snapshot.Tool.Diameter,
                    LifePercentage = snapshot.Tool.LifePercentage,
                    IsActive = snapshot.Tool.IsActive,
                    LastUpdated = snapshot.Tool.LastUpdated
                },

            ActiveAlarm = snapshot.ActiveAlarm is null
                ? null
                : new AlarmDto
                {
                    AlarmNumber = snapshot.ActiveAlarm.AlarmNumber,
                    Message = snapshot.ActiveAlarm.Message,
                    Level = (int)snapshot.ActiveAlarm.Level,
                    StartTime = snapshot.ActiveAlarm.StartTime,
                    EndTime = snapshot.ActiveAlarm.EndTime,
                    IsActive = snapshot.ActiveAlarm.IsActive,
                    Description = snapshot.ActiveAlarm.Description,
                    ControllerAlarmCode =
                        snapshot.ActiveAlarm.ControllerAlarmCode
                },

            CollectedAt = snapshot.CollectedAt
        };
    }
}