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
    <main className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <Link href="/" className="text-sm underline">
          ← Back to Tracker
        </Link>

        <h1 className="text-xl font-semibold">Session Library</h1>

        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="">Select Player</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {selectedPlayer &&
          selectedPlayer.sessions.map((s: any) => (
            <Link
              key={s.id}
              href={`/sessions/${s.id}`}
              className="block rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm hover:bg-white transition"
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