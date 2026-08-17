using System.Net;

namespace CNCDataCollector.Domain.ValueObjects;

public sealed class IpAddress
{
    public string Value { get; }

    public IpAddress(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("IP address cannot be empty.", nameof(value));

        value = value.Trim();

        if (!IPAddress.TryParse(value, out _))
            throw new ArgumentException("Invalid IP address format.", nameof(value));

        Value = value;
    }

    public override string ToString()
    {
        return Value;
    }

    public static implicit operator string(IpAddress ipAddress)
    {
        return ipAddress.Value;
    }
}