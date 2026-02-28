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
