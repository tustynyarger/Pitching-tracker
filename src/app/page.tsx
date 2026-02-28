"use client";

import { useEffect, useState } from "react";
import StrikeZone from "@/components/StrikeZone";
import { useTracker } from "@/state/useTracker";
import { getPlayers, createPlayer, savePlayers } from "@/lib/storage";
import Link from "next/link";

export default function Home() {
  const t = useTracker();
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    setPlayers(getPlayers());
  }, []);

  const allPitches = [
    ...t.plateAppearances.flatMap((pa) => pa.pitches),
    ...t.abPitches,
  ];

  const totalPitches = t.totalPitches;
  const totalPA = t.plateAppearances.length;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
  <span className="text-lime-500">Softball</span> Performance Tracker
</h1>

          <Link
            href="/sessions"
className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"    >      Sessions
          </Link>
        </div>

        {/* Player + Session Controls */}
        <section className="space-y-6">

  {/* Player Row */}
<div className="flex flex-col gap-3">

  <div className="flex flex-col sm:flex-row sm:items-center gap-3">

    <select
      value={t.currentPlayerId ?? ""}
      onChange={(e) =>
        t.setCurrentPlayerId(e.target.value || null)
      }
      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm bg-white"
    >
      <option value="">Select Player</option>
      {players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>

  </div>

  <div className="flex gap-3">
    <input
      id="playerName"
      placeholder="New player"
      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm flex-1"
    />

    <button
      onClick={() => {
        const input = document.getElementById(
          "playerName"
        ) as HTMLInputElement;

        const name = input?.value.trim();
        if (!name) return;

        const existing = getPlayers();
        const duplicate = existing.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );

        if (duplicate) {
          t.setCurrentPlayerId(duplicate.id);
          input.value = "";
          return;
        }

        const newPlayer = createPlayer(name);
        existing.push(newPlayer);
        savePlayers(existing);
        setPlayers(existing);
        t.setCurrentPlayerId(newPlayer.id);

        input.value = "";
      }}
className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"    >
      Add
    </button>
  </div>

</div>

  {/* Save Session */}
  {t.currentPlayerId && (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

      <input
        id="sessionName"
        placeholder="Session name"
        className="rounded-xl border border-zinc-300 px-3 py-2 text-sm flex-1"
      />

      <button
        onClick={() => {
          const input = document.getElementById(
            "sessionName"
          ) as HTMLInputElement;

          const name = input?.value.trim();
          if (!name) return;

          t.saveSessionToPlayer(name);
          input.value = "";
        }}
className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"      >
        Save Session
      </button>

     
    </div>
  )}

</section>

        {/* Tracker */}
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-6">

          <div className="text-center text-sm">
            Count:{" "}
            <span className="font-semibold">
              {t.count.balls}–{t.count.strikes}
            </span>
          </div>

         <StrikeZone
  value={t.pendingLocation}
  onChange={t.setPendingLocation}
  pitches={allPitches}
  plateAppearances={t.plateAppearances}
/>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => t.recordPitch("ball")} className="btn">
              Ball
            </button>
            <button onClick={() => t.recordPitch("called_strike")} className="btn">
              Called Strike
            </button>
            <button onClick={() => t.recordPitch("swinging_strike")} className="btn">
              Swinging Strike
            </button>
            <button onClick={() => t.recordPitch("foul")} className="btn">
              Foul
            </button>
            <button onClick={() => t.recordPitch("in_play")} className="btn col-span-2">
              In Play
            </button>
          </div>

         {t.pendingInPlay && (
  <div className="flex justify-center gap-4">
    <button
      onClick={() => t.resolveInPlay("HIT")}
      className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"
    >
      Hit
    </button>
    <button
      onClick={() => t.resolveInPlay("OUT")}
      className="px-4 py-2 rounded-xl border-2 border-zinc-400 text-black text-sm font-medium bg-white hover:bg-zinc-50 transition"
    >
      Out
    </button>
  </div>
)}

        </section>
        {/* Metrics */}
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-6">

          <div className="grid grid-cols-2 gap-6 text-center text-sm">

            <Metric label="Total Pitches" value={t.totalPitches} />
            <Metric label="Plate Appearances" value={t.plateAppearances.length} />
            <Metric label="Hits" value={t.hits} />
            <Metric label="Strikeouts" value={t.strikeouts} />
            <Metric label="Walks" value={t.walks} />

          </div>

        </section>
      </div>
    </main>
  );
}
function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-5">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="text-xl font-semibold mt-2">
        {value}
      </div>
    </div>
  );
}