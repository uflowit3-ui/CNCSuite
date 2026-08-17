using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace CNCDataCollector.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // =========================================================
    // TABLES
    // =========================================================

    public DbSet<Machine> Machines => Set<Machine>();

    // =========================================================
    // MODEL CONFIGURATION
    // =========================================================

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureMachine(modelBuilder);
    }

    // =========================================================
    // MACHINE
    // =========================================================

    private static void ConfigureMachine(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Machine>();

        entity.ToTable("Machines");

        // -----------------------------------------------------
        // Primary Key
        // -----------------------------------------------------

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .ValueGeneratedOnAdd();

        // -----------------------------------------------------
        // Machine Name
        // -----------------------------------------------------

        entity.Property(x => x.Name)
            .HasConversion(
                value => value.Value,
                value => new MachineName(value))
            .HasMaxLength(100)
            .IsRequired();

        // -----------------------------------------------------
        // Machine Code
        // -----------------------------------------------------

        entity.Property(x => x.MachineCode)
            .HasConversion(
                value => value.Value,
                value => new MachineCode(value))
            .HasMaxLength(100)
            .IsRequired();

        entity.HasIndex(x => x.MachineCode)
            .IsUnique();

        // -----------------------------------------------------
        // IP Address
        // -----------------------------------------------------

        entity.Property(x => x.IpAddress)
            .HasConversion(
                value => value.Value,
                value => new IpAddress(value))
            .HasMaxLength(45)
            .IsRequired();

        // -----------------------------------------------------
        // Port
        // -----------------------------------------------------

        entity.Property(x => x.Port)
            .HasConversion(
                value => value.Value,
                value => new PortNumber(value))
            .IsRequired();

        // -----------------------------------------------------
        // Controller Type
        // -----------------------------------------------------

        entity.Property(x => x.ControllerType)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // -----------------------------------------------------
        // Enabled
        // -----------------------------------------------------

        entity.Property(x => x.IsEnabled)
            .IsRequired();

        // -----------------------------------------------------
        // Navigation / Complex Runtime Data
        //
        // These properties are intentionally ignored for the
        // initial Machine configuration persistence.
        //
        // They belong to live CNC/runtime state and should not
        // be stored in the Machines master table.
        // -----------------------------------------------------

        entity.Ignore(x => x.Connection);
        entity.Ignore(x => x.Status);
        entity.Ignore(x => x.Production);
        entity.Ignore(x => x.Runtime);
        entity.Ignore(x => x.Program);
        entity.Ignore(x => x.Axis);
        entity.Ignore(x => x.Spindle);
        entity.Ignore(x => x.Tool);
        entity.Ignore(x => x.ActiveAlarm);
    }
}