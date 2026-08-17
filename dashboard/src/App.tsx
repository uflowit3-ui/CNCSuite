import { useEffect, useState } from "react";

import {
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import {
  onSnapshot,
  onConnectionChange,
  startCncConnection,
} from "./services/cncSignalR";

import type { MachineSnapshot } from "./types/cnc";

import MachineHistory from "./pages/MachineHistory";
import Oee from "./pages/Oee";
import Reports from "./pages/Reports";
import ProductionHistory from "./pages/ProductionHistory";
//import MachineDetails from "./pages/MachineDetails";
import MachineConfiguration from "./pages/MachineConfiguration";
import Settings from "./pages/Settings";
import AlarmHistory from "./pages/AlarmHistory";

import {
  getMachineName,
} from "./config/appConfig";

import "./App.css";

// ============================================================
// LIVE CNC DASHBOARD
// ============================================================

function LiveDashboard() {
  const [snapshot, setSnapshot] =
    useState<MachineSnapshot | null>(null);

  const [connected, setConnected] =
    useState(false);

  // ==========================================================
  // SIGNALR SNAPSHOT / CONNECTION LISTENERS
  // ==========================================================
  useEffect(() => {
    let mounted = true;

    const removeSnapshotListener = onSnapshot((data) => {
      if (mounted) {
        setSnapshot(data);
      }
    });

    const removeConnectionListener =
      onConnectionChange((isConnected) => {
        if (mounted) {
          setConnected(isConnected);
        }
      });

    return () => {
      mounted = false;
      removeSnapshotListener();
      removeConnectionListener();
    };
  }, []);

  // ==========================================================
  // SNAPSHOT DATA
  // ==========================================================

  const machine =
    snapshot?.machine;

  const status =
    snapshot?.status;

  const production =
    snapshot?.production;

  const spindle =
    snapshot?.spindle;

  const tool =
    snapshot?.tool;

  const program =
    snapshot?.program;

  const axis =
    snapshot?.axisPosition;

  const alarm =
    snapshot?.activeAlarm;

  // ==========================================================
  // MACHINE NAME
  // ==========================================================

  /*
   * Priority:
   *
   * 1. Actual machine name received from SignalR
   * 2. Machine name configured in Settings
   *
   * This removes the hard-coded VMC-01 dependency.
   */

  const configuredMachineName =
    getMachineName();

  const displayMachineName =
    machine?.name ||
    configuredMachineName;

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

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div>

          <h1>
            CNC Dashboard
          </h1>

          <div className="machine-name">
            {displayMachineName}
          </div>

        </div>


        <div className="connection-status">

          <span
            className={
              connected
                ? "status-dot connected"
                : "status-dot disconnected"
            }
          />

          SignalR:{" "}

          <strong>
            {connected
              ? "CONNECTED"
              : "DISCONNECTED"}
          </strong>

        </div>

      </header>


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!snapshot ? (

        <div className="empty-state">
          Waiting for CNC snapshot...
        </div>

      ) : (

        <>

          {/* =================================================
              MACHINE STATUS
          ================================================= */}

          <section className="grid status-grid">

            <div className="card status-card">

              <span className="label">
                MACHINE STATUS
              </span>

              <strong className="big-value">
                {getMachineState()}
              </strong>

            </div>


            <div className="card">

              <span className="label">
                PART COUNT
              </span>

              <strong className="big-value">
                {production?.partCount ?? 0}
              </strong>

              <span className="sub-value">
                Target:{" "}
                {production?.targetQuantity ?? 0}
              </span>

            </div>


            <div className="card">

              <span className="label">
                PROGRAM
              </span>

              <strong className="big-value">
                {program?.programNumber ?? "-"}
              </strong>

              <span className="sub-value">
                {program?.programName ?? "-"}
              </span>

            </div>


            <div className="card">

              <span className="label">
                PROGRAM PROGRESS
              </span>

              <strong className="big-value">
                {program?.progress?.toFixed(1) ?? 0}%
              </strong>

            </div>

          </section>


          {/* =================================================
              PRODUCTION
          ================================================= */}

          <section className="grid">

            <div className="card">

              <span className="label">
                GOOD PARTS
              </span>

              <strong className="big-value">
                {production?.goodPartCount ?? 0}
              </strong>

            </div>


            <div className="card">

              <span className="label">
                REJECT PARTS
              </span>

              <strong className="big-value">
                {production?.rejectPartCount ?? 0}
              </strong>

            </div>


            <div className="card">

              <span className="label">
                CYCLE TIME
              </span>

              <strong className="big-value">
                {production?.cycleTime ?? "-"}
              </strong>

            </div>


            <div className="card">

              <span className="label">
                TOOL
              </span>

              <strong className="big-value">
                T{tool?.toolNumber ?? "-"}
              </strong>

              <span className="sub-value">
                {tool?.toolName ?? "-"}
              </span>

            </div>

          </section>


          {/* =================================================
              SPINDLE
          ================================================= */}

          <section className="card section-card">

            <h2>
              Spindle
            </h2>

            <div className="data-grid">

              <div>

                <span className="label">
                  CURRENT RPM
                </span>

                <strong>
                  {spindle?.currentRpm ?? 0}
                </strong>

              </div>


              <div>

                <span className="label">
                  TARGET RPM
                </span>

                <strong>
                  {spindle?.targetRpm ?? 0}
                </strong>

              </div>


              <div>

                <span className="label">
                  LOAD
                </span>

                <strong>
                  {spindle?.loadPercentage?.toFixed(1) ?? 0}%
                </strong>

              </div>


              <div>

                <span className="label">
                  POWER
                </span>

                <strong>
                  {spindle?.power?.toFixed(2) ?? 0}
                </strong>

              </div>


              <div>

                <span className="label">
                  TEMPERATURE
                </span>

                <strong>
                  {spindle?.temperature?.toFixed(1) ?? 0} °C
                </strong>

              </div>


              <div>

                <span className="label">
                  STATE
                </span>

                <strong>
                  {spindle?.isRunning
                    ? "RUNNING"
                    : "STOPPED"}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              AXIS POSITION
          ================================================= */}

          <section className="card section-card">

            <h2>
              Axis Position
            </h2>

            <div className="axis-grid">

              {[
                ["X", axis?.x],
                ["Y", axis?.y],
                ["Z", axis?.z],
                ["A", axis?.a],
                ["B", axis?.b],
                ["C", axis?.c],
              ].map(([name, value]) => (

                <div
                  className="axis-item"
                  key={name}
                >

                  <span>
                    {name}
                  </span>

                  <strong>
                    {typeof value === "number"
                      ? value.toFixed(3)
                      : "0.000"}
                  </strong>

                </div>

              ))}

            </div>

          </section>


          {/* =================================================
              ALARM
          ================================================= */}

          <section className="card section-card">

            <h2>
              Active Alarm
            </h2>

            {alarm ? (

              <div className="alarm">

                <strong>
                  Alarm #{alarm.alarmNumber}
                </strong>

                <span>
                  {alarm.message}
                </span>

                <span>
                  {alarm.description}
                </span>

                <span>
                  Code:{" "}
                  {alarm.controllerAlarmCode}
                </span>

              </div>

            ) : (

              <div className="no-alarm">
                No active alarm
              </div>

            )}

          </section>


          {/* =================================================
              FOOTER
          ================================================= */}

          <footer>

            Machine:{" "}
            {displayMachineName}

            {" | "}

            Last update:{" "}

            {snapshot.collectedAt
              ? new Date(
                  snapshot.collectedAt
                ).toLocaleString()
              : "-"}

          </footer>

        </>

      )}

    </div>
  );
}


// ============================================================
// MAIN APP / ROUTER
// ============================================================

function getSelectedMachineId(): number | null {
  try {
    const stored = localStorage.getItem("cnc:selectedMachineId");

    if (!stored) {
      return null;
    }

    const machineId = Number(stored);

    return Number.isInteger(machineId) && machineId > 0
      ? machineId
      : null;
  } catch {
    return null;
  }
}

function App() {
  // ============================================================
  // GLOBAL CNC SIGNALR CONNECTION
  // ============================================================
  // Keep SignalR alive while navigating between pages.
  // The previous implementation stopped the connection whenever
  // LiveDashboard unmounted (for example when opening /machines).
  useEffect(() => {
    let disposed = false;

    const getOrSelectMachine = async (): Promise<number | null> => {
      const selected = getSelectedMachineId();

      if (selected !== null) {
        return selected;
      }

      try {
        const response = await fetch("/api/cnc/machines");

        if (!response.ok) {
          throw new Error(
            `Machine API returned HTTP ${response.status}`,
          );
        }

        const result = (await response.json()) as {
          success: boolean;
          data?: Array<{
            id: number;
            isEnabled: boolean;
          }>;
          message?: string;
        };

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load machines.",
          );
        }

        const firstEnabledMachine =
          result.data?.find(
            (machine) =>
              machine.isEnabled &&
              Number.isInteger(machine.id) &&
              machine.id > 0,
          );

        if (!firstEnabledMachine) {
          console.warn(
            "[CNC] No enabled machine is configured.",
          );
          return null;
        }

        localStorage.setItem(
          "cnc:selectedMachineId",
          String(firstEnabledMachine.id),
        );

        return firstEnabledMachine.id;
      } catch (error) {
        console.error(
          "[CNC] Failed to determine selected machine:",
          error,
        );

        return null;
      }
    };

    const connect = async () => {
      await getOrSelectMachine();

      if (disposed) {
        return;
      }

      try {
        await startCncConnection();

        console.info(
          "[CNC] Global SignalR connection ready.",
        );
      } catch (error) {
        console.error(
          "[CNC] Global SignalR connection failed:",
          error,
        );
      }
    };

    // const handleMachineChanged = () => {
    //   getSelectedMachineId();

    //   void startCncConnection().catch(
    //     (error) => {
    //       console.error(
    //         "[CNC] Failed to switch machine subscription:",
    //         error,
    //       );
    //     },
    //   );
    // };

    const handleMachineChanged = () => {
      const machineId = getSelectedMachineId();

      if (machineId === null) {
        console.warn(
          "[CNC] No selected machine.",
        );

        return;
      }

      console.info(
        `[CNC] Switching SignalR to machine-${machineId}`,
      );

      void startCncConnection(machineId).catch(
        (error) => {
          console.error(
            "[CNC] Failed to switch machine subscription:",
            error,
          );
        },
      );
    };

    window.addEventListener(
      "cnc:selectedMachineChanged",
      handleMachineChanged,
    );

    window.addEventListener(
      "storage",
      handleMachineChanged,
    );

    void connect();

    // IMPORTANT:
    // Do not call stopCncConnection() here.
    // SignalR must remain alive across route changes.
    return () => {
      disposed = true;

      window.removeEventListener(
        "cnc:selectedMachineChanged",
        handleMachineChanged,
      );

      window.removeEventListener(
        "storage",
        handleMachineChanged,
      );
    };
  }, []);

  return (
    <>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="main-navigation">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          LIVE
        </NavLink>


        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          HISTORY
        </NavLink>


        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Reports
        </NavLink>


        <NavLink
          to="/production-history"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Production History
        </NavLink>


        <NavLink
          to="/oee"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          OEE
        </NavLink>


        {/* <NavLink
          to="/machines"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Machine
        </NavLink> */}

        <NavLink
          to="/machines"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Machine Configuration
        </NavLink>


        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Settings
        </NavLink>

      </nav>


      {/* =====================================================
          ROUTES
      ===================================================== */}

      <Routes>

        <Route
          path="/"
          element={<LiveDashboard />}
        />


        <Route
          path="/history"
          element={<MachineHistory />}
        />


        <Route
          path="/oee"
          element={<Oee />}
        />


        <Route
          path="/reports"
          element={<Reports />}
        />


        <Route
          path="/production-history"
          element={<ProductionHistory />}
        />


        {/* <Route
          path="/machine"
          element={<MachineDetails />}
        /> */}

        <Route
          path="/machines"
          element={<MachineConfiguration />}
        />


        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/alarm-history"
          element={<AlarmHistory />}
        />

      </Routes>

    </>
  );
}

export default App;
