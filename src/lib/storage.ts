export type SavedSession = {
  id: string;
  name?: string;
  date: string;
  plateAppearances: any[];
  walks: number;
  strikeouts: number;
  hits: number;
  totalPitches: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  sessions: SavedSession[];
};

const STORAGE_KEY = "softball_players";

export function getPlayers(): PlayerProfile[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePlayers(players: PlayerProfile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

export function createPlayer(name: string): PlayerProfile {
  return {
    id: crypto.randomUUID(),
    name,
    sessions: [],
  };
}