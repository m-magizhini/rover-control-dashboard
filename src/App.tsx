import { AppHeader } from "./components/AppHeader";
import { VideoFeed } from "./components/VideoFeed";
import { VirtualJoystick } from "./components/VirtualJoystick";
import { SensorPanels } from "./components/SensorPanels";
import { useRover } from "./lib/rover-store";
import { TriangleAlert } from "lucide-react";

export default function App() {
  const rover = useRover();
  const connected = rover.status === "connected";

  return (
    <div className="min-h-screen bg-[#121318] text-white">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {rover.leakDetected && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500 bg-red-500/10 px-4 py-3">
            <TriangleAlert className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-white">
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

          <div className="panel flex flex-col items-center gap-4 p-5 bg-[#1c1e26] border border-[#2d313f] rounded-xl">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              Manual Drive
            </span>
            <VirtualJoystick disabled={!connected} />
            <div className="w-full space-y-1 text-xs text-gray-400 mt-2">
              <p>
                Motors:{" "}
                <span className={rover.motorsActive ? "text-emerald-400 font-bold" : "text-gray-500"}>
                  {rover.motorsActive ? "ACTIVE" : "IDLE"}
                </span>
              </p>
              <p>
                Mode: <span className="text-cyan-400 font-bold">{rover.mode.toUpperCase()}</span>
              </p>
              <p className="text-[10px] leading-relaxed text-gray-500 pt-2">
                RF gamepad override bypasses this app and drives the L298N directly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
