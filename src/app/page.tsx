"use client";

import { useEffect, useState } from "react";
import StrikeZone from "@/components/StrikeZone";
import { useTracker } from "@/state/useTracker";
import { getPlayers, createPlayer, savePlayers } from "@/lib/storage";
import Link from "next/link";

export default function Home() {
  const t = useTracker();
  const [players, setPlayers] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPlayers(getPlayers());
  }, []);

  const allPitches = [
    ...t.plateAppearances.flatMap((pa) => pa.pitches),
    ...t.abPitches,
  ];

  const totalPitches = t.totalPitches;
  const totalPA = t.plateAppearances.length;

  const totalStrikes = allPitches.filter(
    (p) =>
      p.result === "called_strike" ||
      p.result === "swinging_strike" ||
      p.result === "foul" ||
      p.result === "in_play"
  ).length;

  const strikePct =
    totalPitches > 0
      ? ((totalStrikes / totalPitches) * 100).toFixed(1)
      : "—";

  const firstPitchStrikes = t.plateAppearances.filter((pa) => {
    const first = pa.pitches[0];
    if (!first) return false;

    return (
      first.result === "called_strike" ||
      first.result === "swinging_strike" ||
      first.result === "foul" ||
      first.result === "in_play"
    );
  }).length;

  const firstPitchStrikePct =
    totalPA > 0
      ? ((firstPitchStrikes / totalPA) * 100).toFixed(1)
      : "—";

  const pitchesPerPA =
    totalPA > 0
      ? (totalPitches / totalPA).toFixed(2)
      : "—";

  const kPct =
    totalPA > 0
      ? ((t.strikeouts / totalPA) * 100).toFixed(1)
      : "—";

  const bbPct =
    totalPA > 0
      ? ((t.walks / totalPA) * 100).toFixed(1)
      : "—";

  const hitPct =
    totalPA > 0
      ? ((t.hits / totalPA) * 100).toFixed(1)
      : "—";

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
         <h1 className="text-xl font-semibold">
  <span className="text-lime-500">Softball</span> Performance Tracker
</h1>

          <div className="relative">
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm font-medium hover:bg-zinc-100 transition"
  >
    ☰
  </button>

  {menuOpen && (
    <div className="absolute right-0 mt-2 w-40 rounded-xl border border-zinc-200 bg-white shadow-md">
      <Link
        href="/sessions"
        className="block px-4 py-2 text-sm hover:bg-zinc-100"
      >
        Sessions
      </Link>
    </div>
  )}
</div>
        </div>
{/* Player + Session Controls */}
<div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">

  {/* Player Row */}
  <div className="flex flex-col sm:flex-row gap-3">

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

    <input
      id="playerName"
      placeholder="New player name"
      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm bg-white"
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
      className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"
    >
      Add
    </button>
  </div>

  {/* Save Session */}
  {t.currentPlayerId && (
    <div className="flex gap-3">
      <input
        id="sessionName"
        placeholder="Session name"
        className="rounded-xl border border-zinc-300 px-3 py-2 text-sm bg-white"
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
        className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"
      >
        Save Session
      </button>
    </div>
  )}

</div>

        {/* Strike Zone */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="text-center text-sm text-zinc-500 mb-4">
            Count:{" "}
            <span className="font-semibold text-zinc-900">
              {t.count.balls}–{t.count.strikes}
            </span>
          </div>

          <StrikeZone
            value={t.pendingLocation}
            onChange={t.setPendingLocation}
            pitches={allPitches}
            plateAppearances={t.plateAppearances}
          />

          <div className="grid grid-cols-2 gap-3 mt-6">
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
  <div className="flex justify-center gap-4 mt-4">
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

          <div className="flex justify-center gap-4 mt-6">
            <button onClick={t.undoLastPitch} className="btn">
              Undo
            </button>
            <button
              onClick={t.clearSession}
              className="px-4 py-2 rounded-xl border-2 border-red-400 text-red-600 text-sm font-medium bg-white hover:bg-red-50 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">

          <div className="grid grid-cols-2 gap-6 text-center text-sm">
            <Metric label="Total Pitches" value={totalPitches} />
            <Metric label="Plate Appearances" value={totalPA} />
            <Metric label="Hits" value={t.hits} />
            <Metric label="Strikeouts" value={t.strikeouts} />
            <Metric label="Walks" value={t.walks} />
          </div>

          <div className="grid grid-cols-2 gap-6 text-center text-sm">
            <Metric label="Strike %" value={strikePct + "%"} />
            <Metric label="1st Pitch Strike %" value={firstPitchStrikePct + "%"} />
            <Metric label="Pitches / PA" value={pitchesPerPA} />
            <Metric label="K %" value={kPct + "%"} />
            <Metric label="BB %" value={bbPct + "%"} />
            <Metric label="Hit %" value={hitPct + "%"} />
          </div>

        </div>

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
    <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-xl font-semibold mt-2">{value}</div>
    </div>
  );
}