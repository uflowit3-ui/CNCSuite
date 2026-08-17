namespace CNCDataCollector.Domain.ValueObjects;

public sealed class MachineName
{
    public string Value { get; }

    public MachineName(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Machine name cannot be empty.", nameof(value));

        value = value.Trim();

        if (value.Length > 100)
            throw new ArgumentException("Machine name cannot exceed 100 characters.", nameof(value));

        Value = value;
    }

    public override string ToString()
    {
        return Value;
    }

    public static implicit operator string(MachineName machineName)
    {
        return machineName.Value;
    }
}