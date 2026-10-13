import { useRef, useState, useCallback } from "react";
import { roverStore } from "../lib/rover-store";


export function VirtualJoystick({ disabled }: { disabled?: boolean }) {
  const padRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const radius = rect.width / 2;
    let dx = (clientX - (rect.left + radius)) / radius;
    let dy = (clientY - (rect.top + radius)) / radius;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    setKnob({ x: dx, y: dy });
    roverStore.drive(dx, -dy); // screen-up = forward
  }, []);

  const release = useCallback(() => {
    dragging.current = false;
    setKnob({ x: 0, y: 0 });
    roverStore.drive(0, 0);
  }, []);

  return (
    <div
      ref={padRef}
      role="application"
      aria-label="Virtual joystick"
      className={`relative aspect-square w-full max-w-56 touch-none select-none rounded-full border-2 border-border bg-secondary/50 ${
        disabled ? "opacity-40 pointer-events-none" : "cursor-grab active:cursor-grabbing"
      }`}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updateFromPointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (dragging.current) updateFromPointer(e.clientX, e.clientY);
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
      <div
        className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50 bg-primary shadow-lg transition-transform will-change-transform"
        style={{
          left: `${(knob.x * 0.4 + 0.5) * 100}%`,
          top: `${(knob.y * 0.4 + 0.5) * 100}%`,
        }}
      />
    </div>
  );
}
