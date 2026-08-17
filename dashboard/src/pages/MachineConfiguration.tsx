import { useCallback, useEffect, useState } from "react";

type ControllerType =
  | "Unknown"
  | "Fanuc"
  | "Siemens"
  | "Mitsubishi"
  | "Haas"
  | "Mazak"
  | "Okuma"
  | "Mock";

interface Machine {
  id: number;
  name: string;
  machineCode: string;
  ipAddress: string;
  port: number;
  controllerType: ControllerType | string;
  isEnabled: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface MachineForm {
  id: number;
  name: string;
  machineCode: string;
  ipAddress: string;
  port: number;
  controllerType: string;
  isEnabled: boolean;
}

const API_BASE = "/api/cnc/machines";

const EMPTY_FORM: MachineForm = {
  id: 0,
  name: "",
  machineCode: "",
  ipAddress: "",
  port: 8193,
  controllerType: "Mock",
  isEnabled: true,
};

const CONTROLLER_TYPES = [
  "Unknown",
  "Fanuc",
  "Siemens",
  "Mitsubishi",
  "Haas",
  "Mazak",
  "Okuma",
  "Mock",
];

export default function MachineConfiguration() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [form, setForm] = useState<MachineForm>(EMPTY_FORM);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [testingId, setTestingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(
    () => {
      const stored = localStorage.getItem("cnc:selectedMachineId");
      return stored ? Number(stored) : null;
    },
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD MACHINES
  // ============================================================

  const loadMachines = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_BASE);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: ApiResponse<Machine[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Unable to load machines.");
      }

      setMachines(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load machine configuration.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMachines();
  }, [loadMachines]);

  // ============================================================
  // FORM HELPERS
  // ============================================================

  const updateForm = <K extends keyof MachineForm>(
    field: K,
    value: MachineForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditing(false);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (machine: Machine) => {
    setForm({
      id: machine.id,
      name: machine.name ?? "",
      machineCode: machine.machineCode ?? "",
      ipAddress: machine.ipAddress ?? "",
      port: machine.port ?? 8193,
      controllerType: machine.controllerType ?? "Unknown",
      isEnabled: machine.isEnabled,
    });

    setEditing(true);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditing(false);
    setForm(EMPTY_FORM);
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return "Machine name is required.";
    }

    if (!form.machineCode.trim()) {
      return "Machine code is required.";
    }

    if (!form.ipAddress.trim()) {
      return "IP address is required.";
    }

    if (!form.port || form.port < 1 || form.port > 65535) {
      return "Port must be between 1 and 65535.";
    }

    if (!form.controllerType.trim()) {
      return "Controller type is required.";
    }

    return null;
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const saveMachine = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        id: form.id,
        name: form.name.trim(),
        machineCode: form.machineCode.trim(),
        ipAddress: form.ipAddress.trim(),
        port: Number(form.port),
        controllerType: form.controllerType,
        isEnabled: form.isEnabled,
      };

      const url = editing
        ? `${API_BASE}/${form.id}`
        : API_BASE;

      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<Machine> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Unable to ${editing ? "update" : "create"} machine.`,
        );
      }

      setSuccess(
        editing
          ? "Machine updated successfully."
          : "Machine created successfully.",
      );

      setShowForm(false);
      setEditing(false);
      setForm(EMPTY_FORM);

      await loadMachines();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save machine.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ENABLE / DISABLE
  // ============================================================

  const toggleMachine = async (machine: Machine) => {
    try {
      setError("");
      setSuccess("");

      const action = machine.isEnabled ? "disable" : "enable";

      const response = await fetch(
        `${API_BASE}/${machine.id}/${action}`,
        {
          method: "POST",
        },
      );

      const result: ApiResponse<Machine> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Unable to ${action} machine.`,
        );
      }

      if (machine.isEnabled && selectedMachineId === machine.id) {
        localStorage.removeItem("cnc:selectedMachineId");
        setSelectedMachineId(null);

        window.dispatchEvent(
          new Event("cnc:selectedMachineChanged"),
        );
      }

      setSuccess(
        machine.isEnabled
          ? `${machine.name} disabled.`
          : `${machine.name} enabled.`,
      );

      await loadMachines();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change machine state.",
      );
    }
  };

  // ============================================================
  // TEST CONNECTION
  // ============================================================

  const testConnection = async (machine: Machine) => {
    try {
      setTestingId(machine.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE}/${machine.id}/test-connection`,
        {
          method: "POST",
        },
      );

      const result: ApiResponse<{
        connected: boolean;
        message: string;
      }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Connection test failed.",
        );
      }

      if (result.data?.connected) {
        setSuccess(
          `${machine.name}: connection configuration is valid.`,
        );
      } else {
        setError(
          `${machine.name}: connection test failed.`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to test connection.",
      );
    } finally {
      setTestingId(null);
    }
  };

  // ============================================================
  // SELECT MACHINE
  // ============================================================

  const selectMachine = (machine: Machine) => {
    if (!machine.isEnabled) {
      setError("Disabled machine cannot be selected.");
      return;
    }

    localStorage.setItem(
      "cnc:selectedMachineId",
      String(machine.id),
    );

    setSelectedMachineId(machine.id);

    // Notify the global SignalR connection manager in App.tsx.
    // localStorage "storage" events do not fire in the same tab.
    window.dispatchEvent(
      new Event("cnc:selectedMachineChanged"),
    );

    setError("");
    setSuccess(`${machine.name} selected for live dashboard.`);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteMachine = async (machine: Machine) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${machine.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(machine.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE}/${machine.id}`,
        {
          method: "DELETE",
        },
      );

      const result: ApiResponse<unknown> =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete machine.",
        );
      }

      if (selectedMachineId === machine.id) {
        localStorage.removeItem("cnc:selectedMachineId");
        setSelectedMachineId(null);

        window.dispatchEvent(
          new Event("cnc:selectedMachineChanged"),
        );
      }

      setSuccess(`${machine.name} deleted successfully.`);

      await loadMachines();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete machine.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="page-container">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <h1>Machine Configuration</h1>
          <p>
            Configure CNC machines, controller settings and
            connection parameters.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Machine
        </button>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}

      {/* ======================================================
          MACHINE SUMMARY
      ====================================================== */}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Machines</span>
          <strong>{machines.length}</strong>
        </div>

        <div className="summary-card">
          <span>Enabled</span>
          <strong>
            {machines.filter((machine) => machine.isEnabled).length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Disabled</span>
          <strong>
            {machines.filter((machine) => !machine.isEnabled).length}
          </strong>
        </div>
      </div>

      {/* ======================================================
          MACHINE TABLE
      ====================================================== */}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Machines</h2>
            <span>
              {machines.length} configured machine
              {machines.length === 1 ? "" : "s"}
            </span>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadMachines()}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading machine configuration...</p>
          </div>
        ) : machines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚙</div>

            <h3>No machines configured</h3>

            <p>
              Add your first CNC machine to start configuring
              machine connections.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={openAddForm}
            >
              + Add Machine
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="machine-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Code</th>
                  <th>Controller</th>
                  <th>IP Address</th>
                  <th>Port</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {machines.map((machine) => (
                  <tr
                    key={machine.id}
                    className={
                      selectedMachineId === machine.id
                        ? "machine-row-selected"
                        : ""
                    }
                  >
                    <td>
                      <div className="machine-name">
                        <strong>{machine.name}</strong>
                        <small>ID: {machine.id}</small>
                      </div>
                    </td>

                    <td>
                      <span className="code-badge">
                        {machine.machineCode}
                      </span>
                    </td>

                    <td>
                      {machine.controllerType || "Unknown"}
                    </td>

                    <td>
                      <span className="mono">
                        {machine.ipAddress}
                      </span>
                    </td>

                    <td>
                      <span className="mono">
                        {machine.port}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          machine.isEnabled
                            ? "status-badge status-enabled"
                            : "status-badge status-disabled"
                        }
                      >
                        <span className="status-dot" />
                        {machine.isEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className={
                            selectedMachineId === machine.id
                              ? "icon-button selected"
                              : "icon-button"
                          }
                          title={
                            selectedMachineId === machine.id
                              ? "Currently selected machine"
                              : "Select machine for live dashboard"
                          }
                          onClick={() => selectMachine(machine)}
                          disabled={!machine.isEnabled}
                        >
                          {selectedMachineId === machine.id
                            ? "✓ Selected"
                            : "Select"}
                        </button>

                        <button
                          type="button"
                          className="icon-button"
                          title="Test connection"
                          onClick={() =>
                            void testConnection(machine)
                          }
                          disabled={
                            testingId === machine.id
                          }
                        >
                          {testingId === machine.id
                            ? "..."
                            : "Test"}
                        </button>

                        <button
                          type="button"
                          className="icon-button"
                          title="Edit machine"
                          onClick={() =>
                            openEditForm(machine)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="icon-button"
                          title={
                            machine.isEnabled
                              ? "Disable machine"
                              : "Enable machine"
                          }
                          onClick={() =>
                            void toggleMachine(machine)
                          }
                        >
                          {machine.isEnabled
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          className="icon-button danger"
                          title="Delete machine"
                          onClick={() =>
                            void deleteMachine(machine)
                          }
                          disabled={
                            deletingId === machine.id
                          }
                        >
                          {deletingId === machine.id
                            ? "..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="machine-config-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="machine-config-title">
                  {editing
                    ? "Edit Machine"
                    : "Add Machine"}
                </h2>

                <p>
                  {editing
                    ? "Update CNC machine configuration."
                    : "Add a new CNC machine configuration."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Machine Name */}

              <div className="form-group">
                <label htmlFor="machine-name">
                  Machine Name
                </label>

                <input
                  id="machine-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. CNC Machine 01"
                  autoComplete="off"
                />
              </div>

              {/* Machine Code */}

              <div className="form-group">
                <label htmlFor="machine-code">
                  Machine Code
                </label>

                <input
                  id="machine-code"
                  type="text"
                  value={form.machineCode}
                  onChange={(event) =>
                    updateForm(
                      "machineCode",
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="e.g. CNC-001"
                  autoComplete="off"
                />
              </div>

              {/* Controller */}

              <div className="form-group">
                <label htmlFor="controller-type">
                  Controller Type
                </label>

                <select
                  id="controller-type"
                  value={form.controllerType}
                  onChange={(event) =>
                    updateForm(
                      "controllerType",
                      event.target.value,
                    )
                  }
                >
                  {CONTROLLER_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* IP + Port */}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ip-address">
                    IP Address
                  </label>

                  <input
                    id="ip-address"
                    type="text"
                    value={form.ipAddress}
                    onChange={(event) =>
                      updateForm(
                        "ipAddress",
                        event.target.value,
                      )
                    }
                    placeholder="192.168.1.100"
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="port">
                    Port
                  </label>

                  <input
                    id="port"
                    type="number"
                    min={1}
                    max={65535}
                    value={form.port}
                    onChange={(event) =>
                      updateForm(
                        "port",
                        Number(event.target.value),
                      )
                    }
                  />
                </div>
              </div>

              {/* Enable */}

              <div className="toggle-row">
                <div>
                  <strong>Machine Enabled</strong>
                  <span>
                    Enable this machine for CNC data
                    collection.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    form.isEnabled
                      ? "toggle toggle-on"
                      : "toggle"
                  }
                  onClick={() =>
                    updateForm(
                      "isEnabled",
                      !form.isEnabled,
                    )
                  }
                  aria-pressed={form.isEnabled}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => void saveMachine()}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Machine"
                    : "Create Machine"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          PAGE STYLES
      ====================================================== */}

      <style>{`
        .page-container {
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 0 0 6px;
          font-size: 28px;
          font-weight: 700;
        }

        .page-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-card span {
          color: #6b7280;
          font-size: 13px;
        }

        .summary-card strong {
          font-size: 26px;
          color: #111827;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .card-header {
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-header h2 {
          margin: 0 0 4px;
          font-size: 17px;
        }

        .card-header span {
          color: #6b7280;
          font-size: 12px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .machine-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 950px;
        }

        .machine-table th {
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
          padding: 13px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .machine-table td {
          padding: 15px 16px;
          border-bottom: 1px solid #f0f1f3;
          color: #374151;
          font-size: 13px;
          vertical-align: middle;
        }

        .machine-table tbody tr:hover {
          background: #fafafa;
        }

        .machine-table tbody tr.machine-row-selected {
          background: rgba(37, 99, 235, 0.08);
        }

        .machine-table tbody tr.machine-row-selected:hover {
          background: rgba(37, 99, 235, 0.12);
        }

        .icon-button.selected {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }

        .machine-name {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .machine-name strong {
          color: #111827;
        }

        .machine-name small {
          color: #9ca3af;
          font-size: 11px;
        }

        .code-badge {
          display: inline-flex;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #374151;
          font-family: monospace;
          font-size: 11px;
        }

        .mono {
          font-family: monospace;
          color: #374151;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-enabled {
          background: #ecfdf5;
          color: #047857;
        }

        .status-disabled {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .icon-button {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          border-radius: 6px;
          padding: 6px 9px;
          font-size: 11px;
          cursor: pointer;
        }

        .icon-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .icon-button.danger {
          color: #dc2626;
          border-color: #fecaca;
        }

        .icon-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .primary-button,
        .secondary-button {
          border-radius: 7px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .primary-button {
          border: 1px solid #1d4ed8;
          background: #2563eb;
          color: #ffffff;
        }

        .primary-button:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .secondary-button {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
        }

        .secondary-button:hover:not(:disabled) {
          background: #f9fafb;
        }

        .primary-button:disabled,
        .secondary-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
        }

        .alert button {
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .alert-success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #6b7280;
        }

        .empty-state h3 {
          margin: 12px 0 6px;
          color: #374151;
        }

        .empty-state p {
          margin: 0 0 18px;
          font-size: 13px;
        }

        .empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f3f4f6;
          font-size: 22px;
        }

        .loading-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          margin: 0 auto 12px;
          animation: machine-spin 0.8s linear infinite;
        }

        @keyframes machine-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(17, 24, 39, 0.55);
        }

        .modal {
          width: min(520px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0 0 5px;
          font-size: 19px;
        }

        .modal-header p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: 0;
          background: #f3f4f6;
          border-radius: 7px;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-body {
          padding: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 11px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          outline: none;
          background: #ffffff;
          color: #111827;
          font-size: 13px;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 140px;
          gap: 12px;
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
        }

        .toggle-row > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toggle-row strong {
          font-size: 13px;
          color: #374151;
        }

        .toggle-row span {
          font-size: 11px;
          color: #6b7280;
        }

        .toggle {
          width: 44px;
          height: 24px;
          padding: 2px;
          border: 0;
          border-radius: 999px;
          background: #d1d5db;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: 0.15s ease;
        }

        .toggle-on {
          background: #2563eb;
          justify-content: flex-end;
        }

        .toggle-knob {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 800px) {
          .page-container {
            padding: 16px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
