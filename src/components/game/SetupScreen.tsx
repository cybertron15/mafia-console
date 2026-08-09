import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_META, type Role, type Player, type Settings } from "@/lib/game";
import { X, Plus, Shuffle, Play, BookOpen, Check, Clock, Volume2, Undo2 } from "lucide-react";

function fmtSeconds(s: number) {
  if (s <= 0) return "Off";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, "0")}` : `${sec}s`;
}

function SettingToggle({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
        checked
          ? "border-primary/40 bg-primary/10"
          : "border-border bg-background/40 hover:border-border hover:bg-secondary/50"
      }`}
    >
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 text-transparent"
        }`}
      >
        <Check className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {icon}
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

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
  const [dupNote, setDupNote] = useState<string | null>(null);

  const add = () => {
    const parts = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;

    const taken = new Set(names.map((n) => n.toLowerCase()));
    const unique: string[] = [];
    const dups: string[] = [];

    for (const name of parts) {
      const key = name.toLowerCase();
      if (taken.has(key)) {
        dups.push(name);
        continue;
      }
      taken.add(key);
      unique.push(name);
    }

    if (unique.length) setNames([...names, ...unique]);
    setDupNote(
      dups.length
        ? `Skipped duplicate name${dups.length > 1 ? "s" : ""}: ${dups.join(", ")}`
        : null,
    );
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
            onChange={(e) => {
              setValue(e.target.value);
              if (dupNote) setDupNote(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Rahul, Priya, Akash…"
          />
          <Button onClick={add}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        {dupNote && <p className="mt-2 text-xs text-destructive">{dupNote}</p>}

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

        <div className="mt-6 space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div>
            <h3 className="font-display text-lg">Game settings</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tune timers and host options before dealing roles.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              Timers
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["mafiaTimer", "Mafia wake", "Joint kill decision"],
                  ["callTimer", "Number call", "Per secret number"],
                  ["discussionTimer", "Discussion", "Day talk time"],
                  ["voteTimer", "Voting", "Elimination vote"],
                ] as const
              ).map(([key, label, hint]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {hint} · {fmtSeconds(settings[key])}
                    </span>
                  </span>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={settings[key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [key]: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="h-9 w-20 shrink-0 text-center font-display"
                    aria-label={`${label} in seconds`}
                  />
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Set any timer to 0 to turn it off.</p>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Options
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <SettingToggle
                checked={settings.sound}
                onChange={(sound) => setSettings({ ...settings, sound })}
                icon={<Volume2 className="size-3.5 text-primary" />}
                title="Timer sounds"
                description="Tick countdown and buzz when time’s up"
              />
              <SettingToggle
                checked={settings.allowRoleGuessReverse}
                onChange={(allowRoleGuessReverse) =>
                  setSettings({ ...settings, allowRoleGuessReverse })
                }
                icon={<Undo2 className="size-3.5 text-primary" />}
                title="Undo role guesses"
                description="Let the host reverse a ghost’s one-time guess"
              />
            </div>
          </div>
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

      <p className="mt-4 text-xs text-muted-foreground">
        Dealt:{" "}
        {(
          [
            ["mafia", "Mafia"],
            ["detective", "Detective"],
            ["doctor", "Doctor"],
            ["citizen", "Citizen"],
          ] as const
        )
          .map(([role, label]) => {
            const n = draft.filter((p) => p.role === role).length;
            return n ? `${n} ${label}` : null;
          })
          .filter(Boolean)
          .join(" · ")}
        {!draft.some((p) => p.role === "doctor") && (
          <span className="text-doctor">
            {" "}
            · No Doctor — tap Doctor on a player if you want night saves
          </span>
        )}
      </p>

      <div className="mt-3 space-y-2">
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
