"use client";

import { useRef, useState } from "react";
import type { ZonePoint, Pitch } from "@/types/tracker";

interface StrikeZoneProps {
  value: ZonePoint | null;
  onChange: (p: ZonePoint) => void;
  pitches?: Pitch[];
}

function getPitchColor(pitch: Pitch) {
  switch (pitch.result) {
    case "ball":
      return "bg-amber-500";
    case "called_strike":
    case "swinging_strike":
      return "bg-blue-500";
    case "foul":
      return "bg-purple-500";
    case "in_play":
      // If you later track hit vs out, this can change
      return "bg-emerald-500";
    default:
      return "bg-zinc-500";
  }
}

export default function StrikeZone({
  value,
  onChange,
  pitches = [],
}: StrikeZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    onChange({ x, y });
  }

  function formatResult(result: string) {
    return result
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="relative h-72 w-full rounded-2xl border border-zinc-200 bg-white/60 shadow-sm cursor-crosshair select-none"
    >
      {/* Grid */}
      <div className="absolute inset-0 rounded-2xl">
        <div className="absolute left-1/3 top-0 h-full w-px bg-zinc-200/50" />
        <div className="absolute left-2/3 top-0 h-full w-px bg-zinc-200/50" />
        <div className="absolute top-1/3 left-0 h-px w-full bg-zinc-200/50" />
        <div className="absolute top-2/3 left-0 h-px w-full bg-zinc-200/50" />
      </div>

      {/* Inner strike zone */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-44 w-44 border border-zinc-400/70 rounded-md" />
      </div>

      {/* Pitch Dots */}
      {pitches.map((pitch, index) => {
        const isLast = index === pitches.length - 1;

        return (
          <div
            key={pitch.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPitch(pitch);
            }}
            className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${getPitchColor(
              pitch
            )} ${
              isLast
                ? "shadow-[0_0_0_4px_rgba(255,255,255,0.9)]"
                : "opacity-80 hover:scale-110"
            }`}
            style={{
              left: `${pitch.location.x * 100}%`,
              top: `${pitch.location.y * 100}%`,
            }}
          />
        );
      })}

      {/* Current preview */}
      {value && (
        <div
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900/30"
          style={{
            left: `${value.x * 100}%`,
            top: `${value.y * 100}%`,
          }}
        />
      )}

      {/* Info Panel */}
      {selectedPitch && (
        <div className="absolute bottom-3 right-3 w-44 rounded-xl border border-zinc-200 bg-white/90 backdrop-blur-md p-3 shadow-md text-xs">
          <div className="font-semibold mb-1">
            Pitch #{selectedPitch.pitchNumberInAB}
          </div>
          <div>Result: {formatResult(selectedPitch.result)}</div>
          <div>Swing: {selectedPitch.swing ? "Yes" : "No"}</div>
          <div>Contact: {selectedPitch.contact ? "Yes" : "No"}</div>
          <button
            onClick={() => setSelectedPitch(null)}
            className="mt-2 text-[10px] text-zinc-500 hover:text-zinc-800"
          >
            Close
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 right-3 text-[10px] space-y-1 bg-white/80 backdrop-blur-md rounded-lg p-2 border border-zinc-200 shadow-sm">
        <Legend color="bg-blue-500" label="Strike" />
        <Legend color="bg-amber-500" label="Ball" />
        <Legend color="bg-purple-500" label="Foul" />
        <Legend color="bg-emerald-500" label="In Play" />
      </div>

      <div className="absolute bottom-3 left-4 text-xs text-zinc-500">
        Tap to set pitch location
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-zinc-600">{label}</span>
    </div>
  );
}