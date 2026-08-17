using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Shared.Results;

namespace CNCDataCollector.Core.Interfaces;

public interface IMachineService
{
    Task<Result<IReadOnlyList<Machine>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<Result<Machine>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Result<Machine>> CreateAsync(
        Machine machine,
        CancellationToken cancellationToken = default);

    Task<Result<Machine>> UpdateAsync(
        Machine machine,
        CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Result<Machine>> EnableAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Result<Machine>> DisableAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> TestConnectionAsync(
        int id,
        CancellationToken cancellationToken = default);

    // =========================================================
    // LIVE CNC SNAPSHOT
    // =========================================================

    Task<Result<MachineSnapshot>> GetSnapshotAsync(
        int id,
        CancellationToken cancellationToken = default);
}