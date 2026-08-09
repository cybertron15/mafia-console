export type Role = "mafia" | "detective" | "doctor" | "citizen";

export const ROLE_META: Record<Role, { label: string; icon: string }> = {
  mafia: { label: "Mafia", icon: "🔪" },
  detective: { label: "Detective", icon: "🔎" },
  doctor: { label: "Doctor", icon: "❤️" },
  citizen: { label: "Citizen", icon: "👤" },
};

export type Player = {
  id: string;
  name: string;
  role: Role;
  number: number;
  alive: boolean;
  spirit: number;
  usedRoleGuess: boolean;
  roleGuessCorrect?: boolean | undefined;
  diedRound: number | null;
  diedBy: "mafia" | "vote" | null;
};

export type LogEntry = {
  id: string;
  round: number;
  phase: "night" | "day" | "setup";
  text: string;
  at: number;
};

export type NightState = {
  /** Host has called “Mafia wake” this night (before number calls). */
  mafiaCalled: boolean;
  callOrder: number[];
  calledIndex: number;
  mafiaTarget: string | null;
  doctorTarget: string | null;
  detectiveTarget: string | null;
};

export type Settings = {
  sound: boolean;
  /** Seconds for the joint Mafia wake / kill decision. 0 = no timer. */
  mafiaTimer: number;
  callTimer: number;
  discussionTimer: number;
  voteTimer: number;
  allowRoleGuessReverse: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  mafiaTimer: 30,
  callTimer: 10,
  discussionTimer: 180,
  voteTimer: 60,
  allowRoleGuessReverse: true,
};

export type Game = {
  players: Player[];
  round: number;
  phase: "setup" | "night" | "day";
  night: NightState;
  lastDoctorTarget: string | null;
  log: LogEntry[];
  winner: "mafia" | "citizens" | null;
  settings: Settings;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function suggestedRoles(count: number): Role[] {
  const mafia = Math.max(1, Math.floor(count / 4));
  const detective = count >= 5 ? 1 : 0;
  // Doctor from 5+ so tables with a Detective usually get a save too
  const doctor = count >= 5 ? 1 : 0;
  const roles: Role[] = [
    ...Array<Role>(mafia).fill("mafia"),
    ...Array<Role>(detective).fill("detective"),
    ...Array<Role>(doctor).fill("doctor"),
  ];
  while (roles.length < count) roles.push("citizen");
  return shuffle(roles.slice(0, count));
}

export function createGame(names: string[], settings: Settings = DEFAULT_SETTINGS): Game {
  const roles = suggestedRoles(names.length);
  const numbers = shuffle(names.map((_, i) => i + 1));
  const players: Player[] = names.map((name, i) => ({
    id: uid(),
    name: name.trim(),
    role: roles[i]!,
    number: numbers[i]!,
    alive: true,
    spirit: 0,
    usedRoleGuess: false,
    diedRound: null,
    diedBy: null,
  }));
  return {
    players,
    round: 0,
    phase: "setup",
    night: emptyNight(),
    lastDoctorTarget: null,
    log: [],
    winner: null,
    settings,
  };
}

export const emptyNight = (): NightState => ({
  mafiaCalled: false,
  callOrder: [],
  calledIndex: 0,
  mafiaTarget: null,
  doctorTarget: null,
  detectiveTarget: null,
});

export function log(game: Game, text: string): Game {
  return {
    ...game,
    log: [
      {
        id: uid(),
        round: game.round,
        phase: game.phase === "setup" ? "setup" : game.phase,
        text,
        at: Date.now(),
      },
      ...game.log,
    ],
  };
}

export function checkWinner(players: Player[]): Game["winner"] {
  const alive = players.filter((p) => p.alive);
  const mafia = alive.filter((p) => p.role === "mafia").length;
  const citizens = alive.filter((p) => p.role === "citizen").length;
  const doctors = alive.filter((p) => p.role === "doctor").length;
  const detectives = alive.filter((p) => p.role === "detective").length;
  if (mafia === 0) return "citizens";
  // Mafia win when they equal or outnumber the town side
  if (mafia >= citizens + doctors + detectives) return "mafia";
  return null;
}

export const STORAGE_KEY = "mafia-afterlife-host-v1";

export function restartGame(game: Game): Game {
  const names = game.players.map((p) => p.name);
  return createGame(names, game.settings);
}
