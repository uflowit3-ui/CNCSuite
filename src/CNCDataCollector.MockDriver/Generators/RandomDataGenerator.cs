using CNCDataCollector.Domain.Entities;
using CNCDataCollector.Domain.Enums;
using CNCDataCollector.Domain.ValueObjects;

namespace CNCDataCollector.MockDriver.Generators;

public sealed class RandomDataGenerator
{
    // =========================================================
    // RANDOM
    // =========================================================

    private readonly Random _random = new();

    // =========================================================
    // MACHINE STATE
    // =========================================================

    private bool _isRunning = true;

    // =========================================================
    // PRODUCTION
    // =========================================================

    private int _productionCount = 1000;

    private const double CycleTimeSeconds = 12.5;

    private DateTime _lastProductionUpdate =
        DateTime.UtcNow;

    private double _productionAccumulatorSeconds;

    // =========================================================
    // RUNTIME
    // =========================================================

    /*
     * Runtime values are cumulative counters.
     *
     * Initial values simulate a machine that has already been
     * powered on for 8 hours and running for 5 hours.
     */

    private TimeSpan _powerOnTime =
        TimeSpan.FromHours(8);

    private TimeSpan _runningTime =
        TimeSpan.FromHours(5);

    private TimeSpan _idleTime =
        TimeSpan.FromHours(3);

    private TimeSpan _alarmTime =
        TimeSpan.Zero;

    private TimeSpan _stoppedTime =
        TimeSpan.Zero;

    private DateTime _lastRuntimeUpdate =
        DateTime.UtcNow;

    // =========================================================
    // CYCLE
    // =========================================================

    private DateTime _lastCycleStart =
        DateTime.UtcNow.AddSeconds(
            -CycleTimeSeconds);

    private DateTime _lastCycleEnd =
        DateTime.UtcNow.AddSeconds(-2);

    // =========================================================
    // PROGRAM
    // =========================================================

    private int _currentProgramBlock = 1250;

    private double _programProgress = 45.0;

    // =========================================================
    // MACHINE STATUS
    // =========================================================

    public MachineStatus GenerateMachineStatus()
    {
        /*
         * Small chance to change machine state.
         *
         * We keep the simulator simple:
         *
         * Running <-> Idle
         *
         * Alarm / Emergency Stop are handled separately.
         */

        if (_random.Next(100) < 10)
        {
            _isRunning = !_isRunning;
        }

        return new MachineStatus
        {
            State = _isRunning
                ? MachineState.Running
                : MachineState.Idle,

            EmergencyStop = false,

            FeedHold =
                !_isRunning &&
                _random.Next(100) < 20,

            CycleStart = _isRunning
        };
    }

    // =========================================================
    // PRODUCTION
    // =========================================================

    public Production GenerateProduction()
    {
        var now =
            DateTime.UtcNow;

        /*
         * Calculate actual elapsed time since the previous
         * production update.
         */

        var elapsedSeconds =
            Math.Max(
                0,
                (now - _lastProductionUpdate)
                    .TotalSeconds);

        _lastProductionUpdate =
            now;

        /*
         * Only accumulate production time while the machine
         * is actually running.
         */

        if (_isRunning)
        {
            _productionAccumulatorSeconds +=
                elapsedSeconds;

            /*
             * One part is produced only after the complete
             * cycle time has elapsed.
             *
             * Example:
             *
             * Cycle = 12.5 sec
             *
             * 0 - 12.49 sec  -> no new part
             * 12.5 sec       -> +1 part
             * 25.0 sec       -> +2 parts
             */

            if (
                _productionAccumulatorSeconds >=
                CycleTimeSeconds)
            {
                var completedCycles =
                    (int)Math.Floor(
                        _productionAccumulatorSeconds /
                        CycleTimeSeconds);

                _productionCount +=
                    completedCycles;

                _productionAccumulatorSeconds -=
                    completedCycles *
                    CycleTimeSeconds;

                _lastCycleStart =
                    now.AddSeconds(
                        -_productionAccumulatorSeconds);

                _lastCycleEnd =
                    now;
            }
        }

        return new Production
        {
            PartCount =
                _productionCount,

            GoodPartCount =
                _productionCount,

            RejectPartCount =
                0,

            TargetQuantity =
                5000,

            ActualQuantity =
                _productionCount,

            CycleTime =
                TimeSpan.FromSeconds(
                    CycleTimeSeconds)
        };
    }

    // =========================================================
    // RUNTIME
    // =========================================================

    public Runtime GenerateRuntime()
    {
        var now =
            DateTime.UtcNow;

        /*
         * Calculate elapsed time since the previous runtime
         * snapshot.
         */

        var elapsed =
            now -
            _lastRuntimeUpdate;

        if (elapsed < TimeSpan.Zero)
        {
            elapsed =
                TimeSpan.Zero;
        }

        _lastRuntimeUpdate =
            now;

        /*
         * Power ON
         *
         * The simulated machine is always powered on.
         */

        _powerOnTime +=
            elapsed;

        /*
         * Running / Idle
         *
         * Only the currently active state receives the
         * elapsed time.
         */

        if (_isRunning)
        {
            _runningTime +=
                elapsed;

            /*
             * Keep cycle timestamps realistic.
             */

            _lastCycleStart =
                now.AddSeconds(
                    -Math.Max(
                        0,
                        _productionAccumulatorSeconds));

            _lastCycleEnd =
                now.AddSeconds(-2);
        }
        else
        {
            _idleTime +=
                elapsed;
        }

        /*
         * Alarm and stopped remain zero because the current
         * mock machine only simulates Running <-> Idle.
         *
         * If alarm/stopped states are added later, these
         * counters should be incremented here based on the
         * actual state duration.
         */

        return new Runtime
        {
            PowerOnTime =
                _powerOnTime,

            RunningTime =
                _runningTime,

            IdleTime =
                _idleTime,

            AlarmTime =
                _alarmTime,

            StoppedTime =
                _stoppedTime,

            LastCycleStart =
                _isRunning
                    ? _lastCycleStart
                    : null,

            LastCycleEnd =
                _isRunning
                    ? _lastCycleEnd
                    : null
        };
    }

    // =========================================================
    // PROGRAM
    // =========================================================

    public ProgramInfo GenerateProgram()
    {
        var now =
            DateTime.UtcNow;

        if (_isRunning)
        {
            _currentProgramBlock +=
                _random.Next(1, 5);

            _programProgress +=
                _random.NextDouble() * 1.5;

            if (_programProgress >= 100)
            {
                _programProgress = 0;

                _currentProgramBlock = 1;
            }
        }

        return new ProgramInfo
        {
            ProgramNumber =
                "O0001",

            ProgramName =
                "MAIN_PRODUCTION",

            CurrentBlockNumber =
                _currentProgramBlock,

            IsRunning =
                _isRunning,

            StartTime =
                now.AddMinutes(-15),

            EndTime =
                _isRunning
                    ? null
                    : now,

            Progress =
                Math.Round(
                    _programProgress,
                    2),

            RemainingCycleTime =
                TimeSpan.FromSeconds(
                    Math.Max(
                        0,
                        60 -
                        (_programProgress * 0.6)))
        };
    }

    // =========================================================
    // AXIS POSITION
    // =========================================================

    public AxisPosition GenerateAxisPosition()
    {
        return new AxisPosition
        {
            X =
                Math.Round(
                    _random.NextDouble() * 500,
                    3),

            Y =
                Math.Round(
                    _random.NextDouble() * 300,
                    3),

            Z =
                Math.Round(
                    -_random.NextDouble() * 200,
                    3),

            A =
                Math.Round(
                    _random.NextDouble() * 360,
                    3),

            B =
                Math.Round(
                    _random.NextDouble() * 360,
                    3),

            C =
                Math.Round(
                    _random.NextDouble() * 360,
                    3),

            LastUpdated =
                DateTime.UtcNow
        };
    }

    // =========================================================
    // SPINDLE
    // =========================================================

    public Spindle GenerateSpindle()
    {
        var running =
            _isRunning;

        var targetRpm =
            running
                ? _random.Next(
                    2500,
                    6001)
                : 0;

        var currentRpm =
            running
                ? Math.Max(
                    0,
                    targetRpm +
                    _random.Next(
                        -100,
                        101))
                : 0;

        return new Spindle
        {
            CurrentRpm =
                currentRpm,

            TargetRpm =
                targetRpm,

            LoadPercentage =
                running
                    ? Math.Round(
                        _random.NextDouble() *
                        80 +
                        10,
                        2)
                    : 0,

            Power =
                running
                    ? Math.Round(
                        _random.NextDouble() *
                        5 +
                        1,
                        2)
                    : 0,

            Temperature =
                Math.Round(
                    35 +
                    _random.NextDouble() *
                    15,
                    2),

            IsRunning =
                running,

            Clockwise =
                running,

            LastUpdated =
                DateTime.UtcNow
        };
    }

    // =========================================================
    // TOOL
    // =========================================================

    public Tool GenerateTool()
    {
        var toolNumber =
            _random.Next(
                1,
                13);

        return new Tool
        {
            ToolNumber =
                toolNumber,

            ToolName =
                $"END MILL {toolNumber}",

            ToolOffset =
                toolNumber,

            Length =
                Math.Round(
                    50 +
                    _random.NextDouble() *
                    100,
                    2),

            Diameter =
                Math.Round(
                    6 +
                    _random.NextDouble() *
                    14,
                    2),

            LifePercentage =
                Math.Round(
                    40 +
                    _random.NextDouble() *
                    60,
                    2),

            IsActive =
                true,

            LastUpdated =
                DateTime.UtcNow
        };
    }

    // =========================================================
    // ACTIVE ALARM
    // =========================================================

    public Alarm? GenerateActiveAlarm()
    {
        /*
         * Current mock configuration:
         *
         * 90% -> no active alarm
         * 10% -> simulated warning alarm
         *
         * Runtime AlarmTime is intentionally kept at zero
         * because alarm duration is not currently tracked.
         */

        if (_random.Next(100) < 90)
        {
            return null;
        }

        return new Alarm
        {
            AlarmNumber =
                _random.Next(
                    100,
                    999),

            Message =
                "Sample CNC Alarm",

            Level =
                AlarmLevel.Warning,

            StartTime =
                DateTime.UtcNow.AddSeconds(
                    -_random.Next(
                        10,
                        300)),

            EndTime =
                null,

            IsActive =
                true,

            Description =
                "Simulated alarm generated by Mock CNC Driver",

            ControllerAlarmCode =
                "MOCK-001"
        };
    }

    // =========================================================
    // MACHINE
    // =========================================================

    public Machine GenerateMachine()
    {
        return new Machine
        {
            Id =
                1,

            Name =
                new MachineName(
                    "VMC-01"),

            MachineCode =
                new MachineCode(
                    "VMC-01"),

            IpAddress =
                new IpAddress(
                    "192.168.1.100"),

            Port =
                new PortNumber(
                    8193),

            IsEnabled =
                true,

            Status =
                GenerateMachineStatus(),

            Production =
                GenerateProduction(),

            Runtime =
                GenerateRuntime(),

            Program =
                GenerateProgram(),

            Axis =
                GenerateAxisPosition(),

            Spindle =
                GenerateSpindle(),

            Tool =
                GenerateTool(),

            ActiveAlarm =
                GenerateActiveAlarm()
        };
    }
}
