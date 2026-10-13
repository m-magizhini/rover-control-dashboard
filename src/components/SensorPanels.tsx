import { useRover, roverStore } from "../lib/rover-store";

import { Thermometer, Droplets, BatteryFull, Lightbulb } from "lucide-react";

export function SensorPanels() {
  const rover = useRover();
  const connected = rover.status === "connected";
  const overTemp = connected && rover.thermalC > rover.thermalThresholdC;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Thermal */}
      <div className={`panel p-4 ${overTemp ? "border-destructive" : ""}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Thermometer className="h-4 w-4" />
          <span className="font-display text-[10px] uppercase tracking-widest">Thermal · MLX90614</span>
        </div>
        <p className={`mt-2 font-display text-3xl font-bold ${overTemp ? "text-destructive" : "text-thermal"}`}>
          {connected ? `${rover.thermalC.toFixed(1)}°` : "--"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Threshold {rover.thermalThresholdC}°C {overTemp && "· EXCEEDED"}
        </p>
      </div>

      {/* Leak detection */}
      <div className={`panel p-4 ${rover.leakDetected ? "border-destructive" : ""}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Droplets className="h-4 w-4" />
          <span className="font-display text-[10px] uppercase tracking-widest">Leak · UV</span>
        </div>
        <p
          className={`mt-2 font-display text-lg font-bold ${
            rover.leakDetected ? "text-destructive" : connected ? "text-ok" : "text-muted-foreground"
          }`}
        >
          {!connected ? "--" : rover.leakDetected ? "LEAK FOUND" : "CLEAR"}
        </p>
        {rover.leakDetected && (
          <button
            onClick={() => roverStore.clearLeak()}
            className="mt-1 text-xs text-accent underline"
          >
            Acknowledge
          </button>
        )}
      </div>

      {/* Battery */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BatteryFull className="h-4 w-4" />
          <span className="font-display text-[10px] uppercase tracking-widest">Battery · 18650×2</span>
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-foreground">
          {connected ? `${Math.round(rover.batteryPct)}%` : "--"}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${rover.batteryPct < 20 ? "bg-destructive" : "bg-ok"}`}
            style={{ width: `${connected ? rover.batteryPct : 0}%` }}
          />
        </div>
      </div>

      {/* UV LEDs toggle */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          <span className="font-display text-[10px] uppercase tracking-widest">UV LEDs · 395nm</span>
        </div>
        <button
          onClick={() => roverStore.toggleUvLeds()}
          disabled={!connected}
          className={`mt-3 w-full rounded-md px-3 py-2 font-display text-sm font-bold transition-colors disabled:opacity-40 ${
            rover.uvLedsOn
              ? "bg-uv text-primary-foreground"
              : "border border-border text-foreground hover:bg-secondary"
          }`}
        >
          {rover.uvLedsOn ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
