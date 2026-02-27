export type PitchResult =
  | "ball"
  | "called_strike"
  | "swinging_strike"
  | "foul"
  | "in_play";

export type ZonePoint = {
  x: number;
  y: number;
};

export type Pitch = {
  id: string;
  result: PitchResult;
  swing: boolean;
  contact: boolean;
  location: ZonePoint;
  pitchNumberInAB: number;
};