import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROLE_META, type Game, type Player } from "@/lib/game";
import { Ghost, Sparkles, Undo2 } from "lucide-react";

type Power = {
  id: string;
  cost: number;
  icon: string;
  name: string;
  min: number;
  max: number;
  build: (n: string[], p: Player[]) => string;
};

const POWERS: Power[] = [
  {
    id: "whisper",
    cost: 3,
    icon: "🌬️",
    name: "Whisper",
    min: 1,
    max: 1,
    build: (n) => `A whisper drifts toward ${n[0]}: trust is thin tonight.`,
  },
  {
    id: "murmur",
    cost: 4,
    icon: "🕯️",
    name: "Murmur",
    min: 2,
    max: 3,
    build: (n) => `Among ${list(n)}, suspicion should fall.`,
  },
  {
    id: "omen",
    cost: 8,
    icon: "🔮",
    name: "Omen",
    min: 2,
    max: 3,
    build: (n) => `Among ${list(n)}, exactly ONE is Mafia.`,
  },
  {
    id: "cleanse",
    cost: 10,
    icon: "🕊️",
    name: "Cleanse",
    min: 1,
    max: 1,
    build: (n) => `${n[0]} is INNOCENT — the spirits vouch for them.`,
  },
  {
    id: "revelation",
    cost: 14,
    icon: "👁️",
    name: "Revelation",
    min: 3,
    max: 3,
    build: (n) => `Of ${list(n)}, exactly TWO are innocent.`,
  },
  {
    id: "unmask",
    cost: 18,
    icon: "💀",
    name: "Unmask",
    min: 1,
    max: 1,
    build: (n, players) => {
      const p = players.find((x) => x.name === n[0]);
      return `The spirits name ${n[0]} — their role is ${p ? ROLE_META[p.role].label.toUpperCase() : "UNKNOWN"}.`;
    },
  },
];

function list(n: string[]) {
  if (n.length < 2) return n.join("");
  return `${n.slice(0, -1).join(", ")} & ${n[n.length - 1]}`;
}

export function GhostPanel({
  game,
  addSpirit,
  spend,
  useRoleGuess,
  reverseRoleGuess,
}: {
  game: Game;
  addSpirit: (id: string, amount: number, reason: string) => void;
  spend: (id: string, cost: number, message: string) => void;
  useRoleGuess: (id: string, correct: boolean) => void;
  reverseRoleGuess: (id: string) => void;
}) {
  const ghosts = game.players.filter((p) => !p.alive);
  const alive = game.players.filter((p) => p.alive);
  const [openId, setOpenId] = useState<string | null>(null);
  const [targets, setTargets] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [confirmReverse, setConfirmReverse] = useState<Player | null>(null);

  if (!ghosts.length) {
    return (
      <section className="panel p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground">
          <Ghost className="size-5 text-ghost" />
          <h3 className="text-xl">The Afterlife</h3>
        </div>
        <p className="mt-2">No ghosts yet. The dead will appear here.</p>
      </section>
    );
  }

  const toggle = (name: string) =>
    setTargets((t) =>
      t.includes(name) ? t.filter((x) => x !== name) : t.length < 3 ? [...t, name] : t,
    );

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <Ghost className="size-5 text-ghost" />
        <h3 className="text-xl">The Afterlife</h3>
      </div>

      <div className="mt-4 space-y-3">
        {ghosts.map((g: Player) => (
          <div key={g.id} className="rounded-lg border border-border bg-background/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                <span className="font-display text-primary">{g.number}</span> {g.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  died {g.diedBy === "vote" ? "by vote" : "at night"} · round {g.diedRound}
                </span>
              </p>
              <span className="rounded-md border border-ghost/40 bg-ghost/10 px-2 py-0.5 text-sm text-ghost">
                <Sparkles className="mr-1 inline size-3" />
                {g.spirit} spirit
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <Button size="sm" variant="secondary" onClick={() => addSpirit(g.id, 2, "correct victim prediction")}>
                +2 victim
              </Button>
              <Button size="sm" variant="secondary" onClick={() => addSpirit(g.id, 2, "correct vote-out prediction")}>
                +2 vote-out
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={g.usedRoleGuess}
                onClick={() => useRoleGuess(g.id, true)}
              >
                +4 role ✓
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={g.usedRoleGuess}
                onClick={() => useRoleGuess(g.id, false)}
              >
                role ✗
              </Button>
              {game.settings.allowRoleGuessReverse && g.usedRoleGuess && (
                <Button size="sm" variant="ghost" onClick={() => setConfirmReverse(g)}>
                  <Undo2 className="size-3" /> Undo role guess
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => addSpirit(g.id, -2, "manual adjust")}>
                −2
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setOpenId(openId === g.id ? null : g.id);
                  setTargets([]);
                  setCustom("");
                }}
              >
                Spend
              </Button>
            </div>

            {openId === g.id && (
              <div className="mt-3 rounded-md border border-border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Pick living players ({targets.length}/3 selected), then choose how{" "}
                  {g.name} spends their {g.spirit} spirit.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {alive.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.name)}
                      className={`rounded-md border px-2 py-1 text-xs ${
                        targets.includes(p.name)
                          ? "border-ghost bg-ghost/15 text-ghost"
                          : "border-border hover:border-ghost/50"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid gap-2">
                  {POWERS.map((pw) => {
                    const countOk = targets.length >= pw.min && targets.length <= pw.max;
                    const affordable = g.spirit >= pw.cost;
                    const ok = countOk && affordable;
                    const preview = pw.build(
                      countOk ? targets : Array.from({ length: pw.min }, (_, i) => `Player ${i + 1}`),
                      game.players,
                    );
                    return (
                      <button
                        key={pw.id}
                        disabled={!ok}
                        onClick={() => {
                          spend(g.id, pw.cost, preview);
                          setOpenId(null);
                        }}
                        className="rounded-md border border-border bg-background/60 p-2 text-left text-xs disabled:opacity-40"
                      >
                        <b>
                          {pw.icon} {pw.name}
                        </b>{" "}
                        <span className="text-muted-foreground">
                          — {pw.cost} spirit ·{" "}
                          {pw.min === pw.max ? `${pw.min} target` : `${pw.min}–${pw.max} targets`}
                          {!affordable && " · not enough spirit"}
                        </span>
                        <p className="mt-1 italic text-muted-foreground">“{preview}”</p>
                      </button>
                    );
                  })}

                  <div className="rounded-md border border-dashed border-border p-2">
                    <p className="text-xs">
                      ✍️ <b>Custom message</b>{" "}
                      <span className="text-muted-foreground">— 5 spirit</span>
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                        placeholder="Write the ghost's message…"
                        className="h-8 text-xs"
                      />
                      <Button
                        size="sm"
                        disabled={g.spirit < 5 || !custom.trim()}
                        onClick={() => {
                          spend(g.id, 5, custom.trim());
                          setCustom("");
                          setOpenId(null);
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!confirmReverse}
        onOpenChange={(o) => !o && setConfirmReverse(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo the hidden-role guess?</AlertDialogTitle>
            <AlertDialogDescription>
              This gives {confirmReverse?.name} their one-time role guess back and removes
              any spirit it awarded. Use it only to fix a mistake.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmReverse) reverseRoleGuess(confirmReverse.id);
                setConfirmReverse(null);
              }}
            >
              Undo it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
