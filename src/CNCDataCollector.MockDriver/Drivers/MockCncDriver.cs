using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Shared.Results;
using CNCDataCollector.MockDriver.Generators;

namespace CNCDataCollector.MockDriver.Drivers;

public sealed class MockCncDriver : ICncDriver
{
    private readonly RandomDataGenerator _generator = new();

    public string DriverName => "Mock CNC Driver";

    public bool IsConnected { get; private set; }

    // =========================================================
    // CONNECTION
    // =========================================================

    public async Task<Result> ConnectAsync(
        CancellationToken cancellationToken = default)
    {
        await Task.Delay(
            500,
            cancellationToken);

        IsConnected = true;

        return Result.Success();
    }

    public async Task<Result> DisconnectAsync(
        CancellationToken cancellationToken = default)
    {
        await Task.Delay(
            200,
            cancellationToken);

        IsConnected = false;

        return Result.Success();
    }

    public ValueTask DisposeAsync()
    {
        IsConnected = false;

        return ValueTask.CompletedTask;
    }

    // =========================================================
    // MACHINE
    // =========================================================

    public Task<Result<Machine>> ReadMachineAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<Machine>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var machine =
            _generator.GenerateMachine();

        return Task.FromResult(
            Result<Machine>.Success(
                machine));
    }

    // =========================================================
    // MACHINE STATUS
    // =========================================================

    public Task<Result<MachineStatus>> ReadMachineStatusAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<MachineStatus>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var status =
            _generator.GenerateMachineStatus();

        return Task.FromResult(
            Result<MachineStatus>.Success(
                status));
    }

    // =========================================================
    // PRODUCTION
    // =========================================================

    public Task<Result<Production>> ReadProductionAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<Production>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var production =
            _generator.GenerateProduction();

        return Task.FromResult(
            Result<Production>.Success(
                production));
    }

    // =========================================================
    // RUNTIME
    // =========================================================

    public Task<Result<Runtime>> ReadRuntimeAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<Runtime>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var runtime =
            _generator.GenerateRuntime();

        return Task.FromResult(
            Result<Runtime>.Success(
                runtime));
    }

    // =========================================================
    // PROGRAM
    // =========================================================

    public Task<Result<ProgramInfo>> ReadProgramAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<ProgramInfo>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var program =
            _generator.GenerateProgram();

        return Task.FromResult(
            Result<ProgramInfo>.Success(
                program));
    }

    // =========================================================
    // AXIS POSITION
    // =========================================================

    public Task<Result<AxisPosition>> ReadAxisPositionAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<AxisPosition>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var axisPosition =
            _generator.GenerateAxisPosition();

        return Task.FromResult(
            Result<AxisPosition>.Success(
                axisPosition));
    }

    // =========================================================
    // SPINDLE
    // =========================================================

    public Task<Result<Spindle>> ReadSpindleAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<Spindle>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var spindle =
            _generator.GenerateSpindle();

        return Task.FromResult(
            Result<Spindle>.Success(
                spindle));
    }

    // =========================================================
    // TOOL
    // =========================================================

    public Task<Result<Tool>> ReadToolAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<Tool>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var tool =
            _generator.GenerateTool();

        return Task.FromResult(
            Result<Tool>.Success(
                tool));
    }

    // =========================================================
    // ACTIVE ALARM
    // =========================================================

    public Task<Result<Alarm?>> ReadActiveAlarmAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<Alarm?>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        var alarm =
            _generator.GenerateActiveAlarm();

        return Task.FromResult(
            Result<Alarm?>.Success(
                alarm));
    }

    // =========================================================
    // COMPLETE MACHINE SNAPSHOT
    //
    // IMPORTANT:
    //
    // Do NOT call ReadMachineAsync(),
    // ReadMachineStatusAsync(),
    // ReadProductionAsync(), etc.
    //
    // Those methods independently advance generator state.
    //
    // GenerateMachine() is called ONCE here so one snapshot
    // represents one consistent generator state.
    // =========================================================

    public Task<Result<MachineSnapshot>> ReadSnapshotAsync(
        CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return Task.FromResult(
                Result<MachineSnapshot>.Failure(
                    new Error(
                        "CNC_NOT_CONNECTED",
                        "CNC driver is not connected.")));
        }

        cancellationToken.ThrowIfCancellationRequested();

        // =====================================================
        // ONE GENERATOR UPDATE PER SNAPSHOT
        // =====================================================

        var machine =
            _generator.GenerateMachine();

        // =====================================================
        // BUILD SNAPSHOT FROM SAME GENERATED MACHINE STATE
        //
        // GenerateMachine() already provides:
        //
        // Status
        // Production
        // Runtime
        // Program
        // Axis
        // Spindle
        // Tool
        // ActiveAlarm
        // =====================================================

        var snapshot =
            new MachineSnapshot
            {
                Machine =
                    machine,

                Status =
                    machine.Status,

                Production =
                    machine.Production,

                Runtime =
                    machine.Runtime,

                Program =
                    machine.Program,

                AxisPosition =
                    machine.Axis,

                Spindle =
                    machine.Spindle,

                Tool =
                    machine.Tool,

                ActiveAlarm =
                    machine.ActiveAlarm,

                CollectedAt =
                    DateTime.UtcNow
            };

        return Task.FromResult(
            Result<MachineSnapshot>.Success(
                snapshot));
    }
}