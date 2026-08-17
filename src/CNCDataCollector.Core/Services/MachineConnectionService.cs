using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Domain.Enums;

namespace CNCDataCollector.Core.Services;

public sealed class MachineConnectionService : IMachineConnectionService
{
    private readonly IMachineRepository _machineRepository;
    private readonly ICncDriver _cncDriver;

    public MachineConnectionService(
        IMachineRepository machineRepository,
        ICncDriver cncDriver)
    {
        _machineRepository = machineRepository;
        _cncDriver = cncDriver;
    }

    // =========================================================
    // CONNECT
    // =========================================================

    public async Task<Machine> ConnectAsync(
        int machineId,
        CancellationToken cancellationToken = default)
    {
        var machine = await GetMachineAsync(
            machineId,
            cancellationToken);

        // -----------------------------------------------------
        // Driver connection
        // -----------------------------------------------------

        var result = await _cncDriver.ConnectAsync(
            cancellationToken);

        if (!result.IsSuccess)
        {
            machine.Connection.State =
                ConnectionState.Disconnected;

            machine.Connection.Message =
                result.Error?.Message
                ?? "Failed to connect to CNC.";

            await _machineRepository.SaveChangesAsync(
                cancellationToken);

            throw new InvalidOperationException(
                machine.Connection.Message);
        }

        // -----------------------------------------------------
        // Update machine connection state
        // -----------------------------------------------------

        machine.Connection.State =
            ConnectionState.Connected;

        machine.Connection.LastConnected =
            DateTime.UtcNow;

        machine.Connection.LastHeartbeat =
            DateTime.UtcNow;

        machine.Connection.Message =
            "Machine connected successfully.";

        // -----------------------------------------------------
        // Machine state
        // -----------------------------------------------------

        machine.Status.State =
            MachineState.Idle;

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return machine;
    }

    // =========================================================
    // DISCONNECT
    // =========================================================

    public async Task<Machine> DisconnectAsync(
        int machineId,
        CancellationToken cancellationToken = default)
    {
        var machine = await GetMachineAsync(
            machineId,
            cancellationToken);

        // -----------------------------------------------------
        // Driver disconnect
        // -----------------------------------------------------

        if (_cncDriver.IsConnected)
        {
            var result = await _cncDriver.DisconnectAsync(
                cancellationToken);

            if (!result.IsSuccess)
            {
                machine.Connection.Message =
                    result.Error?.Message
                    ?? "Failed to disconnect from CNC.";

                await _machineRepository.SaveChangesAsync(
                    cancellationToken);

                throw new InvalidOperationException(
                    machine.Connection.Message);
            }
        }

        // -----------------------------------------------------
        // Update machine connection state
        // -----------------------------------------------------

        machine.Connection.State =
            ConnectionState.Disconnected;

        machine.Connection.LastDisconnected =
            DateTime.UtcNow;

        machine.Connection.Message =
            "Machine disconnected.";

        // -----------------------------------------------------
        // Machine state
        // -----------------------------------------------------

        machine.Status.State =
            MachineState.Stopped;

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return machine;
    }

    // =========================================================
    // HEARTBEAT
    // =========================================================

    public async Task<Machine> HeartbeatAsync(
        int machineId,
        CancellationToken cancellationToken = default)
    {
        var machine = await GetMachineAsync(
            machineId,
            cancellationToken);

        // -----------------------------------------------------
        // Check driver connection
        // -----------------------------------------------------

        if (!_cncDriver.IsConnected)
        {
            machine.Connection.State =
                ConnectionState.Disconnected;

            machine.Connection.Message =
                "CNC driver is not connected.";

            await _machineRepository.SaveChangesAsync(
                cancellationToken);

            return machine;
        }

        // -----------------------------------------------------
        // Update heartbeat
        // -----------------------------------------------------

        machine.Connection.State =
            ConnectionState.Connected;

        machine.Connection.LastHeartbeat =
            DateTime.UtcNow;

        machine.Connection.Message =
            "Heartbeat received.";

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return machine;
    }

    // =========================================================
    // PRIVATE
    // =========================================================

    private async Task<Machine> GetMachineAsync(
        int machineId,
        CancellationToken cancellationToken)
    {
        var machine =
            await _machineRepository.GetByIdAsync(
                machineId,
                cancellationToken);

        if (machine is null)
        {
            throw new KeyNotFoundException(
                $"Machine with ID {machineId} was not found.");
        }

        return machine;
    }
}