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
          className="px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"
        >
          Back to Library
        </button>
        <div className="mt-6">Session not found.</div>
      </div>
    );
  }

  const allPitches = session.plateAppearances.flatMap(
    (pa: any) => pa.pitches
  );

  const totalPitches = session.totalPitches;
  const totalPA = session.plateAppearances.length;

  const totalStrikes = allPitches.filter(
    (p: any) =>
      p.result === "called_strike" ||
      p.result === "swinging_strike" ||
      p.result === "foul" ||
      p.result === "in_play"
  ).length;

  const strikePct =
    totalPitches > 0
      ? ((totalStrikes / totalPitches) * 100).toFixed(1)
      : "—";

  const firstPitchStrikes = session.plateAppearances.filter(
    (pa: any) => {
      const first = pa.pitches[0];
      if (!first) return false;

      return (
        first.result === "called_strike" ||
        first.result === "swinging_strike" ||
        first.result === "foul" ||
        first.result === "in_play"
      );
    }
  ).length;

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
      ? ((session.strikeouts / totalPA) * 100).toFixed(1)
      : "—";

  const bbPct =
    totalPA > 0
      ? ((session.walks / totalPA) * 100).toFixed(1)
      : "—";

  const hitPct =
    totalPA > 0
      ? ((session.hits / totalPA) * 100).toFixed(1)
      : "—";

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <Link
          href="/sessions"
          className="inline-block px-4 py-2 rounded-xl border-2 border-lime-400 text-black text-sm font-medium bg-white hover:bg-lime-50 transition"
        >
          Back to Library
        </Link>

        <div>
          <div className="text-xl font-semibold">{session.name}</div>
          <div className="text-sm text-zinc-500">
            Player: {playerName}
          </div>
        </div>

        {/* Heat Map */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <StrikeZone
            value={null}
            onChange={() => {}}
            pitches={allPitches}
          />
        </div>

        {/* Totals */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-6 text-center text-sm">
            <Metric label="Total Pitches" value={totalPitches} />
            <Metric label="Plate Appearances" value={totalPA} />
            <Metric label="Hits" value={session.hits} />
            <Metric label="Strikeouts" value={session.strikeouts} />
            <Metric label="Walks" value={session.walks} />
          </div>
        </div>

        {/* Ratios */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
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
}al