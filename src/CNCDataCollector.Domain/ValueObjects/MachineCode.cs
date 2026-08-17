namespace CNCDataCollector.Domain.ValueObjects;

public sealed class MachineCode
{
    public string Value { get; }

    public MachineCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Machine code cannot be empty.", nameof(value));

        Value = value.Trim().ToUpperInvariant();
    }

    public override string ToString()
    {
        return Value;
    }
}