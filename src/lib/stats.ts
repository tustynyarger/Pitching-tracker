import type { Pitch } from "@/types/tracker";

export function calculateStrikePercentage(pitches: Pitch[]) {
  if (pitches.length === 0) return 0;

  const strikeCount = pitches.filter(
    (p) =>
      p.result === "called_strike" ||
      p.result === "swinging_strike" ||
      p.result === "foul" ||
      p.result === "in_play"
  ).length;

  return strikeCount / pitches.length;
}

export function calculateFirstPitchStrikePercentage(
  plateAppearances: { pitches: Pitch[] }[]
) {
  if (plateAppearances.length === 0) return 0;

  const firstPitchStrikes = plateAppearances.filter((pa) => {
    const first = pa.pitches[0];
    if (!first) return false;

    return (
      first.result === "called_strike" ||
      first.result === "swinging_strike" ||
      first.result === "foul" ||
      first.result === "in_play"
    );
  }).length;

  return firstPitchStrikes / plateAppearances.length;
}

export function calculateAveragePitchesPerPA(
  plateAppearances: { pitches: Pitch[] }[]
) {
  if (plateAppearances.length === 0) return 0;

  const total = plateAppearances.reduce(
    (sum, pa) => sum + pa.pitches.length,
    0
  );

  return total / plateAppearances.length;
}