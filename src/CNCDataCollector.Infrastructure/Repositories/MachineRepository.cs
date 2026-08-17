using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CNCDataCollector.Infrastructure.Repositories;

public sealed class MachineRepository : IMachineRepository
{
    private readonly AppDbContext _dbContext;

    public MachineRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public async Task<IReadOnlyList<Machine>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Machines
            .AsNoTracking()
            .OrderBy(x => x.Id)
            .ToListAsync(cancellationToken);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public async Task<Machine?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Machines
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    // =========================================================
    // EXISTS BY ID
    // =========================================================

    public async Task<bool> ExistsAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Machines
            .AnyAsync(
                x => x.Id == id,
                cancellationToken);
    }

    // =========================================================
    // EXISTS BY MACHINE CODE
    // =========================================================

    public async Task<bool> ExistsByMachineCodeAsync(
        string machineCode,
        int? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode =
            machineCode.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return false;
        }

        // MachineCode is a ValueObject with an EF value converter.
        // Comparing .Value directly inside IQueryable is not
        // translated correctly by EF Core in this model.
        //
        // Read the converted value first, then compare in memory.
        // This is acceptable for the machine master table because
        // the number of configured machines is expected to be small.

        var machines =
            await _dbContext.Machines
                .AsNoTracking()
                .Select(x => new
                {
                    x.Id,
                    MachineCode = x.MachineCode.Value
                })
                .ToListAsync(cancellationToken);

        return machines.Any(
            x =>
                x.MachineCode.Equals(
                    normalizedCode,
                    StringComparison.OrdinalIgnoreCase) &&
                (!excludeId.HasValue ||
                 x.Id != excludeId.Value));
    }

    // =========================================================
    // ADD
    // =========================================================

    public async Task AddAsync(
        Machine machine,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.Machines.AddAsync(
            machine,
            cancellationToken);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public void Update(Machine machine)
    {
        _dbContext.Machines.Update(machine);
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void Delete(Machine machine)
    {
        _dbContext.Machines.Remove(machine);
    }

    // =========================================================
    // SAVE
    // =========================================================

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(
            cancellationToken);
    }
}