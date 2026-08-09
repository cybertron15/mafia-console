import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Game, Player } from "@/lib/game";
import { useCountdown, fmt } from "@/hooks/useCountdown";
import { Sun, Vote, Timer } from "lucide-react";

export function DayPanel({
  game,
  onEliminate,
  onTie,
  onNextNight,
  dayResolved,
}: {
  game: Game;
  onEliminate: (id: string) => void;
  onTie: () => void;
  onNextNight: () => void;
  dayResolved: boolean;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const [stage, setStage] = useState<"discussion" | "vote" | "done">("discussion");
  const timer = useCountdown(game.settings.sound);
  const startedRound = useRef<number | null>(null);
  const { start } = timer;
  const { discussionTimer, voteTimer } = game.settings;

  // start discussion timer when the day begins
  useEffect(() => {
    if (startedRound.current === game.round) return;
    startedRound.current = game.round;
    setStage("discussion");
    setPick(null);
    if (discussionTimer > 0) start(discussionTimer);
  }, [game.round, discussionTimer, start]);

  // roll into the vote timer when discussion runs out
  useEffect(() => {
    if (stage !== "discussion") return;
    if (discussionTimer > 0 && !timer.running && timer.remaining === 0 && timer.total > 0) {
      setStage("vote");
      if (voteTimer > 0) start(voteTimer);
    }
  }, [stage, timer.running, timer.remaining, timer.total, discussionTimer, voteTimer, start]);

  const alive: Player[] = game.players.filter((p) => p.alive);
  const died = game.players.filter(
    (p) => p.diedRound === game.round && p.diedBy === "mafia",
  );

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sun className="size-5 text-primary" />
          <h3 className="text-xl">Day {game.round}</h3>
        </div>
        {!dayResolved && (discussionTimer > 0 || voteTimer > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-display text-sm ${
                timer.running
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              <Timer className="size-4" />
              {stage === "vote" ? "Vote" : "Discussion"} {fmt(timer.remaining)}
            </span>
            {timer.running ? (
              <Button size="sm" variant="ghost" onClick={timer.stop}>
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const secs = stage === "vote" ? voteTimer : discussionTimer;
                  if (secs > 0) timer.start(secs);
                }}
              >
                Restart
              </Button>
            )}
            {stage === "discussion" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setStage("vote");
                  if (voteTimer > 0) timer.start(voteTimer);
                  else timer.stop();
                }}
              >
                Start vote
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background/40 p-4 text-sm">
        {died.length ? (
          <p>
            ☠️ <b>{died.map((d) => d.name).join(", ")}</b> did not survive the night.
            Their role stays secret.
          </p>
        ) : (
          <p>🌅 Nobody died last night.</p>
        )}
      </div>

      {!dayResolved ? (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Vote className="size-4" /> Village vote
          </p>
          <div className="flex flex-wrap gap-1.5">
            {alive.map((p) => (
              <button
                key={p.id}
                onClick={() => setPick(pick === p.id ? null : p.id)}
                className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                  pick === p.id
                    ? "border-destructive bg-destructive/15 text-destructive"
                    : "border-border bg-secondary/40 hover:border-destructive/50"
                }`}
              >
                <span className="text-muted-foreground">{p.number}</span> {p.name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              disabled={!pick}
              onClick={() => {
                timer.stop();
                setStage("done");
                if (pick) onEliminate(pick);
              }}
            >
              Eliminate
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                timer.stop();
                setStage("done");
                onTie();
              }}
            >
              Tie — nobody dies
            </Button>
          </div>
        </div>
      ) : (
        <Button className="mt-5 w-full" size="lg" onClick={onNextNight}>
          Begin Night {game.round + 1}
        </Button>
      )}
    </section>
  );
}
