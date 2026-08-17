using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Shared.Results;

namespace CNCDataCollector.Core.Interfaces;

public interface ICncDriver : IAsyncDisposable
{
    string DriverName { get; }

    bool IsConnected { get; }

    Task<Result> ConnectAsync(
        CancellationToken cancellationToken = default);

    Task<Result> DisconnectAsync(
        CancellationToken cancellationToken = default);

    Task<Result<Machine>> ReadMachineAsync(
        CancellationToken cancellationToken = default);

    Task<Result<MachineStatus>> ReadMachineStatusAsync(
        CancellationToken cancellationToken = default);

    Task<Result<Production>> ReadProductionAsync(
        CancellationToken cancellationToken = default);

    Task<Result<Runtime>> ReadRuntimeAsync(
        CancellationToken cancellationToken = default);

    Task<Result<ProgramInfo>> ReadProgramAsync(
        CancellationToken cancellationToken = default);

    Task<Result<AxisPosition>> ReadAxisPositionAsync(
        CancellationToken cancellationToken = default);

    Task<Result<Spindle>> ReadSpindleAsync(
        CancellationToken cancellationToken = default);

    Task<Result<Tool>> ReadToolAsync(
        CancellationToken cancellationToken = default);

    Task<Result<Alarm?>> ReadActiveAlarmAsync(
        CancellationToken cancellationToken = default);

    // Complete machine snapshot
    Task<Result<MachineSnapshot>> ReadSnapshotAsync(
        CancellationToken cancellationToken = default);
}