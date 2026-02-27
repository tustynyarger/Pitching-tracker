import type { Pitch } from "@/types/tracker";

export type Count = { balls: number; strikes: number };

export const initialCount = (): Count => ({ balls: 0, strikes: 0 });

export function applyPitchToCount(prev: Count, pitch: Pitch): Count {
  if (pitch.result === "ball") {
    return { balls: Math.min(4, prev.balls + 1), strikes: prev.strikes };
  }

  if (pitch.result === "foul") {
    const nextStrikes = prev.strikes < 2 ? prev.strikes + 1 : 2;
    return { balls: prev.balls, strikes: nextStrikes };
  }

  if (pitch.result === "called_strike" || pitch.result === "swinging_strike") {
    return { balls: prev.balls, strikes: Math.min(3, prev.strikes + 1) };
  }

  // in_play: count doesn’t matter after ball is put in play
  return prev;
}

export function countFromPitches(pitches: Pitch[]): Count {
  return pitches.reduce((c, p) => applyPitchToCount(c, p), initialCount());
}