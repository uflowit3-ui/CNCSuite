import { NavLink } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  return (
    <nav className="navigation">

      <div className="navigation-brand">
        <span className="navigation-title">
          CNC Dashboard
        </span>
      </div>

      <div className="navigation-links">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `navigation-link ${
              isActive ? "active" : ""
            }`
          }
        >
          Live
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `navigation-link ${
              isActive ? "active" : ""
            }`
          }
        >
          History
        </NavLink>

      </div>

    </nav>
  );
}

export default Navigation;