// ============================================================
// cncSignalR.ts
// Central SignalR connection for live CNC data
// ============================================================

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

import {
  getCncHubUrl,
} from "../config/appConfig";

import type {
  MachineSnapshot,
} from "../types/cnc";

// ============================================================
// TYPES
// ============================================================

type SnapshotListener =
  (snapshot: MachineSnapshot) => void;

type ConnectionListener =
  (connected: boolean) => void;

type ErrorListener =
  (error: Error) => void;

// ============================================================
// CONNECTION
// ============================================================

let connection: HubConnection | null =
  null;

// ============================================================
// MACHINE SUBSCRIPTION
// ============================================================

let subscribedMachineId: number | null =
  null;

// ============================================================
// LISTENERS
// ============================================================

const snapshotListeners =
  new Set<SnapshotListener>();

const connectionListeners =
  new Set<ConnectionListener>();

const errorListeners =
  new Set<ErrorListener>();

// ============================================================
// CONNECTION CONTROL
// ============================================================

let startPromise:
  Promise<void> | null = null;

// ============================================================
// NOTIFY HELPERS
// ============================================================

function notifyConnection(
  connected: boolean
): void {
  connectionListeners.forEach(
    (listener) => {
      try {
        listener(connected);
      } catch (error) {
        console.error(
          "SignalR connection listener error:",
          error
        );
      }
    }
  );
}

function notifyError(
  error: unknown
): void {
  const normalizedError =
    error instanceof Error
      ? error
      : new Error(
          String(error)
        );

  console.error(
    "CNC SignalR error:",
    normalizedError
  );

  errorListeners.forEach(
    (listener) => {
      try {
        listener(
          normalizedError
        );
      } catch (listenerError) {
        console.error(
          "SignalR error listener failed:",
          listenerError
        );
      }
    }
  );
}

function notifySnapshot(
  snapshot: MachineSnapshot
): void {
  snapshotListeners.forEach(
    (listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(
          "SignalR snapshot listener error:",
          error
        );
      }
    }
  );
}

// ============================================================
// SUBSCRIBE TO MACHINE
// ============================================================

export async function subscribeToMachine(
  machineId: number
): Promise<void> {
  if (!connection) {
    throw new Error(
      "SignalR connection has not been created."
    );
  }

  if (
    connection.state !==
    HubConnectionState.Connected
  ) {
    throw new Error(
      "SignalR connection is not connected."
    );
  }

  if (
    subscribedMachineId === machineId
  ) {
    console.info(
      `[CNC SignalR] Already subscribed to machine-${machineId}`
    );

    return;
  }

  // Leave previous machine group first.
  if (
    subscribedMachineId !== null
  ) {
    try {
      await connection.invoke(
        "UnsubscribeFromMachine",
        subscribedMachineId
      );

      console.info(
        `[CNC SignalR] Unsubscribed from machine-${subscribedMachineId}`
      );
    } catch (error) {
      console.warn(
        "[CNC SignalR] Failed to unsubscribe from previous machine:",
        error
      );
    }

    subscribedMachineId = null;
  }

  await connection.invoke(
    "SubscribeToMachine",
    machineId
  );

  subscribedMachineId =
    machineId;

  console.info(
    `[CNC SignalR] Subscribed to machine-${machineId}`
  );
}

// ============================================================
// UNSUBSCRIBE FROM MACHINE
// ============================================================

export async function unsubscribeFromMachine(
  machineId?: number
): Promise<void> {
  if (!connection) {
    subscribedMachineId = null;
    return;
  }

  if (
    connection.state !==
    HubConnectionState.Connected
  ) {
    subscribedMachineId = null;
    return;
  }

  const targetMachineId =
    machineId ??
    subscribedMachineId;

  if (
    targetMachineId === null ||
    targetMachineId === undefined
  ) {
    return;
  }

  try {
    await connection.invoke(
      "UnsubscribeFromMachine",
      targetMachineId
    );

    console.info(
      `[CNC SignalR] Unsubscribed from machine-${targetMachineId}`
    );
  } catch (error) {
    console.warn(
      "[CNC SignalR] Failed to unsubscribe from machine:",
      error
    );
  } finally {
    if (
      subscribedMachineId ===
      targetMachineId
    ) {
      subscribedMachineId = null;
    }
  }
}

// ============================================================
// RE-SUBSCRIBE AFTER CONNECTION
// ============================================================

async function resubscribeToMachine(): Promise<void> {
  if (
    subscribedMachineId === null
  ) {
    return;
  }

  const machineId =
    subscribedMachineId;

  subscribedMachineId = null;

  try {
    await subscribeToMachine(
      machineId
    );
  } catch (error) {
    console.error(
      "[CNC SignalR] Failed to resubscribe to machine:",
      error
    );

    notifyError(error);
  }
}

// ============================================================
// CREATE CONNECTION
// ============================================================

function createConnection(): HubConnection {
  const hubUrl =
    getCncHubUrl();

  console.info(
    "[CNC SignalR] Connecting to:",
    hubUrl
  );

  const newConnection =
    new HubConnectionBuilder()
      .withUrl(
        hubUrl,
        {
          withCredentials: false,
        }
      )
      .withAutomaticReconnect([
        0,
        2000,
        5000,
        10000,
        30000,
      ])
      .configureLogging(
        import.meta.env.DEV
          ? LogLevel.Information
          : LogLevel.Warning
      )
      .build();

  // ==========================================================
  // SERVER → CLIENT SNAPSHOT
  // ==========================================================

  newConnection.on(
    "MachineSnapshotUpdated",
    (
      snapshot: MachineSnapshot
    ) => {
      notifySnapshot(
        snapshot
      );
    }
  );

  // ==========================================================
  // CONNECTION EVENTS
  // ==========================================================

  newConnection.onreconnecting(
    (error) => {
      console.warn(
        "[CNC SignalR] Reconnecting...",
        error
      );

      notifyConnection(
        false
      );
    }
  );

  newConnection.onreconnected(
    async (connectionId) => {
      console.info(
        "[CNC SignalR] Reconnected:",
        connectionId
      );

      try {
        await resubscribeToMachine();
      } catch (error) {
        notifyError(error);
      }

      notifyConnection(
        true
      );
    }
  );

  newConnection.onclose(
    (error) => {
      console.warn(
        "[CNC SignalR] Connection closed.",
        error
      );

      subscribedMachineId =
        null;

      notifyConnection(
        false
      );

      if (error) {
        notifyError(
          error
        );
      }
    }
  );

  return newConnection;
}

// ============================================================
// SELECTED MACHINE
// ============================================================

function getSelectedMachineIdFromStorage(): number | null {
  try {
    const stored = localStorage.getItem("cnc:selectedMachineId");

    if (!stored) return null;

    const machineId = Number(stored);

    return Number.isInteger(machineId) && machineId > 0
      ? machineId
      : null;
  } catch {
    return null;
  }
}

// START CONNECTION
// ============================================================

export async function startCncConnection(machineId?: number | null): Promise<void> {
  // Already connected
  if (
    connection?.state ===
    HubConnectionState.Connected
  ) {
    const targetMachineId =
      machineId !== undefined
        ? machineId
        : getSelectedMachineIdFromStorage();

    if (
      targetMachineId !== null &&
      targetMachineId !== undefined &&
      subscribedMachineId !== targetMachineId
    ) {
      if (subscribedMachineId !== null) {
        await unsubscribeFromMachine(
          subscribedMachineId,
        );
      }

      await subscribeToMachine(
        targetMachineId,
      );
    }

    notifyConnection(true);
    return;
  }

  // Another start is already running
  if (startPromise) {
    return startPromise;
  }

  startPromise =
    (async () => {
      try {
        // Create connection if necessary
        if (!connection) {
          connection =
            createConnection();
        }

        // Avoid duplicate start
        if (
          connection.state !==
          HubConnectionState.Disconnected
        ) {
          return;
        }

        await connection.start();

        console.info(
          "[CNC SignalR] Connected."
        );

        const targetMachineId =
          machineId !== undefined
            ? machineId
            : getSelectedMachineIdFromStorage();

        if (targetMachineId !== null) {
          await subscribeToMachine(
            targetMachineId,
          );
        } else {
          console.warn(
            "[CNC SignalR] No selected machine. Select a machine in Machine Configuration."
          );
        }
// Subscribe to the default machine.
        // This will later become dynamic from
        // the selected machine in the Dashboard.
        await subscribeToMachine(
          1
        );

        notifyConnection(
          true
        );

      } catch (error) {
        console.error(
          "[CNC SignalR] Connection failed:",
          error
        );

        notifyConnection(
          false
        );

        notifyError(
          error
        );

        /*
         * Dispose failed connection so the next
         * start attempt creates a clean connection.
         */
        try {
          await connection?.stop();
        } catch {
          // Ignore cleanup error
        }

        connection = null;
        subscribedMachineId =
          null;

        throw error;

      } finally {
        startPromise =
          null;
      }
    })();

  return startPromise;
}

// ============================================================
// STOP CONNECTION
// ============================================================

export async function stopCncConnection(): Promise<void> {
  // If connection doesn't exist
  if (!connection) {
    subscribedMachineId =
      null;

    notifyConnection(
      false
    );

    return;
  }

  try {
    if (
      connection.state ===
      HubConnectionState.Connected
    ) {
      if (
        subscribedMachineId !==
        null
      ) {
        try {
          await connection.invoke(
            "UnsubscribeFromMachine",
            subscribedMachineId
          );
        } catch (error) {
          console.warn(
            "[CNC SignalR] Failed to unsubscribe before stop:",
            error
          );
        }
      }
    }

    if (
      connection.state !==
      HubConnectionState.Disconnected
    ) {
      await connection.stop();
    }

  } catch (error) {
    console.error(
      "[CNC SignalR] Stop failed:",
      error
    );

    notifyError(
      error
    );

  } finally {
    connection = null;

    subscribedMachineId =
      null;

    startPromise =
      null;

    notifyConnection(
      false
    );
  }
}

// ============================================================
// CONNECTION STATUS
// ============================================================

export function isCncConnected(): boolean {
  return (
    connection?.state ===
    HubConnectionState.Connected
  );
}

export function getCncConnectionState(): HubConnectionState {
  return (
    connection?.state ??
    HubConnectionState.Disconnected
  );
}

// ============================================================
// CURRENT MACHINE
// ============================================================

export function getSubscribedMachineId():
  number | null {
  return subscribedMachineId;
}

// ============================================================
// SNAPSHOT LISTENER
// ============================================================

export function onSnapshot(
  listener: SnapshotListener
): () => void {
  snapshotListeners.add(
    listener
  );

  /*
   * Return unsubscribe function.
   *
   * This is important for React components because
   * pages such as Dashboard and MachineDetails
   * mount/unmount frequently.
   */
  return () => {
    snapshotListeners.delete(
      listener
    );
  };
}

// ============================================================
// CONNECTION LISTENER
// ============================================================

export function onConnectionChange(
  listener: ConnectionListener
): () => void {
  connectionListeners.add(
    listener
  );

  /*
   * Immediately provide current state.
   */
  listener(
    isCncConnected()
  );

  return () => {
    connectionListeners.delete(
      listener
    );
  };
}

// ============================================================
// ERROR LISTENER
// ============================================================

export function onConnectionError(
  listener: ErrorListener
): () => void {
  errorListeners.add(
    listener
  );

  return () => {
    errorListeners.delete(
      listener
    );
  };
}

// ============================================================
// CURRENT CONNECTION
// ============================================================

export function getCncConnection():
  HubConnection | null {
  return connection;
}

// ============================================================
// MANUAL RECONNECT
// ============================================================

export async function reconnectCnc():
  Promise<void> {
  console.info(
    "[CNC SignalR] Manual reconnect requested."
  );

  await stopCncConnection();

  await startCncConnection();
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  startCncConnection,
  stopCncConnection,
  reconnectCnc,
  subscribeToMachine,
  unsubscribeFromMachine,
  getSubscribedMachineId,
  isCncConnected,
  getCncConnectionState,
  getCncConnection,
  onSnapshot,
  onConnectionChange,
  onConnectionError,
};