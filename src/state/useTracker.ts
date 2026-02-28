"use client";

import { useMemo, useState } from "react";
import type { Pitch, PitchResult, ZonePoint } from "@/types/tracker";
import { countFromPitches } from "@/lib/count";
import { getPlayers, savePlayers } from "@/lib/storage";

function makeId() {
  return crypto.randomUUID();
}

function deriveSwingContact(result: PitchResult) {
  if (result === "ball") return { swing: false, contact: false };
  if (result === "called_strike") return { swing: false, contact: false };
  if (result === "swinging_strike") return { swing: true, contact: false };
  if (result === "foul") return { swing: true, contact: true };
  if (result === "in_play") return { swing: true, contact: true };
  return { swing: false, contact: false };
}

export function useTracker() {
  const [pendingLocation, setPendingLocation] = useState<ZonePoint | null>(null);
  const [pendingInPlay, setPendingInPlay] = useState<Pitch[] | null>(null);

  const [abPitches, setAbPitches] = useState<Pitch[]>([]);
  const [plateAppearances, setPlateAppearances] = useState<
    { id: string; pitches: Pitch[]; endType: "WALK" | "K" | "IN_PLAY" }[]
  >([]);

  const [walks, setWalks] = useState(0);
  const [strikeouts, setStrikeouts] = useState(0);
  const [hits, setHits] = useState(0);

  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  const count = useMemo(() => countFromPitches(abPitches), [abPitches]);

  function finalizePA(
    pitchesToFinalize: Pitch[],
    endType: "WALK" | "K" | "IN_PLAY"
  ) {
    setPlateAppearances((prev) => [
      ...prev,
      { id: makeId(), pitches: pitchesToFinalize, endType },
    ]);

    // reset AB
    setAbPitches([]);
    setPendingLocation(null);
  }

  function recordPitch(result: PitchResult) {
    if (!pendingLocation) return;

    const { swing, contact } = deriveSwingContact(result);

    const nextPitch: Pitch = {
      id: makeId(),
      result,
      swing,
      contact,
      location: pendingLocation,
      pitchNumberInAB: abPitches.length + 1, // now safe, controlled source
    };

    const nextPitches = [...abPitches, nextPitch];
    const nextCount = countFromPitches(nextPitches);

    if (nextCount.balls >= 4) {
      setWalks((w) => w + 1);
      finalizePA(nextPitches, "WALK");
      return;
    }

    if (nextCount.strikes >= 3) {
      setStrikeouts((k) => k + 1);
      finalizePA(nextPitches, "K");
      return;
    }

    if (result === "in_play") {
      setPendingInPlay(nextPitches);
      return;
    }

    setAbPitches(nextPitches);
    setPendingLocation(null);
  }

  function resolveInPlay(outcome: "HIT" | "OUT") {
    if (!pendingInPlay) return;

    if (outcome === "HIT") {
      setHits((h) => h + 1);
    }

    finalizePA(pendingInPlay, "IN_PLAY");
    setPendingInPlay(null);
  }

  function clearSession() {
    setAbPitches([]);
    setPlateAppearances([]);
    setWalks(0);
    setStrikeouts(0);
    setHits(0);
    setPendingLocation(null);
    setPendingInPlay(null);
  }

  function undoLastPitch() {
    if (abPitches.length > 0) {
      const updated = abPitches.slice(0, -1);

      // re-number safely
      const renumbered = updated.map((p, i) => ({
        ...p,
        pitchNumberInAB: i + 1,
      }));

      setAbPitches(renumbered);
      return;
    }

    if (plateAppearances.length > 0) {
      const last = plateAppearances[plateAppearances.length - 1];

      setPlateAppearances((prev) => prev.slice(0, -1));

      // restore AB and re-number cleanly
      const restored = last.pitches.map((p, i) => ({
        ...p,
        pitchNumberInAB: i + 1,
      }));

      setAbPitches(restored);

      if (last.endType === "WALK") setWalks((w) => Math.max(0, w - 1));
      if (last.endType === "K") setStrikeouts((k) => Math.max(0, k - 1));
      if (last.endType === "IN_PLAY") setHits((h) => Math.max(0, h - 1));
    }
  }

  function saveSessionToPlayer(sessionName: string) {
    if (!currentPlayerId || !sessionName) return;

    const players = getPlayers();
    const index = players.findIndex((p) => p.id === currentPlayerId);
    if (index === -1) return;

    players[index].sessions.push({
      id: makeId(),
      name: sessionName,
      date: new Date().toISOString(),
      plateAppearances,
      walks,
      strikeouts,
      hits,
      totalPitches,
    });

    savePlayers(players);
  }

  const totalPitches = useMemo(() => {
    const completed = plateAppearances.reduce(
      (sum, pa) => sum + pa.pitches.length,
      0
    );
    return completed + abPitches.length;
  }, [plateAppearances, abPitches]);

  return {
    pendingLocation,
    setPendingLocation,
    pendingInPlay,
    abPitches,
    plateAppearances,
    walks,
    strikeouts,
    hits,
    totalPitches,
    count,
    recordPitch,
    resolveInPlay,
    undoLastPitch,
    currentPlayerId,
    setCurrentPlayerId,
    saveSessionToPlayer,
    clearSession,
  };
}