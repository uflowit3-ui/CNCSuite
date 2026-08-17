namespace CNCDataCollector.Domain.ValueObjects;

public sealed class PortNumber
{
    public int Value { get; }

    public PortNumber(int value)
    {
        if (value < 1 || value > 65535)
            throw new ArgumentOutOfRangeException(
                nameof(value),
                "Port number must be between 1 and 65535.");

        Value = value;
    }

    public override string ToString()
    {
        return Value.ToString();
    }

    public static implicit operator int(PortNumber portNumber)
    {
        return portNumber.Value;
    }
}