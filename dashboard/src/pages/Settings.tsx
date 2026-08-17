import { useEffect, useState } from "react";
import "./Settings.css";

import {
  DEFAULT_SETTINGS,
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
} from "../config/appConfig";

import type {
  AppSettings,
} from "../config/appConfig";

function Settings() {
  const [settings, setSettings] =
    useState<AppSettings>(DEFAULT_SETTINGS);

  const [saved, setSaved] =
    useState(false);

  /* =========================================================
     LOAD SETTINGS
     ========================================================= */

  useEffect(() => {
    setSettings(getAppSettings());
  }, []);

  /* =========================================================
     UPDATE SETTING
     ========================================================= */

  const updateSetting = <
    K extends keyof AppSettings
  >(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  /* =========================================================
     SAVE SETTINGS
     ========================================================= */

  const handleSave = () => {
    const normalizedSettings: AppSettings = {
      apiBaseUrl:
        settings.apiBaseUrl
          .trim()
          .replace(/\/+$/, "") ||
        DEFAULT_SETTINGS.apiBaseUrl,

      machineName:
        settings.machineName.trim() ||
        DEFAULT_SETTINGS.machineName,

      refreshInterval: Math.max(
        1,
        Math.min(
          60,
          Number(settings.refreshInterval) ||
            DEFAULT_SETTINGS.refreshInterval
        )
      ),

      historyCount: Math.max(
        10,
        Math.min(
          5000,
          Number(settings.historyCount) ||
            DEFAULT_SETTINGS.historyCount
        )
      ),

      idealCycleTime: Math.max(
        0.001,
        Number(settings.idealCycleTime) ||
          DEFAULT_SETTINGS.idealCycleTime
      ),
    };

    saveAppSettings(normalizedSettings);

    setSettings(normalizedSettings);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =========================================================
     RESET SETTINGS
     ========================================================= */

  const handleReset = () => {
    resetAppSettings();

    setSettings({
      ...DEFAULT_SETTINGS,
    });

    setSaved(false);
  };

  /* =========================================================
     NORMALIZED VALUES
     ========================================================= */

  const refreshInterval = Math.max(
    1,
    Math.min(
      60,
      Number(settings.refreshInterval) || 5
    )
  );

  const historyCount = Math.max(
    10,
    Math.min(
      5000,
      Number(settings.historyCount) || 300
    )
  );

  const idealCycleTime = Math.max(
    0.001,
    Number(settings.idealCycleTime) || 12.5
  );

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="settings-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="settings-header">

        <div>
          <h1>
            Settings
          </h1>

          <p>
            CNC dashboard and machine configuration
          </p>
        </div>

        <div className="settings-header-status">

          <span className="settings-status-dot" />

          <span>
            LOCAL CONFIGURATION
          </span>

        </div>

      </header>


      {/* =====================================================
          CONNECTION
          ===================================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>
            <h2>
              Connection
            </h2>

            <p>
              Configure the CNC API connection
            </p>
          </div>

          <span className="settings-section-badge">
            API
          </span>

        </div>


        <div className="settings-form-grid">

          <div className="settings-field settings-field-full">

            <label htmlFor="apiBaseUrl">
              API BASE URL
            </label>

            <input
              id="apiBaseUrl"
              type="text"
              value={settings.apiBaseUrl}
              onChange={(event) =>
                updateSetting(
                  "apiBaseUrl",
                  event.target.value
                )
              }
              placeholder="http://localhost:5005"
              spellCheck={false}
              autoComplete="off"
            />

            <small>
              Base URL used by the CNC dashboard API.
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          MACHINE
          ===================================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>
            <h2>
              Machine
            </h2>

            <p>
              Machine identification and runtime configuration
            </p>
          </div>

          <span className="settings-section-badge">
            CNC
          </span>

        </div>


        <div className="settings-form-grid">

          {/* MACHINE NAME */}

          <div className="settings-field">

            <label htmlFor="machineName">
              MACHINE NAME
            </label>

            <input
              id="machineName"
              type="text"
              value={settings.machineName}
              onChange={(event) =>
                updateSetting(
                  "machineName",
                  event.target.value
                )
              }
              placeholder="VMC-01"
              autoComplete="off"
            />

            <small>
              Display name shown throughout the dashboard.
            </small>

          </div>


          {/* AUTO REFRESH */}

          <div className="settings-field">

            <label htmlFor="refreshInterval">
              AUTO REFRESH
            </label>

            <div className="settings-input-unit">

              <input
                id="refreshInterval"
                type="number"
                min="1"
                max="60"
                step="1"
                value={settings.refreshInterval}
                onChange={(event) =>
                  updateSetting(
                    "refreshInterval",
                    Number(event.target.value)
                  )
                }
              />

              <span>
                sec
              </span>

            </div>

            <small>
              Dashboard refresh interval from 1 to 60 seconds.
            </small>

          </div>


          {/* HISTORY COUNT */}

          <div className="settings-field">

            <label htmlFor="historyCount">
              HISTORY RECORDS
            </label>

            <input
              id="historyCount"
              type="number"
              min="10"
              max="5000"
              step="10"
              value={settings.historyCount}
              onChange={(event) =>
                updateSetting(
                  "historyCount",
                  Number(event.target.value)
                )
              }
            />

            <small>
              Number of historical records requested from API.
            </small>

          </div>


          {/* IDEAL CYCLE TIME */}

          <div className="settings-field">

            <label htmlFor="idealCycleTime">
              IDEAL CYCLE TIME
            </label>

            <div className="settings-input-unit">

              <input
                id="idealCycleTime"
                type="number"
                min="0.001"
                step="0.1"
                value={settings.idealCycleTime}
                onChange={(event) =>
                  updateSetting(
                    "idealCycleTime",
                    Number(event.target.value)
                  )
                }
              />

              <span>
                sec
              </span>

            </div>

            <small>
              Ideal cycle time used for OEE performance calculation.
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          CURRENT CONFIGURATION
          ===================================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>
            <h2>
              Current Configuration
            </h2>

            <p>
              Active configuration stored in this browser
            </p>
          </div>

        </div>


        <div className="settings-summary-grid">

          {/* API */}

          <div>

            <span>
              API
            </span>

            <strong title={settings.apiBaseUrl}>
              {settings.apiBaseUrl || "-"}
            </strong>

          </div>


          {/* MACHINE */}

          <div>

            <span>
              MACHINE
            </span>

            <strong>
              {settings.machineName || "-"}
            </strong>

          </div>


          {/* REFRESH */}

          <div>

            <span>
              REFRESH
            </span>

            <strong>
              {refreshInterval}s
            </strong>

          </div>


          {/* HISTORY */}

          <div>

            <span>
              HISTORY
            </span>

            <strong>
              {historyCount}
            </strong>

          </div>


          {/* IDEAL CYCLE */}

          <div>

            <span>
              IDEAL CYCLE
            </span>

            <strong>
              {idealCycleTime}s
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          ACTIONS
          ===================================================== */}

      <div className="settings-actions">

        <div className="settings-save-message">

          {saved && (
            <>
              <span className="settings-save-dot" />

              Settings saved successfully
            </>
          )}

        </div>


        <div className="settings-buttons">

          <button
            type="button"
            className="settings-reset-button"
            onClick={handleReset}
          >
            Reset Defaults
          </button>


          <button
            type="button"
            className="settings-save-button"
            onClick={handleSave}
          >
            Save Settings
          </button>

        </div>

      </div>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="settings-footer">

        <span>
          Configuration is stored locally in this browser.
        </span>

        <span>
          CNC Dashboard
        </span>

      </footer>

    </div>
  );
}

export default Settings;