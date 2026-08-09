import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_META, type Role, type Player, type Settings } from "@/lib/game";
import { X, Plus, Shuffle, Play, BookOpen } from "lucide-react";

const ROLES: Role[] = ["mafia", "detective", "doctor", "citizen"];

export function SetupScreen({
  names,
  setNames,
  draft,
  onCreate,
  onShuffle,
  onSetRole,
  onSetNumber,
  onStart,
  onReset,
  settings,
  setSettings,
  onOpenHowTo,
}: {
  names: string[];
  setNames: (n: string[]) => void;
  draft: Player[] | null;
  onCreate: () => void;
  onShuffle: () => void;
  onSetRole: (id: string, role: Role) => void;
  onSetNumber: (id: string, n: number) => void;
  onStart: () => void;
  onReset: () => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  onOpenHowTo?: () => void;
}) {
  const [value, setValue] = useState("");

  const add = () => {
    const parts = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setNames([...names, ...parts]);
    setValue("");
  };

  if (!draft) {
    return (
      <div className="mx-auto max-w-xl panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl">Who&apos;s playing?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Host console — add every player at the table. Comma-separated names work too.
            </p>
          </div>
          {onOpenHowTo && (
            <Button variant="outline" size="sm" onClick={onOpenHowTo}>
              <BookOpen className="size-4" /> How to play
            </Button>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Rahul, Priya, Akash…"
          />
          <Button onClick={add}>
            <Plus className="size-4" /> Add
          </Button>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {names.map((n, i) => (
            <li
              key={`${n}-${i}`}
              className="flex items-center justify-between rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm"
            >
              <span>
                <span className="text-muted-foreground">{i + 1}.</span> {n}
              </span>
              <button
                onClick={() => setNames(names.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${n}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
          <h3 className="text-lg">Game settings</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["mafiaTimer", "Mafia wake timer (s)"],
                ["callTimer", "Number call timer (s)"],
                ["discussionTimer", "Discussion timer (s)"],
                ["voteTimer", "Voting timer (s)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-xs text-muted-foreground">
                {label}
                <input
                  type="number"
                  min={0}
                  value={settings[key]}
                  onChange={(e) =>
                    setSettings({ ...settings, [key]: Math.max(0, Number(e.target.value)) })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-center font-display text-base text-foreground"
                />
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => setSettings({ ...settings, sound: e.target.checked })}
              />
              Tick &amp; buzz sounds
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.allowRoleGuessReverse}
                onChange={(e) =>
                  setSettings({ ...settings, allowRoleGuessReverse: e.target.checked })
                }
              />
              Allow undoing a role guess
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Set a timer to 0 to disable it.</p>
        </div>

        <Button className="mt-6 w-full" size="lg" disabled={names.length < 4} onClick={onCreate}>
          Deal roles & numbers
        </Button>
        {names.length < 4 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">Need at least 4 players.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl">Roles & night numbers</h2>
          <p className="text-sm text-muted-foreground">
            Adjust anything before you start. Only you see this.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onShuffle}>
            <Shuffle className="size-4" /> Re-deal
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Back
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {draft.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3"
          >
            <input
              type="number"
              min={1}
              value={p.number}
              onChange={(e) => onSetNumber(p.id, Number(e.target.value))}
              className="w-16 rounded-md border border-input bg-background px-2 py-1 text-center font-display text-lg"
            />
            <span className="truncate font-medium">{p.name}</span>
            <div className="flex flex-wrap gap-1">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => onSetRole(p.id, r)}
                  className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                    p.role === r
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ROLE_META[r].icon} {ROLE_META[r].label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={onStart}>
        <Play className="size-4" /> Start Night 1
      </Button>
    </div>
  );
}
