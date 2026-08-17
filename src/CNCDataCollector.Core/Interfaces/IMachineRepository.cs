using CNCDataCollector.Domain.Entities;

namespace CNCDataCollector.Core.Interfaces;

public interface IMachineRepository
{
    Task<IReadOnlyList<Machine>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<Machine?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByMachineCodeAsync(
        string machineCode,
        int? excludeId = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Machine machine,
        CancellationToken cancellationToken = default);

    void Update(
        Machine machine);

    void Delete(
        Machine machine);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}