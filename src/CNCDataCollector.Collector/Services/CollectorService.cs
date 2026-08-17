using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Shared.Results;

namespace CNCDataCollector.Collector.Services;

/// <summary>
/// Main service responsible for connecting to CNC machines
/// and collecting CNC data.
/// </summary>
public sealed class CollectorService
{
    private readonly ICncDriver _driver;

    public CollectorService(ICncDriver driver)
    {
        _driver = driver;
    }

    /// <summary>
    /// Connect to CNC.
    /// </summary>
    public async Task<Result> ConnectAsync(
        CancellationToken cancellationToken = default)
    {
        return await _driver.ConnectAsync(cancellationToken);
    }

    /// <summary>
    /// Disconnect from CNC.
    /// </summary>
    public async Task<Result> DisconnectAsync(
        CancellationToken cancellationToken = default)
    {
        return await _driver.DisconnectAsync(cancellationToken);
    }

    /// <summary>
    /// Collects a complete snapshot of the current CNC machine.
    /// </summary>
    public async Task<CNCDataCollector.Domain.Entities.MachineSnapshot> CollectSnapshotAsync(
        CancellationToken cancellationToken = default)
    {
        var snapshot = new CNCDataCollector.Domain.Entities.MachineSnapshot
        {
            Machine = null,
            Status = null,
            Production = null,
            Runtime = null,
            Program = null,
            AxisPosition = null,
            Spindle = null,
            Tool = null,
            ActiveAlarm = null,
            CollectedAt = DateTime.UtcNow
        };

        var machineResult = await _driver.ReadMachineAsync(cancellationToken);
        if (machineResult.IsSuccess)
            snapshot.Machine = machineResult.Value;

        var statusResult = await _driver.ReadMachineStatusAsync(cancellationToken);
        if (statusResult.IsSuccess)
            snapshot.Status = statusResult.Value;

        var productionResult = await _driver.ReadProductionAsync(cancellationToken);
        if (productionResult.IsSuccess)
            snapshot.Production = productionResult.Value;

        var runtimeResult = await _driver.ReadRuntimeAsync(cancellationToken);
        if (runtimeResult.IsSuccess)
            snapshot.Runtime = runtimeResult.Value;

        var programResult = await _driver.ReadProgramAsync(cancellationToken);
        if (programResult.IsSuccess)
            snapshot.Program = programResult.Value;

        var axisResult = await _driver.ReadAxisPositionAsync(cancellationToken);
        if (axisResult.IsSuccess)
            snapshot.AxisPosition = axisResult.Value;

        var spindleResult = await _driver.ReadSpindleAsync(cancellationToken);
        if (spindleResult.IsSuccess)
            snapshot.Spindle = spindleResult.Value;

        var toolResult = await _driver.ReadToolAsync(cancellationToken);
        if (toolResult.IsSuccess)
            snapshot.Tool = toolResult.Value;

        var alarmResult = await _driver.ReadActiveAlarmAsync(cancellationToken);
        if (alarmResult.IsSuccess)
            snapshot.ActiveAlarm = alarmResult.Value;

        return snapshot;
    }

    /// <summary>
    /// Collect all currently available CNC data.
    /// </summary>
    public async Task CollectAsync(
        CancellationToken cancellationToken = default)
    {
        if (!_driver.IsConnected)
        {
            var connectResult =
                await ConnectAsync(cancellationToken);

            if (!connectResult.IsSuccess)
            {
                Console.WriteLine(
                    "Failed to connect to CNC.");

                return;
            }
        }

        var statusResult =
            await _driver.ReadMachineStatusAsync(
                cancellationToken);

        var productionResult =
            await _driver.ReadProductionAsync(
                cancellationToken);

        Console.Clear();

        Console.WriteLine("=========================================");
        Console.WriteLine("        CNC DATA COLLECTOR");
        Console.WriteLine("=========================================");
        Console.WriteLine();

        Console.WriteLine(
            $"Driver      : {_driver.DriverName}");

        Console.WriteLine(
            $"Connected   : {_driver.IsConnected}");

        Console.WriteLine();

        if (statusResult.IsSuccess)
        {
            Console.WriteLine(
                $"Status      : {statusResult.Value!.State}");
        }
        else
        {
            Console.WriteLine(
                "Status      : ERROR");
        }

        Console.WriteLine();

        if (productionResult.IsSuccess)
        {
            var production =
                productionResult.Value!;

            Console.WriteLine(
                $"Part Count  : {production.PartCount}");

            Console.WriteLine(
                $"Good Parts  : {production.GoodPartCount}");

            Console.WriteLine(
                $"Reject Part : {production.RejectPartCount}");

            Console.WriteLine(
                $"Target Qty  : {production.TargetQuantity}");

            Console.WriteLine(
                $"Actual Qty  : {production.ActualQuantity}");

            Console.WriteLine(
                $"Cycle Time  : {production.CycleTime}");
        }
        else
        {
            Console.WriteLine(
                "Production  : ERROR");
        }

        Console.WriteLine();

        Console.WriteLine(
            $"Updated     : {DateTime.Now:HH:mm:ss}");
    }
}