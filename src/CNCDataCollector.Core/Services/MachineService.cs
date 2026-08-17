using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Shared.Results;

namespace CNCDataCollector.Core.Services;

public sealed class MachineService : IMachineService
{
    private readonly IMachineRepository _machineRepository;

    private readonly ICncDriver _cncDriver;

    public MachineService(
        IMachineRepository machineRepository,ICncDriver cncDriver)
    {
        _machineRepository = machineRepository;
        _cncDriver = cncDriver;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public async Task<Result<IReadOnlyList<Machine>>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var machines =
            await _machineRepository.GetAllAsync(
                cancellationToken);

        return Result<IReadOnlyList<Machine>>.Success(
            machines);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public async Task<Result<Machine>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE_ID",
                    "Machine ID must be greater than zero."));
        }

        var machine =
            await _machineRepository.GetByIdAsync(
                id,
                cancellationToken);

        if (machine is null)
        {
            return Result<Machine>.Failure(
                new Error(
                    "MACHINE_NOT_FOUND",
                    $"Machine '{id}' was not found."));
        }

        return Result<Machine>.Success(
            machine);
    }

    // =========================================================
    // CREATE
    // =========================================================

    public async Task<Result<Machine>> CreateAsync(
        Machine machine,
        CancellationToken cancellationToken = default)
    {
        if (machine is null)
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE",
                    "Machine data is required."));
        }

        var machineCode =
            machine.MachineCode.Value.Trim();

        if (string.IsNullOrWhiteSpace(machineCode))
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE_CODE",
                    "Machine code is required."));
        }

        var duplicate =
            await _machineRepository.ExistsByMachineCodeAsync(
                machineCode,
                null,
                cancellationToken);

        if (duplicate)
        {
            return Result<Machine>.Failure(
                new Error(
                    "DUPLICATE_MACHINE_CODE",
                    $"Machine code '{machineCode}' already exists."));
        }

        // Database generates the identity ID.
        machine.Id = 0;

        await _machineRepository.AddAsync(
            machine,
            cancellationToken);

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return Result<Machine>.Success(
            machine);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public async Task<Result<Machine>> UpdateAsync(
        Machine machine,
        CancellationToken cancellationToken = default)
    {
        if (machine is null)
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE",
                    "Machine data is required."));
        }

        if (machine.Id <= 0)
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE_ID",
                    "Machine ID must be greater than zero."));
        }

        var existing =
            await _machineRepository.GetByIdAsync(
                machine.Id,
                cancellationToken);

        if (existing is null)
        {
            return Result<Machine>.Failure(
                new Error(
                    "MACHINE_NOT_FOUND",
                    $"Machine '{machine.Id}' was not found."));
        }

        var machineCode =
            machine.MachineCode.Value.Trim();

        if (string.IsNullOrWhiteSpace(machineCode))
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE_CODE",
                    "Machine code is required."));
        }

        var duplicate =
            await _machineRepository.ExistsByMachineCodeAsync(
                machineCode,
                machine.Id,
                cancellationToken);

        if (duplicate)
        {
            return Result<Machine>.Failure(
                new Error(
                    "DUPLICATE_MACHINE_CODE",
                    $"Machine code '{machineCode}' already exists."));
        }

        _machineRepository.Update(machine);

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return Result<Machine>.Success(
            machine);
    }

    // =========================================================
    // DELETE
    // =========================================================

    public async Task<Result> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            return Result.Failure(
                new Error(
                    "INVALID_MACHINE_ID",
                    "Machine ID must be greater than zero."));
        }

        var machine =
            await _machineRepository.GetByIdAsync(
                id,
                cancellationToken);

        if (machine is null)
        {
            return Result.Failure(
                new Error(
                    "MACHINE_NOT_FOUND",
                    $"Machine '{id}' was not found."));
        }

        _machineRepository.Delete(
            machine);

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return Result.Success();
    }

    // =========================================================
    // ENABLE
    // =========================================================

    public async Task<Result<Machine>> EnableAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE_ID",
                    "Machine ID must be greater than zero."));
        }

        var machine =
            await _machineRepository.GetByIdAsync(
                id,
                cancellationToken);

        if (machine is null)
        {
            return Result<Machine>.Failure(
                new Error(
                    "MACHINE_NOT_FOUND",
                    $"Machine '{id}' was not found."));
        }

        machine.IsEnabled = true;

        _machineRepository.Update(
            machine);

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return Result<Machine>.Success(
            machine);
    }

    // =========================================================
    // DISABLE
    // =========================================================

    public async Task<Result<Machine>> DisableAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            return Result<Machine>.Failure(
                new Error(
                    "INVALID_MACHINE_ID",
                    "Machine ID must be greater than zero."));
        }

        var machine =
            await _machineRepository.GetByIdAsync(
                id,
                cancellationToken);

        if (machine is null)
        {
            return Result<Machine>.Failure(
                new Error(
                    "MACHINE_NOT_FOUND",
                    $"Machine '{id}' was not found."));
        }

        machine.IsEnabled = false;

        _machineRepository.Update(
            machine);

        await _machineRepository.SaveChangesAsync(
            cancellationToken);

        return Result<Machine>.Success(
            machine);
    }

    // =========================================================
    // TEST CONNECTION
    // =========================================================

    public async Task<Result<bool>> TestConnectionAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            return Result<bool>.Failure(
                new Error(
                    "INVALID_MACHINE_ID",
                    "Machine ID must be greater than zero."));
        }

        var machine =
            await _machineRepository.GetByIdAsync(
                id,
                cancellationToken);

        if (machine is null)
        {
            return Result<bool>.Failure(
                new Error(
                    "MACHINE_NOT_FOUND",
                    $"Machine '{id}' was not found."));
        }

        if (!machine.IsEnabled)
        {
            return Result<bool>.Success(false);
        }

        var validIp =
            !string.IsNullOrWhiteSpace(
                machine.IpAddress.Value);

        var validPort =
            machine.Port.Value > 0 &&
            machine.Port.Value <= 65535;

        return Result<bool>.Success(
            validIp && validPort);
    }

    public async Task<Result<MachineSnapshot>> GetSnapshotAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var machine = await _machineRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (machine is null)
        {
            return Result<MachineSnapshot>.Failure(
                new Error(
                    "MACHINE_NOT_FOUND",
                    $"Machine with ID {id} was not found."));
        }

        var snapshotResult = await _cncDriver.ReadSnapshotAsync(
            cancellationToken);

        if (!snapshotResult.IsSuccess || snapshotResult.Value is null)
        {
            return Result<MachineSnapshot>.Failure(
                new Error(
                    "SNAPSHOT_FAILED",
                    snapshotResult.Error?.Message
                        ?? "Unable to read CNC snapshot."));
        }

        return Result<MachineSnapshot>.Success(
            snapshotResult.Value);
    }
}