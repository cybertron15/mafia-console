import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROLE_META, type Game, type Player } from "@/lib/game";
import { useCountdown, fmt } from "@/hooks/useCountdown";
import { GhostSignalsGuide } from "@/components/game/GhostSignalsGuide";
import { Megaphone, Moon, SkipForward, Timer, Users } from "lucide-react";

function TargetPicker({
  label,
  players,
  value,
  onChange,
  isDisabled,
  disabledNote,
}: {
  label: string;
  players: Player[];
  value: string | null;
  onChange: (id: string | null) => void;
  isDisabled?: (p: Player) => boolean;
  disabledNote?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {players.map((p) => {
          const blocked = isDisabled?.(p) ?? false;
          return (
            <button
              key={p.id}
              disabled={blocked}
              title={blocked ? disabledNote : undefined}
              onClick={() => onChange(value === p.id ? null : p.id)}
              className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                value === p.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 hover:border-primary/50"
              }`}
            >
              <span className="text-muted-foreground">{p.number}</span> {p.name}
            </button>
          );
        })}
        <button
          onClick={() => onChange(null)}
          className="rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          None / skipped
        </button>
      </div>
    </div>
  );
}

export function NightPanel({
  game,
  update,
  onResolve,
}: {
  game: Game;
  update: (fn: (g: Game) => Game) => void;
  onResolve: () => void;
}) {
  const alive = useMemo(() => game.players.filter((p) => p.alive), [game.players]);
  const mafia = useMemo(() => alive.filter((p) => p.role === "mafia"), [alive]);
  const byId = (id: string | null) => game.players.find((p) => p.id === id) ?? null;
  const { callOrder, calledIndex, mafiaCalled } = game.night;
  const [blocked, setBlocked] = useState<"mafia" | "numbers" | null>(null);
  const mafiaTimer = useCountdown(game.settings.sound);
  const callTimer = useCountdown(game.settings.sound);

  const setNight = (patch: Partial<Game["night"]>) =>
    update((g) => ({ ...g, night: { ...g.night, ...patch } }));

  const callMafia = () => {
    update((g) => {
      const names = g.players
        .filter((p) => p.alive && p.role === "mafia")
        .map((p) => p.name)
        .join(", ");
      return {
        ...g,
        night: { ...g.night, mafiaCalled: true },
        log: [
          {
            id: Math.random().toString(36).slice(2),
            round: g.round,
            phase: "night" as const,
            text: `🔪 Called Mafia wake${names ? ` — ${names}` : ""}`,
            at: Date.now(),
          },
          ...g.log,
        ],
      };
    });
    if (game.settings.mafiaTimer > 0) mafiaTimer.start(game.settings.mafiaTimer);
  };

  const callNext = () => {
    mafiaTimer.stop();
    update((g) => {
      const n = g.night;
      const next = n.callOrder[n.calledIndex];
      const p = g.players.find((x) => x.number === next);
      const mafiaNoAction = p?.alive && p.role === "mafia";
      const ghostTurn = p && !p.alive;
      const g2 = { ...g, night: { ...n, calledIndex: n.calledIndex + 1 } };
      return {
        ...g2,
        log: [
          {
            id: Math.random().toString(36).slice(2),
            round: g.round,
            phase: "night" as const,
            text: `Called number ${next}${
              p
                ? ` — ${p.name} (${ROLE_META[p.role].label})${
                    ghostTurn
                      ? " · 👻 Ghost signals"
                      : mafiaNoAction
                        ? " · eyes only, no action"
                        : ""
                  }`
                : ""
            }`,
            at: Date.now(),
          },
          ...g2.log,
        ],
      };
    });
    if (game.settings.callTimer > 0) callTimer.start(game.settings.callTimer);
  };

  const detectiveTarget = byId(game.night.detectiveTarget);
  const livingDoctor = alive.find((p) => p.role === "doctor");
  const livingDetective = alive.find((p) => p.role === "detective");
  const gameHasDoctor = game.players.some((p) => p.role === "doctor");
  const gameHasDetective = game.players.some((p) => p.role === "detective");
  const allCalled = callOrder.length > 0 && calledIndex >= callOrder.length;
  const currentNum = callOrder[calledIndex];
  const currentPlayer =
    currentNum != null ? game.players.find((p) => p.number === currentNum) : null;
  const highlightingDoctor =
    !!currentPlayer?.alive && currentPlayer.role === "doctor" && !allCalled;
  const highlightingDetective =
    !!currentPlayer?.alive && currentPlayer.role === "detective" && !allCalled;

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <Moon className="size-5 text-accent" />
        <h3 className="text-xl">Night {game.round}</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Night is silent — players point; you confirm with a thumbs up or down.
      </p>

      {/* 1. Mafia wake */}
      <div className="mt-4 rounded-lg border border-mafia/40 bg-mafia/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-mafia">1. Call Mafia</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              First each night. They open their eyes together, see who is who, and agree on one kill
              under the timer.
            </p>
          </div>
          {!mafiaCalled ? (
            <Button size="sm" onClick={callMafia} disabled={mafia.length === 0}>
              <Users className="size-4" /> Call Mafia
            </Button>
          ) : (
            <span className="rounded-md border border-mafia/40 bg-mafia/15 px-2.5 py-1 text-xs text-mafia">
              Mafia called
            </span>
          )}
        </div>

        {mafiaCalled && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Living Mafia:{" "}
              <span className="text-foreground">
                {mafia.map((p) => `${p.name} (#${p.number})`).join(", ") || "none"}
              </span>
            </p>
            {game.settings.mafiaTimer > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-display text-sm ${
                    mafiaTimer.running
                      ? "border-mafia bg-mafia/15 text-mafia"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Timer className="size-4" />
                  {fmt(mafiaTimer.running ? mafiaTimer.remaining : game.settings.mafiaTimer)}
                </span>
                {!mafiaTimer.running && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => mafiaTimer.start(game.settings.mafiaTimer)}
                  >
                    Restart timer
                  </Button>
                )}
                {mafiaTimer.running && (
                  <Button size="sm" variant="ghost" onClick={mafiaTimer.stop}>
                    Stop timer
                  </Button>
                )}
              </div>
            )}
            <TargetPicker
              label="🔪 Mafia kill (point — you thumbs up / down)"
              players={alive}
              value={game.night.mafiaTarget}
              onChange={(id) => setNight({ mafiaTarget: id })}
              isDisabled={(p) => p.role === "mafia"}
              disabledNote="Mafia cannot kill another Mafia"
            />
          </div>
        )}
      </div>

      {/* 2. Number calls */}
      <div
        className={`mt-4 rounded-lg border border-border bg-background/40 p-4 ${
          !mafiaCalled ? "opacity-50" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">2. Number call order</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              After Mafia. Every number is called so role counts stay hidden. Mafia open their eyes
              on their number too, but take no action.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={!mafiaCalled}
            onClick={() => {
              callTimer.stop();
              setNight({
                callOrder: [...game.players].map((p) => p.number).sort(() => Math.random() - 0.5),
                calledIndex: 0,
              });
            }}
          >
            Generate order
          </Button>
        </div>

        {!mafiaCalled ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Call Mafia first, then generate order.
          </p>
        ) : callOrder.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Generate a random order — every number gets called so nobody can count roles.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {callOrder.map((num, i) => {
                const p = game.players.find((x) => x.number === num);
                const done = i < calledIndex;
                const current = i === calledIndex;
                return (
                  <span
                    key={num}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      current
                        ? "border-primary bg-primary/20 text-primary shadow-[var(--shadow-glow)]"
                        : done
                          ? "border-border bg-secondary/50 text-muted-foreground"
                          : "border-dashed border-border text-muted-foreground/60"
                    }`}
                  >
                    <b className="font-display">{num}</b>
                    {(done || current) && p && (
                      <>
                        {" "}
                        · {p.name} · {ROLE_META[p.role].icon}
                      </>
                    )}
                  </span>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" disabled={allCalled} onClick={callNext}>
                <Megaphone className="size-4" />
                {allCalled ? "All numbers called" : `Call number ${callOrder[calledIndex]}`}
              </Button>
              {game.settings.callTimer > 0 && (
                <span
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-display text-sm ${
                    callTimer.running
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Timer className="size-4" />
                  {fmt(callTimer.running ? callTimer.remaining : game.settings.callTimer)}
                </span>
              )}
              {callTimer.running && (
                <Button size="sm" variant="ghost" onClick={callTimer.stop}>
                  Stop timer
                </Button>
              )}
            </div>
            {currentPlayer && !allCalled && (
              <>
                <p className="mt-2 text-xs text-muted-foreground">
                  Next up: <b className="text-foreground">{currentPlayer.name}</b> (
                  {ROLE_META[currentPlayer.role].label}
                  {!currentPlayer.alive ? " · Ghost" : ""})
                  {currentPlayer.alive && currentPlayer.role === "mafia" && (
                    <span className="text-mafia"> — eyes open only, no kill action</span>
                  )}
                  {currentPlayer.alive && currentPlayer.role === "citizen" && (
                    <span> — remain silent, then close eyes</span>
                  )}
                  {currentPlayer.alive && currentPlayer.role === "detective" && (
                    <span className="text-detective"> — point at one player to investigate</span>
                  )}
                  {currentPlayer.alive && currentPlayer.role === "doctor" && (
                    <span className="text-doctor"> — point at one player to protect</span>
                  )}
                  {!currentPlayer.alive && (
                    <span className="text-ghost"> — open eyes and use ghost signals</span>
                  )}
                </p>
                {!currentPlayer.alive && <GhostSignalsGuide compact aliveCount={alive.length} />}
              </>
            )}
          </>
        )}
      </div>

      {/* 3. Doctor / Detective — always visible once Mafia has been called */}
      {mafiaCalled && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">3. Record Doctor & Detective</p>
          <p className="text-xs text-muted-foreground">
            Mark these when their numbers are called (or anytime before you resolve the night).
          </p>

          <div
            className={`rounded-lg border p-4 transition-shadow ${
              highlightingDoctor
                ? "border-doctor bg-doctor/10 shadow-[var(--shadow-glow)]"
                : "border-doctor/35 bg-doctor/5"
            }`}
          >
            {livingDoctor ? (
              <TargetPicker
                label={`❤️ Doctor save — ${livingDoctor.name} (#${livingDoctor.number}) points; you thumbs up / down`}
                players={alive}
                value={game.night.doctorTarget}
                onChange={(id) => setNight({ doctorTarget: id })}
                isDisabled={(p) => p.id === game.lastDoctorTarget}
                disabledNote="Protected last night"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {gameHasDoctor
                  ? "❤️ Doctor is dead — no save tonight."
                  : "❤️ No Doctor in this game. Assign one on the deal screen (or add a 5th+ player and re-deal) if you want saves."}
              </p>
            )}
          </div>

          <div
            className={`rounded-lg border p-4 transition-shadow ${
              highlightingDetective
                ? "border-detective bg-detective/10 shadow-[var(--shadow-glow)]"
                : "border-detective/35 bg-detective/5"
            }`}
          >
            {livingDetective ? (
              <div>
                <TargetPicker
                  label={`🔎 Detective check — ${livingDetective.name} (#${livingDetective.number}) points; you thumbs up / down`}
                  players={alive}
                  value={game.night.detectiveTarget}
                  onChange={(id) => setNight({ detectiveTarget: id })}
                />
                {detectiveTarget && (
                  <p className="mt-2 rounded-md border border-detective/40 bg-detective/10 px-3 py-2 text-sm text-detective">
                    Whisper: {detectiveTarget.name} is{" "}
                    <b>{detectiveTarget.role === "mafia" ? "MAFIA" : "NOT Mafia"}</b>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {gameHasDetective
                  ? "🔎 Detective is dead — no check tonight."
                  : "🔎 No Detective in this game."}
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={() => {
          if (!mafiaCalled) {
            setBlocked("mafia");
            return;
          }
          if (!allCalled) {
            setBlocked("numbers");
            return;
          }
          mafiaTimer.stop();
          callTimer.stop();
          onResolve();
        }}
      >
        <SkipForward className="size-4" /> Resolve night → Day {game.round}
      </Button>

      <AlertDialog open={blocked !== null} onOpenChange={(o) => !o && setBlocked(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blocked === "mafia" ? "Mafia not called yet" : "Not every number was called"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blocked === "mafia"
                ? "Call Mafia first so they can wake together and pick a kill. Then run the number calls."
                : callOrder.length === 0
                  ? "Generate the call order and call every number before resolving the night."
                  : `You have called ${calledIndex} of ${callOrder.length} numbers. Call the rest so nobody can guess roles from the silence.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setBlocked(null)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
