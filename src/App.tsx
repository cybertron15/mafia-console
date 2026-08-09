import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SetupScreen } from "@/components/game/SetupScreen";
import { HowToPlay } from "@/components/game/HowToPlay";
import { RosterPanel } from "@/components/game/RosterPanel";
import { NightPanel } from "@/components/game/NightPanel";
import { DayPanel } from "@/components/game/DayPanel";
import { GhostPanel } from "@/components/game/GhostPanel";
import {
  createGame,
  emptyNight,
  log,
  checkWinner,
  shuffle,
  suggestedRoles,
  STORAGE_KEY,
  ROLE_META,
  DEFAULT_SETTINGS,
  restartGame,
  type Settings,
  type Game,
  type Role,
} from "@/lib/game";
import { BookOpen, MonitorPlay, RotateCcw, ScrollText } from "lucide-react";

type PreGameTab = "host" | "howto";

export default function App() {
  const [names, setNames] = useState<string[]>([]);
  const [draft, setDraft] = useState<Game | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [reveal, setReveal] = useState(true);
  const [dayResolved, setDayResolved] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [preGameTab, setPreGameTab] = useState<PreGameTab>("host");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const g = parsed.game ?? null;
        if (g?.night && typeof g.night.mafiaCalled !== "boolean") {
          // Older saves: assume mafia already woke if number calls had started.
          g.night.mafiaCalled = (g.night.callOrder?.length ?? 0) > 0 || !!g.night.mafiaTarget;
        }
        setGame(g);
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
        setDayResolved(!!parsed.dayResolved);
      } catch {
        /* ignore */
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ game, dayResolved, settings }));
  }, [game, dayResolved, settings, loaded]);

  const update = (fn: (g: Game) => Game) => setGame((g) => (g ? fn(g) : g));

  const resetAll = () => {
    setGame(null);
    setDraft(null);
    setNames([]);
    setDayResolved(false);
  };

  /* ---------- setup ---------- */
  if (!game) {
    return (
      <Shell>
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-1">
            <button
              type="button"
              onClick={() => setPreGameTab("host")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                preGameTab === "host"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MonitorPlay className="size-4" />
              Host console
            </button>
            <button
              type="button"
              onClick={() => setPreGameTab("howto")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                preGameTab === "howto"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="size-4" />
              How to play
            </button>
          </div>
        </div>

        {preGameTab === "howto" ? (
          <HowToPlay onBack={() => setPreGameTab("host")} />
        ) : (
          <SetupScreen
            names={names}
            setNames={setNames}
            draft={draft?.players ?? null}
            settings={settings}
            setSettings={setSettings}
            onCreate={() => setDraft(createGame(names, settings))}
            onShuffle={() =>
              setDraft((d) => {
                if (!d) return d;
                const roles = suggestedRoles(d.players.length);
                const nums = shuffle(d.players.map((_, i) => i + 1));
                return {
                  ...d,
                  players: d.players.map((p, i) => ({
                    ...p,
                    role: roles[i]!,
                    number: nums[i]!,
                  })),
                };
              })
            }
            onSetRole={(id, role: Role) =>
              setDraft((d) =>
                d ? { ...d, players: d.players.map((p) => (p.id === id ? { ...p, role } : p)) } : d,
              )
            }
            onSetNumber={(id, n) =>
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      players: d.players.map((p) => (p.id === id ? { ...p, number: n } : p)),
                    }
                  : d,
              )
            }
            onStart={() => {
              if (!draft) return;
              const started: Game = { ...draft, round: 1, phase: "night", settings };
              setGame(
                log(
                  started,
                  `Game started with ${started.players.length} players · ${started.players.filter((p) => p.role === "mafia").length} Mafia`,
                ),
              );
              setDraft(null);
            }}
            onReset={() => setDraft(null)}
            onOpenHowTo={() => setPreGameTab("howto")}
          />
        )}
      </Shell>
    );
  }

  /* ---------- actions ---------- */
  const withWinnerLog = (g: Game): Game => {
    if (g.winner === "mafia") {
      return log(g, "🏁 Game over — Mafia win (mafia ≥ citizens + doctors + detective)");
    }
    if (g.winner === "citizens") {
      return log(g, "🏁 Game over — Citizens win (all mafia eliminated)");
    }
    return g;
  };

  const resolveNight = () => {
    update((g) => {
      if (g.winner) return g;
      const victimId =
        g.night.mafiaTarget && g.night.mafiaTarget !== g.night.doctorTarget
          ? g.night.mafiaTarget
          : null;
      const victim = g.players.find((p) => p.id === victimId);
      const saved = g.night.mafiaTarget && !victimId;
      const players = g.players.map((p) =>
        p.id === victimId
          ? { ...p, alive: false, diedRound: g.round, diedBy: "mafia" as const }
          : p,
      );
      const winner = checkWinner(players);
      let next: Game = {
        ...g,
        players,
        phase: winner ? g.phase : "day",
        lastDoctorTarget: g.night.doctorTarget,
        winner,
      };
      const det = g.players.find((p) => p.id === g.night.detectiveTarget);
      if (det)
        next = log(
          next,
          `🔎 Detective checked ${det.name} → ${det.role === "mafia" ? "MAFIA" : "Not Mafia"}`,
        );
      const doc = g.players.find((p) => p.id === g.night.doctorTarget);
      if (doc) next = log(next, `❤️ Doctor protected ${doc.name}`);
      next = log(
        next,
        victim
          ? `🔪 Mafia killed ${victim.name} (${ROLE_META[victim.role].label})`
          : saved
            ? `🛡️ The Mafia target survived — Doctor saved them`
            : `🌙 No kill this night`,
      );
      return withWinnerLog(next);
    });
    setDayResolved(false);
  };

  const eliminate = (id: string) => {
    update((g) => {
      if (g.winner) return g;
      const target = g.players.find((p) => p.id === id)!;
      const players = g.players.map((p) =>
        p.id === id ? { ...p, alive: false, diedRound: g.round, diedBy: "vote" as const } : p,
      );
      return withWinnerLog(
        log(
          { ...g, players, winner: checkWinner(players) },
          `🗳️ Village voted out ${target.name} (${ROLE_META[target.role].label}) → 👻 Ghost`,
        ),
      );
    });
    setDayResolved(true);
  };

  const tie = () => {
    update((g) => log(g, "🗳️ Vote tied — nobody was eliminated"));
    setDayResolved(true);
  };

  const nextNight = () => {
    update((g) => {
      if (g.winner) return g;
      return log({ ...g, round: g.round + 1, phase: "night", night: emptyNight() }, "");
    });
    update((g) => ({ ...g, log: g.log.filter((l) => l.text !== "") }));
    setDayResolved(false);
  };

  const addSpirit = (id: string, amount: number, reason: string) =>
    update((g) => {
      const p = g.players.find((x) => x.id === id)!;
      return log(
        {
          ...g,
          players: g.players.map((x) =>
            x.id === id ? { ...x, spirit: Math.max(0, x.spirit + amount) } : x,
          ),
        },
        `⚡ ${p.name} ${amount >= 0 ? "+" : ""}${amount} spirit — ${reason}`,
      );
    });

  const useRoleGuess = (id: string, correct: boolean) =>
    update((g) => {
      const p = g.players.find((x) => x.id === id)!;
      return log(
        {
          ...g,
          players: g.players.map((x) =>
            x.id === id
              ? {
                  ...x,
                  usedRoleGuess: true,
                  roleGuessCorrect: correct,
                  spirit: x.spirit + (correct ? 4 : 0),
                }
              : x,
          ),
        },
        `⚡ ${p.name} used their hidden-role guess — ${correct ? "correct (+4)" : "wrong"}`,
      );
    });

  const reverseRoleGuess = (id: string) =>
    update((g) => {
      const p = g.players.find((x) => x.id === id)!;
      return log(
        {
          ...g,
          players: g.players.map((x) =>
            x.id === id
              ? {
                  ...x,
                  usedRoleGuess: false,
                  roleGuessCorrect: undefined,
                  spirit: Math.max(0, x.spirit - (x.roleGuessCorrect ? 4 : 0)),
                }
              : x,
          ),
        },
        `↩️ ${p.name}'s hidden-role guess was undone by the host`,
      );
    });

  const spend = (id: string, cost: number, message: string) =>
    update((g) => {
      const p = g.players.find((x) => x.id === id)!;
      return log(
        {
          ...g,
          players: g.players.map((x) => (x.id === id ? { ...x, spirit: x.spirit - cost } : x)),
        },
        `👻 Ghost message (−${cost}): “${message}”`,
      );
    });

  const aliveMafia = game.players.filter((p) => p.alive && p.role === "mafia").length;
  const aliveTotal = game.players.filter((p) => p.alive).length;

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Stat label="Round" value={String(game.round)} />
          <Stat label="Alive" value={String(aliveTotal)} />
          <Stat label="Mafia left" value={String(aliveMafia)} />
          <Stat label="Ghosts" value={String(game.players.length - aliveTotal)} />
        </div>
        <Button variant="ghost" size="sm" onClick={resetAll}>
          <RotateCcw className="size-4" /> New game
        </Button>
      </div>

      {game.winner && (
        <div className="mb-4 rounded-xl border border-primary/50 bg-primary/10 p-5 text-center">
          <h2 className="text-2xl ember-text">
            {game.winner === "mafia" ? "🔪 Mafia win" : "👥 Citizens win"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {game.winner === "mafia"
              ? "Mafia equaled or outnumbered citizens + doctors + detective."
              : "All mafia were eliminated."}{" "}
            {game.players
              .filter((p) => p.role === "mafia")
              .map((p) => p.name)
              .join(", ")}{" "}
            were the Mafia.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => {
                setGame((g) => (g ? restartGame(g) : g));
                setDayResolved(false);
              }}
            >
              <RotateCcw className="size-4" /> Restart with same players
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {!game.winner &&
            (game.phase === "night" ? (
              <NightPanel game={game} update={update} onResolve={resolveNight} />
            ) : (
              <DayPanel
                game={game}
                dayResolved={dayResolved}
                onEliminate={eliminate}
                onTie={tie}
                onNextNight={nextNight}
              />
            ))}
          {!game.winner && (
            <GhostPanel
              game={game}
              addSpirit={addSpirit}
              spend={spend}
              useRoleGuess={useRoleGuess}
              reverseRoleGuess={reverseRoleGuess}
            />
          )}
        </div>

        <div className="space-y-4">
          <RosterPanel players={game.players} reveal={reveal} setReveal={setReveal} />
          <section className="panel p-4">
            <h3 className="flex items-center gap-2 text-lg">
              <ScrollText className="size-4 text-primary" /> Game log
            </h3>
            <ul className="mt-3 max-h-96 space-y-1.5 overflow-y-auto pr-1 text-xs">
              {game.log.map((l) => (
                <li key={l.id} className="rounded-md bg-secondary/40 px-2.5 py-1.5">
                  <span className="mr-1 text-muted-foreground">
                    {l.phase === "night" ? "🌙" : l.phase === "day" ? "☀️" : "•"} R{l.round}
                  </span>
                  {l.text}
                </li>
              ))}
              {!game.log.length && <li className="text-muted-foreground">Nothing yet.</li>}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-border bg-secondary/40 px-2.5 py-1.5">
      <span className="text-muted-foreground">{label}</span>{" "}
      <b className="font-display text-primary">{value}</b>
    </span>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8">
      <header className="mx-auto mb-8 max-w-5xl text-center">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Mafia: The Afterlife"
          className="mx-auto size-28 rounded-2xl object-cover shadow-[var(--shadow-glow)] sm:size-36"
          width={144}
          height={144}
        />
        <h1 className="mt-4 text-3xl ember-text sm:text-4xl">Mafia: The Afterlife</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Host console — lie, investigate, betray. Even death isn&apos;t the end.
        </p>
      </header>
      <div className="mx-auto max-w-5xl">{children}</div>
    </main>
  );
}
