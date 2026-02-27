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
    <main className="relative min-h-screen bg-zinc-50">

      {/* Subtle layered background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-zinc-50 to-zinc-100" />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            Softball Performance Tracker
          </h1>

          <Link
            href="/sessions"
            className="text-sm text-zinc-600 hover:text-zinc-900 transition"
          >
            Sessions →
          </Link>
        </div>

        {/* Player Card */}
        <section className="glass-card space-y-5">

          <div className="flex gap-3 flex-col sm:flex-row">

            <select
              value={t.currentPlayerId ?? ""}
              onChange={(e) =>
                t.setCurrentPlayerId(e.target.value || null)
              }
              className="input"
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
              placeholder="New player"
              className="input"
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
              className="btn-primary"
            >
              Add
            </button>
          </div>

          {t.currentPlayerId && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (!confirm("Delete player?")) return;
                  const updated = players.filter(
                    (p) => p.id !== t.currentPlayerId
                  );
                  savePlayers(updated);
                  setPlayers(updated);
                  t.setCurrentPlayerId(null);
                }}
                className="text-xs text-red-500 hover:opacity-70 transition"
              >
                Delete Player
              </button>

              <div className="flex gap-3">
                <input
                  id="sessionName"
                  placeholder="Session name"
                  className="input"
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
                  className="btn-secondary"
                >
                  Save
                </button>
              </div>
            </div>
          )}

        </section>

        {/* Tracker Card */}
        <section className="glass-card space-y-6">

          <div className="text-center text-sm text-zinc-500">
            Count:{" "}
            <span className="font-semibold text-zinc-900">
              {t.count.balls}–{t.count.strikes}
            </span>
          </div>

          <StrikeZone
            value={t.pendingLocation}
            onChange={t.setPendingLocation}
            pitches={allPitches}
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
                className="btn-success"
              >
                Hit
              </button>
              <button
                onClick={() => t.resolveInPlay("OUT")}
                className="btn-dark"
              >
                Out
              </button>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <button onClick={t.undoLastPitch} className="btn-secondary">
              Undo
            </button>
            <button onClick={t.clearSession} className="btn-danger">
              Clear
            </button>
          </div>

        </section>

       {/* Metrics */}
<section className="glass-card space-y-6">

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
    <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-zinc-200 p-5 shadow-sm">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-xl font-semibold mt-2">{value}</div>
    </div>
  );
}