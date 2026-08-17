import { useEffect, useState } from "react";

import "./MachineDetails.css";

import {
  onSnapshot,
  startCncConnection,
  stopCncConnection,
} from "../services/cncSignalR";

import type { MachineSnapshot } from "../types/cnc";

import {
  getMachineName,
} from "../config/appConfig";

function MachineDetails() {
  const [snapshot, setSnapshot] =
    useState<MachineSnapshot | null>(null);

  const [connected, setConnected] =
    useState(false);

  /*
   * Machine name comes from centralized Settings.
   */
  const configuredMachineName =
    getMachineName();

  // ==========================================================
  // SIGNALR CONNECTION
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    onSnapshot((data) => {
      if (mounted) {
        setSnapshot(data);
        setConnected(true);
      }
    });

    const connect = async () => {
      try {
        await startCncConnection();

        if (mounted) {
          setConnected(true);
        }
      } catch (error) {
        console.error(
          "Machine details SignalR connection failed:",
          error
        );

        if (mounted) {
          setConnected(false);
        }
      }
    };

    connect();

    return () => {
      mounted = false;

      stopCncConnection().catch((error) => {
        console.error(
          "Failed to stop SignalR:",
          error
        );
      });
    };
  }, []);

  // ==========================================================
  // SNAPSHOT DATA
  // ==========================================================

  const machine =
    snapshot?.machine;

  const status =
    snapshot?.status;

  const spindle =
    snapshot?.spindle;

  const program =
    snapshot?.program;

  const tool =
    snapshot?.tool;

  const axis =
    snapshot?.axisPosition;

  const runtime =
    snapshot?.runtime;

  const collectedAt =
    snapshot?.collectedAt;

  // ==========================================================
  // MACHINE STATE
  // ==========================================================

  const getMachineState = () => {
    if (!status) {
      return "UNKNOWN";
    }

    if (status.emergencyStop) {
      return "EMERGENCY";
    }

    if (status.feedHold) {
      return "FEED HOLD";
    }

    if (program?.isRunning) {
      return "RUNNING";
    }

    return "IDLE";
  };

  const machineState =
    getMachineState();

  // ==========================================================
  // FORMAT SECONDS
  // ==========================================================

  const formatSeconds = (
    value?: number | string
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "-";
    }

    const seconds =
      typeof value === "string"
        ? Number(value)
        : value;

    if (!Number.isFinite(seconds)) {
      return "-";
    }

    const total =
      Math.max(
        0,
        Math.floor(seconds)
      );

    const hours =
      Math.floor(
        total / 3600
      );

    const minutes =
      Math.floor(
        (total % 3600) / 60
      );

    const secs =
      total % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDateTime = (
    value?: string
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleString();
  };

  // ==========================================================
  // AXIS DATA
  // ==========================================================

  const axisItems = [
    ["X", axis?.x],
    ["Y", axis?.y],
    ["Z", axis?.z],
    ["A", axis?.a],
    ["B", axis?.b],
    ["C", axis?.c],
  ] as const;

  // ==========================================================
  // DISPLAY MACHINE NAME
  // ==========================================================

  const displayMachineName =
    machine?.name ||
    configuredMachineName;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="machine-details-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="machine-details-header">

        <div>

          <h1>
            Machine Details
          </h1>

          <p>
            {displayMachineName} · Live CNC machine information
          </p>

        </div>


        <div className="machine-connection">

          <span
            className={
              connected
                ? "machine-connection-dot connected"
                : "machine-connection-dot disconnected"
            }
          />

          <span>
            SignalR
          </span>

          <strong>
            {connected
              ? "CONNECTED"
              : "DISCONNECTED"}
          </strong>

        </div>

      </header>


      {/* =====================================================
          WAITING FOR DATA
          ===================================================== */}

      {!snapshot ? (

        <div className="machine-details-empty">

          <div className="machine-loading-indicator" />

          <strong>
            Waiting for CNC data...
          </strong>

          <span>
            Connecting to machine controller
          </span>

        </div>

      ) : (

        <>

          {/* =================================================
              MACHINE OVERVIEW
              ================================================= */}

          <section className="machine-overview-grid">

            <div className="machine-info-card">

              <span className="machine-label">
                MACHINE NAME
              </span>

              <strong className="machine-main-value">
                {displayMachineName}
              </strong>

              <span className="machine-secondary">
                CNC MACHINE
              </span>

            </div>


            <div className="machine-info-card">

              <span className="machine-label">
                MACHINE STATE
              </span>

              <strong
                className={
                  `machine-state-value state-${machineState
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`
                }
              >
                {machineState}
              </strong>

            </div>


            <div className="machine-info-card">

              <span className="machine-label">
                CONTROLLER CONNECTION
              </span>

              <strong
                className={
                  connected
                    ? "machine-online"
                    : "machine-offline"
                }
              >
                {connected
                  ? "ONLINE"
                  : "OFFLINE"}
              </strong>

            </div>


            <div className="machine-info-card">

              <span className="machine-label">
                LAST UPDATE
              </span>

              <strong className="machine-last-update">
                {formatDateTime(
                  collectedAt
                )}
              </strong>

            </div>

          </section>


          {/* =================================================
              MACHINE STATUS
              ================================================= */}

          <section className="machine-section-card">

            <div className="machine-section-title">

              <div>

                <h2>
                  Machine Status
                </h2>

                <p>
                  Controller and machine operating conditions
                </p>

              </div>

            </div>


            <div className="machine-status-grid">

              <div className="machine-status-item">

                <span>
                  POWER
                </span>

                <strong className="indicator-off">
                  N/A
                </strong>

              </div>


              <div className="machine-status-item">

                <span>
                  EMERGENCY STOP
                </span>

                <strong
                  className={
                    status?.emergencyStop
                      ? "indicator-danger"
                      : "indicator-safe"
                  }
                >
                  {status?.emergencyStop
                    ? "ACTIVE"
                    : "NORMAL"}
                </strong>

              </div>


              <div className="machine-status-item">

                <span>
                  FEED HOLD
                </span>

                <strong
                  className={
                    status?.feedHold
                      ? "indicator-warning"
                      : "indicator-safe"
                  }
                >
                  {status?.feedHold
                    ? "ACTIVE"
                    : "NORMAL"}
                </strong>

              </div>


              <div className="machine-status-item">

                <span>
                  PROGRAM
                </span>

                <strong
                  className={
                    program?.isRunning
                      ? "indicator-on"
                      : "indicator-off"
                  }
                >
                  {program?.isRunning
                    ? "RUNNING"
                    : "STOPPED"}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              SPINDLE
              ================================================= */}

          <section className="machine-section-card">

            <div className="machine-section-title">

              <div>

                <h2>
                  Spindle
                </h2>

                <p>
                  Real-time spindle operating parameters
                </p>

              </div>

              <span
                className={
                  spindle?.isRunning
                    ? "section-status running"
                    : "section-status stopped"
                }
              >
                {spindle?.isRunning
                  ? "RUNNING"
                  : "STOPPED"}
              </span>

            </div>


            <div className="machine-metric-grid">

              <div className="machine-metric">

                <span>
                  CURRENT RPM
                </span>

                <strong>
                  {spindle?.currentRpm ?? 0}
                </strong>

                <small>
                  RPM
                </small>

              </div>


              <div className="machine-metric">

                <span>
                  TARGET RPM
                </span>

                <strong>
                  {spindle?.targetRpm ?? 0}
                </strong>

                <small>
                  RPM
                </small>

              </div>


              <div className="machine-metric">

                <span>
                  LOAD
                </span>

                <strong>
                  {spindle?.loadPercentage?.toFixed(
                    1
                  ) ?? "0.0"}
                </strong>

                <small>
                  %
                </small>

              </div>


              <div className="machine-metric">

                <span>
                  POWER
                </span>

                <strong>
                  {spindle?.power?.toFixed(
                    2
                  ) ?? "0.00"}
                </strong>

                <small>
                  kW
                </small>

              </div>


              <div className="machine-metric">

                <span>
                  TEMPERATURE
                </span>

                <strong>
                  {spindle?.temperature?.toFixed(
                    1
                  ) ?? "0.0"}
                </strong>

                <small>
                  °C
                </small>

              </div>

            </div>

          </section>


          {/* =================================================
              AXIS POSITION
              ================================================= */}

          <section className="machine-section-card">

            <div className="machine-section-title">

              <div>

                <h2>
                  Axis Position
                </h2>

                <p>
                  Current machine coordinate positions
                </p>

              </div>

            </div>


            <div className="machine-axis-grid">

              {axisItems.map(
                ([name, value]) => (

                  <div
                    className="machine-axis-card"
                    key={name}
                  >

                    <span>
                      {name}
                    </span>

                    <strong>
                      {typeof value ===
                      "number"
                        ? value.toFixed(3)
                        : "0.000"}
                    </strong>

                    <small>
                      mm
                    </small>

                  </div>

                )
              )}

            </div>

          </section>


          {/* =================================================
              PROGRAM + TOOL
              ================================================= */}

          <section className="machine-two-column">

            <div className="machine-section-card">

              <div className="machine-section-title">

                <div>

                  <h2>
                    Current Program
                  </h2>

                  <p>
                    CNC program information
                  </p>

                </div>

              </div>


              <div className="machine-program-content">

                <div>

                  <span>
                    PROGRAM NUMBER
                  </span>

                  <strong>
                    {program?.programNumber ??
                      "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    PROGRAM NAME
                  </span>

                  <strong>
                    {program?.programName ??
                      "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    PROGRESS
                  </span>

                  <strong>
                    {program?.progress?.toFixed(
                      1
                    ) ?? "0.0"}
                    %
                  </strong>

                </div>

              </div>

            </div>


            <div className="machine-section-card">

              <div className="machine-section-title">

                <div>

                  <h2>
                    Current Tool
                  </h2>

                  <p>
                    Active cutting tool
                  </p>

                </div>

              </div>


              <div className="machine-tool-content">

                <div className="machine-tool-number">
                  T
                  {tool?.toolNumber ?? "-"}
                </div>

                <div>

                  <span>
                    TOOL NAME
                  </span>

                  <strong>
                    {tool?.toolName ?? "-"}
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              RUNTIME
              ================================================= */}

          <section className="machine-section-card">

            <div className="machine-section-title">

              <div>

                <h2>
                  Machine Runtime
                </h2>

                <p>
                  Accumulated machine operating time
                </p>

              </div>

            </div>


            <div className="machine-runtime-grid">

              <div>

                <span>
                  POWER ON
                </span>

                <strong>
                  {formatSeconds(
                    runtime?.powerOnTime
                  )}
                </strong>

              </div>


              <div>

                <span>
                  RUNNING
                </span>

                <strong>
                  {formatSeconds(
                    runtime?.runningTime
                  )}
                </strong>

              </div>


              <div>

                <span>
                  IDLE
                </span>

                <strong>
                  {formatSeconds(
                    runtime?.idleTime
                  )}
                </strong>

              </div>


              <div>

                <span>
                  ALARM
                </span>

                <strong>
                  {formatSeconds(
                    runtime?.alarmTime
                  )}
                </strong>

              </div>


              <div>

                <span>
                  STOPPED
                </span>

                <strong>
                  {formatSeconds(
                    runtime?.stoppedTime
                  )}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              FOOTER
              ================================================= */}

          <footer className="machine-details-footer">

            <span>
              Live machine data via SignalR
            </span>

            <span>
              Machine:{" "}
              {displayMachineName}
            </span>

            <span>
              Last update:{" "}
              {formatDateTime(
                collectedAt
              )}
            </span>

          </footer>

        </>
      )}

    </div>
  );
}

export default MachineDetails;