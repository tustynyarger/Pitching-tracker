"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPlayers } from "@/lib/storage";
import StrikeZone from "@/components/StrikeZone";
import Link from "next/link";

export default function SessionDetail() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<any>(null);
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    if (!sessionId) return;

    const players = getPlayers();

    for (const player of players) {
      const found = player.sessions.find(
        (s: any) => s.id === sessionId
      );

      if (found) {
        setSession(found);
        setPlayerName(player.name);
        break;
      }
    }
  }, [sessionId]);

  if (!session) {
    return (
      <div className="p-8">
       <button
  onClick={() => router.push("/sessions")}
  className="underline text-sm"
>
  ← Back to Library
</button>
        <div className="mt-6">Session not found.</div>
      </div>
    );
  }

  const allPitches = session.plateAppearances.flatMap(
    (pa: any) => pa.pitches
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

       <button
  onClick={() => router.push("/sessions")}
  className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"
>
  Back to Library
</button>

        <div>
          <div className="text-xl font-semibold">{session.name}</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Player: {playerName}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <StrikeZone
            value={null}
            onChange={() => {}}
            pitches={allPitches}
          />
        </div>

      </div>
    </main>
  );
}