"use client";

import { useEffect, useState } from "react";
import { getPlayers } from "@/lib/storage";
import Link from "next/link";

export default function SessionsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  useEffect(() => {
    setPlayers(getPlayers());
  }, []);

  const selectedPlayer = players.find(
    (p) => p.id === selectedPlayerId
  );
const playerTotals = selectedPlayer
  ? selectedPlayer.sessions.reduce(
      (acc: any, session: any) => {
        const paCount = session.plateAppearances.length;

        const inPlayCount = session.plateAppearances.filter(
          (pa: any) => pa.endType === "IN_PLAY"
        ).length;

        const allPitches = session.plateAppearances.flatMap(
          (pa: any) => pa.pitches
        );

        const swingCount = allPitches.filter(
          (p: any) => p.swing
        ).length;

        const contactCount = allPitches.filter(
          (p: any) => p.contact
        ).length;

        acc.totalPitches += session.totalPitches;
        acc.totalPA += paCount;
        acc.hits += session.hits;
        acc.strikeouts += session.strikeouts;
        acc.walks += session.walks;
        acc.ballsInPlay += inPlayCount;
        acc.bipOuts += inPlayCount - session.hits;
        acc.swings += swingCount;
        acc.contacts += contactCount;

        return acc;
      },
      {
        totalPitches: 0,
        totalPA: 0,
        hits: 0,
        strikeouts: 0,
        walks: 0,
        ballsInPlay: 0,
        bipOuts: 0,
        swings: 0,
        contacts: 0,
      }
    )
  : null;

const strikePct =
  playerTotals && playerTotals.totalPitches > 0
    ? (
        ((playerTotals.totalPitches -
          playerTotals.walks) /
          playerTotals.totalPitches) *
        100
      ).toFixed(1)
    : "—";

const kPct =
  playerTotals && playerTotals.totalPA > 0
    ? (
        (playerTotals.strikeouts /
          playerTotals.totalPA) *
        100
      ).toFixed(1)
    : "—";

const bbPct =
  playerTotals && playerTotals.totalPA > 0
    ? (
        (playerTotals.walks /
          playerTotals.totalPA) *
        100
      ).toFixed(1)
    : "—";
const swingPct =
  playerTotals && playerTotals.totalPitches > 0
    ? (
        (playerTotals.swings /
          playerTotals.totalPitches) *
        100
      ).toFixed(1)
    : "—";

const contactPct =
  playerTotals && playerTotals.swings > 0
    ? (
        (playerTotals.contacts /
          playerTotals.swings) *
        100
      ).toFixed(1)
    : "—";
  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Button */}
        <Link
          href="/"
          className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition inline-block"
        >
          Back to Tracker
        </Link>

        {/* Title */}
        <h1 className="text-xl font-semibold mt-4">
          Session Library
        </h1>

        {/* Player + Delete Row */}
        <div className="flex items-center justify-between max-w-lg">

          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select Player</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {selectedPlayerId && (
            <button
              onClick={() => {
                if (!confirm("Delete player?")) return;
                const updated = players.filter(
                  (p) => p.id !== selectedPlayerId
                );
                localStorage.setItem("softball_players", JSON.stringify(updated));
                setPlayers(updated);
                setSelectedPlayerId("");
              }}
              className="px-4 py-2 rounded-xl border-2 border-red-400 text-red-600 text-sm font-medium bg-white hover:bg-red-50 transition"
            >
              Delete Player
            </button>
          )}

        </div>

        {/* Sessions List */}
{selectedPlayer && playerTotals && (
  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
    <div className="text-sm font-semibold text-zinc-700">
      Player Summary
    </div>

    <div className="grid grid-cols-2 gap-6 text-center text-sm">
  <Metric label="Total Pitches" value={playerTotals.totalPitches} />
  <Metric label="Total PA" value={playerTotals.totalPA} />
  <Metric label="Hits" value={playerTotals.hits} />
  <Metric label="Strikeouts" value={playerTotals.strikeouts} />
  <Metric label="Walks" value={playerTotals.walks} />
  <Metric label="Balls In Play" value={playerTotals.ballsInPlay} />
  <Metric label="BIP Outs" value={playerTotals.bipOuts} />
  <Metric label="Swing %" value={swingPct + "%"} />
  <Metric label="Contact %" value={contactPct + "%"} />
</div>
  </div>
)}
        {selectedPlayer &&
          selectedPlayer.sessions.map((s: any) => (
            <Link
              key={s.id}
              href={`/sessions/${s.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:opacity-90 transition"
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {new Date(s.date).toLocaleString()}
              </div>
            </Link>
          ))}

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
    <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
