import { createFileRoute } from "@tanstack/react-router";
import { useRover } from "@/lib/rover-store";
import { VideoFeed } from "@/components/VideoFeed";
import { VirtualJoystick } from "@/components/VirtualJoystick";
import { SensorPanels } from "@/components/SensorPanels";
import { TriangleAlert } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ControlDashboard,
});

function ControlDashboard() {
  const rover = useRover();
  const connected = rover.status === "connected";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {rover.leakDetected && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive bg-destructive/10 px-4 py-3">
          <TriangleAlert className="h-5 w-5 text-destructive" />
          <p className="text-sm font-medium text-foreground">
            UV fluorescence detected — possible fluid leak. Inspect the video feed and capture a frame.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VideoFeed />
          <div className="mt-4">
            <SensorPanels />
          </div>
        </div>

        <div className="panel flex flex-col items-center gap-4 p-5">
          <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Manual Drive
          </span>
          <VirtualJoystick disabled={!connected} />
          <div className="w-full space-y-1 font-display text-xs text-muted-foreground">
            <p>
              Motors:{" "}
              <span className={rover.motorsActive ? "text-ok" : ""}>
                {rover.motorsActive ? "ACTIVE" : "IDLE"}
              </span>
            </p>
            <p>
              Mode: <span className="text-accent">{rover.mode.toUpperCase()}</span>
            </p>
            <p className="text-[10px] leading-relaxed">
              RF gamepad override bypasses this app and drives the L298N directly.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
