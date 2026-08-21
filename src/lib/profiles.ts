import type { RoundResult, RoundKind } from "./scoring";

/**
 * Profils, historique et statistiques par pseudo — tous modes confondus
 * (table / solo / en ligne). 100 % localStorage.
 */

export type GameMode = "table" | "solo" | "online";

export interface RecordPlayer {
  name: string;
  isBot: boolean;
  finalScore: number;
  remiSecs: number;
  contresInflicted: number;
  contresSuffered: number;
  bestRound: number;
}

export interface GameRecord {
  id: string;
  mode: GameMode;
  at: number;
  target: number;
  rounds: number;
  players: RecordPlayer[];
  winnerName: string | null;
}

export interface RoundLike {
  poserIndex: number;
  result: RoundResult;
}

const KEY_RECORDS = "remi:records";

function hasWindow(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function newId(): string {
  if (hasWindow() && "randomUUID" in crypto) return crypto.randomUUID();
  return `rec-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/** Construit un enregistrement de partie à partir de ses manches. */
export function makeRecord(
  mode: GameMode,
  players: { name: string; isBot: boolean }[],
  target: number,
  rounds: RoundLike[],
): GameRecord {
  const n = players.length;
  const finalScore = new Array(n).fill(0);
  const remiSecs = new Array(n).fill(0);
  const contresInflicted = new Array(n).fill(0);
  const contresSuffered = new Array(n).fill(0);
  const bestRound = new Array(n).fill(0);

  for (const r of rounds) {
    r.result.deltas.forEach((d, i) => {
      finalScore[i] += d;
      if (d > bestRound[i]) bestRound[i] = d;
    });
    const kind: RoundKind = r.result.kind;
    if (kind === "remi-sec") remiSecs[r.poserIndex] += 1;
    if (kind === "contre" || kind === "contre-egalite") {
      contresSuffered[r.poserIndex] += 1;
      r.result.winners.forEach((w) => {
        contresInflicted[w] += 1;
      });
    }
  }

  const recPlayers: RecordPlayer[] = players.map((p, i) => ({
    name: p.name,
    isBot: p.isBot,
    finalScore: finalScore[i],
    remiSecs: remiSecs[i],
    contresInflicted: contresInflicted[i],
    contresSuffered: contresSuffered[i],
    bestRound: bestRound[i],
  }));

  const winner = [...recPlayers].sort((a, b) => b.finalScore - a.finalScore)[0];

  return {
    id: newId(),
    mode,
    at: Date.now(),
    target,
    rounds: rounds.length,
    players: recPlayers,
    winnerName: winner ? winner.name : null,
  };
}

export function loadRecords(): GameRecord[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(KEY_RECORDS);
    const arr = raw ? (JSON.parse(raw) as GameRecord[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function recordGame(record: GameRecord): void {
  if (!hasWindow()) return;
  try {
    const all = loadRecords();
    all.unshift(record);
    window.localStorage.setItem(KEY_RECORDS, JSON.stringify(all.slice(0, 500)));
  } catch {
    /* ignore */
  }
}

// ---------- Agrégation par pseudo ----------

export interface ProfileStats {
  name: string;
  games: number;
  wins: number;
  winRate: number;
  totalPoints: number;
  bestRound: number;
  remiSecs: number;
  contresInflicted: number;
  contresSuffered: number;
  favoriteOpponent: string | null;
  currentStreak: number;
  badges: string[];
}

export function computeProfiles(records: GameRecord[]): ProfileStats[] {
  const names = new Set<string>();
  records.forEach((r) => r.players.forEach((p) => !p.isBot && names.add(p.name)));

  const stats: ProfileStats[] = [];
  for (const name of names) {
    const mine = records.filter((r) => r.players.some((p) => p.name === name && !p.isBot));
    let games = 0,
      wins = 0,
      totalPoints = 0,
      bestRound = 0,
      remiSecs = 0,
      contresInflicted = 0,
      contresSuffered = 0;
    const opponentCount = new Map<string, number>();

    // du plus récent au plus ancien pour la série en cours
    const chrono = [...mine].sort((a, b) => b.at - a.at);
    let streak = 0;
    let streakBroken = false;

    for (const r of chrono) {
      const me = r.players.find((p) => p.name === name && !p.isBot)!;
      games += 1;
      totalPoints += me.finalScore;
      bestRound = Math.max(bestRound, me.bestRound);
      remiSecs += me.remiSecs;
      contresInflicted += me.contresInflicted;
      contresSuffered += me.contresSuffered;
      const won = r.winnerName === name;
      if (won) wins += 1;
      if (!streakBroken) {
        if (won) streak += 1;
        else streakBroken = true;
      }
      r.players.forEach((p) => {
        if (p.name !== name) opponentCount.set(p.name, (opponentCount.get(p.name) ?? 0) + 1);
      });
    }

    let favoriteOpponent: string | null = null;
    let favCount = 0;
    opponentCount.forEach((c, opp) => {
      if (c > favCount) {
        favCount = c;
        favoriteOpponent = opp;
      }
    });

    const winRate = games ? Math.round((wins / games) * 100) : 0;
    const badges: string[] = [];
    if (remiSecs >= 3) badges.push("Roi du Rémi sec");
    if (contresInflicted >= 3) badges.push("Serial contreur");
    if (games >= 10) badges.push("L'increvable");
    if (winRate >= 60 && games >= 3) badges.push("Redoutable");

    stats.push({
      name,
      games,
      wins,
      winRate,
      totalPoints,
      bestRound,
      remiSecs,
      contresInflicted,
      contresSuffered,
      favoriteOpponent,
      currentStreak: streak,
      badges,
    });
  }

  return stats.sort((a, b) => b.games - a.games || b.winRate - a.winRate);
}
