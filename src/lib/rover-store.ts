import { useSyncExternalStore } from "react";

export type ConnectionMode = "simulation" | "live";
export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface LogEntry {
  id: number;
  time: string;
  level: "info" | "warn" | "alert";
  message: string;
}

export interface RoverState {
  mode: ConnectionMode;
  status: ConnectionStatus;
  roverUrl: string;
  batteryPct: number;
  thermalC: number;
  thermalThresholdC: number;
  uvLedsOn: boolean;
  leakDetected: boolean;
  motorsActive: boolean;
  sessionStartedAt: number | null;
  logs: LogEntry[];
}

let state: RoverState = {
  mode: "simulation",
  status: "disconnected",
  roverUrl: "http://192.168.4.1",
  batteryPct: 100,
  thermalC: 28,
  thermalThresholdC: 80,
  uvLedsOn: false,
  leakDetected: false,
  motorsActive: false,
  sessionStartedAt: null,
  logs: [],
};

const listeners = new Set<() => void>();
let logId = 0;
let simTimer: ReturnType<typeof setInterval> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<RoverState>) {
  state = { ...state, ...patch };
  emit();
}

export function addLog(level: LogEntry["level"], message: string) {
  const entry: LogEntry = {
    id: ++logId,
    time: new Date().toLocaleTimeString(),
    level,
    message,
  };
  setState({ logs: [entry, ...state.logs].slice(0, 200) });
}

function tickSimulation() {
  const drift = (Math.random() - 0.45) * 4;
  let thermal = Math.max(22, Math.min(110, state.thermalC + drift));
  if (Math.random() < 0.04) thermal += 18;

  const leak = state.uvLedsOn && Math.random() < 0.05 ? true : state.leakDetected;
  const battery = Math.max(0, state.batteryPct - (state.motorsActive ? 0.4 : 0.1));

  setState({ thermalC: Math.round(thermal * 10) / 10, batteryPct: Math.round(battery * 10) / 10 });

  if (thermal > state.thermalThresholdC && state.thermalC <= state.thermalThresholdC) {
    addLog("alert", `Thermal threshold exceeded: ${thermal.toFixed(1)}°C`);
  }
  if (leak && !state.leakDetected) {
    setState({ leakDetected: true });
    addLog("alert", "UV fluorescence detected — possible fluid leak");
  }
}

export const roverStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot: () => state,

  connect() {
    setState({ status: "connecting" });
    addLog("info", `Initiating ${state.mode} link…`);
    setTimeout(() => {
      setState({ status: "connected", sessionStartedAt: Date.now() });
      addLog("info", `Link established (${state.mode.toUpperCase()})`);
      if (state.mode === "simulation" && !simTimer) {
        simTimer = setInterval(tickSimulation, 1000);
      }
    }, 600);
  },

  disconnect() {
    if (simTimer) {
      clearInterval(simTimer);
      simTimer = null;
    }
    setState({ status: "disconnected", motorsActive: false, sessionStartedAt: null });
    addLog("warn", "Session terminated by operator");
  },

  setMode(mode: ConnectionMode) {
    setState({ mode });
    addLog("info", `Operating mode switched to ${mode.toUpperCase()}`);
  },

  setRoverUrl(url: string) {
    setState({ roverUrl: url });
  },

  setThermalThreshold(c: number) {
    setState({ thermalThresholdC: c });
  },

  toggleUvLeds() {
    const next = !state.uvLedsOn;
    setState({ uvLedsOn: next });
    addLog("info", `UV inspection LEDs ${next ? "ENABLED" : "DISABLED"}`);
    if (state.mode === "live") {
      fetch(`${state.roverUrl}/led?val=${next ? 1 : 0}`).catch(() => {});
    }
  },

  clearLeak() {
    setState({ leakDetected: false });
    addLog("info", "Leak alert cleared by operator");
  },

  drive(x: number, y: number) {
    const moving = Math.abs(x) > 0.05 || Math.abs(y) > 0.05;
    if (moving !== state.motorsActive) {
      setState({ motorsActive: moving });
    }
    if (state.mode === "live" && state.status === "connected") {
      fetch(`${state.roverUrl}/drive?x=${x.toFixed(2)}&y=${y.toFixed(2)}`).catch(() => {});
    }
  },

  captureSnapshot() {
    addLog("info", "Snapshot captured to inspection log");
  },

  clearLogs() {
    setState({ logs: [] });
  },
};

export function useRover(): RoverState {
  return useSyncExternalStore(roverStore.subscribe, roverStore.getSnapshot, roverStore.getSnapshot);
}
