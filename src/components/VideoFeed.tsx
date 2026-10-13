import { useRover, roverStore } from "../lib/rover-store";

import { Camera, CameraOff } from "lucide-react";

export function VideoFeed() {
  const rover = useRover();
  const connected = rover.status === "connected";
  const streamUrl = `${rover.roverUrl.replace(/\/$/, "")}/stream`;

  return (
    <div className="panel scanlines relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Live Feed · ESP32-CAM
        </span>
        <span
          className={`flex items-center gap-1.5 font-display text-xs ${
            connected ? "text-ok" : "text-muted-foreground"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-ok animate-pulse-dot" : "bg-muted-foreground"}`}
          />
          {connected ? "STREAMING" : "OFFLINE"}
        </span>
      </div>

      <div className="relative aspect-video bg-background/60">
        {connected && rover.mode === "live" ? (
          <img src={streamUrl} alt="Rover camera stream" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            {connected ? (
              <>
                <Camera className="h-8 w-8" />
                <p className="font-display text-xs">SIMULATED FEED — no camera attached</p>
                <p className="max-w-64 text-center text-xs">
                  Switch to Live mode in Settings and enter the ESP32-CAM IP to see the real MJPEG stream.
                </p>
              </>
            ) : (
              <>
                <CameraOff className="h-8 w-8" />
                <p className="font-display text-xs">Connect the rover to start the video feed</p>
              </>
            )}
          </div>
        )}

        {rover.uvLedsOn && connected && (
          <div className="absolute inset-0 bg-uv/15 pointer-events-none" />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <span className="font-display text-xs text-muted-foreground">
          {rover.mode === "live" ? streamUrl : "simulation"}
        </span>
        <button
          onClick={() => roverStore.captureSnapshot()}
          disabled={!connected}
          className="rounded-md border border-border px-3 py-1 font-display text-xs text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          Capture
        </button>
      </div>
    </div>
  );
}
