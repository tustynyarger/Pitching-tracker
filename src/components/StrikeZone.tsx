"use client";

import { useRef, useState } from "react";
import type { ZonePoint, Pitch } from "@/types/tracker";

interface StrikeZoneProps {
  value: ZonePoint | null;
  onChange: (p: ZonePoint) => void;
  pitches?: Pitch[];
  plateAppearances?: { pitches: Pitch[] }[];
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
      return "bg-emerald-500";
    default:
      return "bg-zinc-500";
  }
}

export default function StrikeZone({
  value,
  onChange,
  pitches = [],
  plateAppearances = [],
}: StrikeZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);

  function handleZoneClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    // Clear selected pitch on any background click
    setSelectedPitch(null);

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
      onClick={handleZoneClick}
      className="relative h-72 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm cursor-crosshair select-none"
    >
      {/* Grid */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none">
        <div className="absolute left-1/3 top-0 h-full w-px bg-zinc-200/40 dark:bg-zinc-700/40" />
        <div className="absolute left-2/3 top-0 h-full w-px bg-zinc-200/40 dark:bg-zinc-700/40" />
        <div className="absolute top-1/3 left-0 h-px w-full bg-zinc-200/40 dark:bg-zinc-700/40" />
        <div className="absolute top-2/3 left-0 h-px w-full bg-zinc-200/40 dark:bg-zinc-700/40" />
      </div>

      {/* Strike zone box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-44 w-44 border border-zinc-400/70 dark:border-zinc-600/70 rounded-md" />
      </div>

      {/* Pitches */}
      {pitches.map((pitch, index) => {
        const isLast = index === pitches.length - 1;

        return (
          <div
            key={pitch.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPitch(pitch);
            }}
            className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition ${
              getPitchColor(pitch)
            } ${
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
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900/30 dark:bg-white/30"
          style={{
            left: `${value.x * 100}%`,
            top: `${value.y * 100}%`,
          }}
        />
      )}
{/* Legend */}
<div className="absolute top-3 left-3 text-[10px] space-y-1 bg-white/90 backdrop-blur-md rounded-lg px-2 py-1 border border-zinc-200 shadow-sm">
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-blue-500" />
    <span>Strike</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-amber-500" />
    <span>Ball</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-purple-500" />
    <span>Foul</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-emerald-500" />
    <span>In Play</span>
  </div>
</div>
      {/* Info panel */}
      {selectedPitch && (
        <div className="absolute bottom-3 right-3 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-3 shadow-md text-xs">
          <div className="font-semibold mb-1">
  {(() => {
    let paIndex = 0;

    for (let i = 0; i < plateAppearances.length; i++) {
      if (plateAppearances[i].pitches.some(p => p.id === selectedPitch.id)) {
        paIndex = i + 1;
        break;
      }
    }

    return `PA ${paIndex} — Pitch #${selectedPitch.pitchNumberInAB}`;
  })()}
</div>
          <div>Result: {formatResult(selectedPitch.result)}</div>
          <div>Swing: {selectedPitch.swing ? "Yes" : "No"}</div>
          <div>Contact: {selectedPitch.contact ? "Yes" : "No"}</div>
        </div>
      )}

      <div className="absolute bottom-3 left-4 text-xs text-zinc-500 dark:text-zinc-400">
        Tap to set pitch location
      </div>
    </div>
  );
}