import { NavLink, Routes, Route, Navigate } from "react-router-dom";

import MachineHistory from "./MachineHistory";
import AxisHistory from "./AxisHistory";
import AlarmHistory from "./AlarmHistory";

import "./History.css";

function History() {
  return (
    <div className="history-page">

      <header className="history-header">
        <div>
          <h1>Machine History</h1>
          <p>
            Historical CNC machine monitoring and production data
          </p>
        </div>
      </header>

      <nav className="history-tabs">

        <NavLink
          to="/history/machine"
          className={({ isActive }) =>
            isActive
              ? "history-tab active"
              : "history-tab"
          }
        >
          MACHINE
        </NavLink>

        <NavLink
          to="/history/axis"
          className={({ isActive }) =>
            isActive
              ? "history-tab active"
              : "history-tab"
          }
        >
          AXIS
        </NavLink>

        <NavLink
          to="/history/alarms"
          className={({ isActive }) =>
            isActive
              ? "history-tab active"
              : "history-tab"
          }
        >
          ALARMS
        </NavLink>

      </nav>

      <div className="history-content">

        <Routes>

          <Route
            index
            element={
              <Navigate
                to="machine"
                replace
              />
            }
          />

          <Route
            path="machine"
            element={<MachineHistory />}
          />

          <Route
            path="axis"
            element={<AxisHistory />}
          />

          <Route
            path="alarms"
            element={<AlarmHistory />}
          />

        </Routes>

      </div>

    </div>
  );
}

export default History;