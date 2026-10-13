import { useRover, roverStore } from "../lib/rover-store";
import { Bot } from "lucide-react";

export function AppHeader() {
  const rover = useRover();
  const connected = rover.status === "connected";

  return (
    <header className="sticky top-0 z-10 border-b border-[#2d313f] bg-[#1a1c24]/90 backdrop-blur px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-amber-500" />
          <span className="font-bold text-sm tracking-wide text-white">
            UNDERCHASSIS<span className="text-amber-500">ROVER</span>
          </span>
        </div>

        <button
          onClick={() => (connected ? roverStore.disconnect() : roverStore.connect())}
          disabled={rover.status === "connecting"}
          className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
            connected
              ? "border border-red-500 text-red-500 hover:bg-red-500/10"
              : "bg-amber-500 text-black hover:bg-amber-400"
          } disabled:opacity-50`}
        >
          {rover.status === "connecting" ? "Linking…" : connected ? "End Session" : "Connect"}
        </button>
      </div>
    </header>
  );
}
