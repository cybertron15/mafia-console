import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GhostSignalsGuide } from "@/components/game/GhostSignalsGuide";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

/**
 * Guided explainer for new players — content mirrors the official
 * Mafia: The Afterlife rules draft, paced for quick understanding.
 */

type Role = "mafia" | "detective" | "doctor" | "citizen";

const ROLE: Record<Role, { icon: string; label: string; tip: string; tone: string }> = {
  mafia: {
    icon: "🔪",
    label: "Mafia",
    tip: "First the host calls “Mafia.” You wake together, see who is who, and silently agree on one kill under the timer. Later, when your number is called, open your eyes again — but take no action.",
    tone: "border-mafia/45 bg-mafia/10 text-mafia",
  },
  detective: {
    icon: "🔎",
    label: "Detective",
    tip: "When your number is called: silently point at 1 player. Host confirms with a thumbs up, then whispers Mafia / Not Mafia.",
    tone: "border-detective/45 bg-detective/10 text-detective",
  },
  doctor: {
    icon: "❤️",
    label: "Doctor",
    tip: "When your number is called: silently point at 1 player to protect. Host thumbs up / down. Cannot protect the same person two nights in a row.",
    tone: "border-doctor/45 bg-doctor/10 text-doctor",
  },
  citizen: {
    icon: "👤",
    label: "Citizen",
    tip: "Nothing to do — remain silent on your turn, then close your eyes again.",
    tone: "border-citizen/45 bg-citizen/10 text-citizen",
  },
};

type Cast = { name: string; role: Role; number: number };

const CAST: Cast[] = [
  { name: "Rahul", role: "mafia", number: 3 },
  { name: "Priya", role: "detective", number: 1 },
  { name: "Akash", role: "doctor", number: 5 },
  { name: "Meera", role: "citizen", number: 2 },
  { name: "Dev", role: "mafia", number: 4 },
  { name: "Sara", role: "citizen", number: 6 },
];

type StepId =
  "hook" | "teams" | "loop" | "night" | "day" | "ghost" | "signals" | "spirit" | "win" | "demo";

const STEPS: { id: StepId; label: string }[] = [
  { id: "hook", label: "Start" },
  { id: "teams", label: "Teams" },
  { id: "loop", label: "Loop" },
  { id: "night", label: "Night" },
  { id: "day", label: "Day" },
  { id: "ghost", label: "Ghosts" },
  { id: "signals", label: "Signals" },
  { id: "spirit", label: "Spirit" },
  { id: "win", label: "Win" },
  { id: "demo", label: "Demo" },
];

export function HowToPlay({ onBack }: { onBack: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i]!;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Learn the game
          </p>
          <h2 className="text-2xl ember-text sm:text-3xl">Mafia: The Afterlife</h2>
        </div>
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="size-4" /> Host setup
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-1.5">
        {STEPS.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onClick={() => setI(idx)}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              idx === i ? "bg-primary" : idx < i ? "bg-primary/45" : "bg-secondary"
            }`}
          />
        ))}
      </div>
      <p className="mb-3 text-center text-xs text-muted-foreground">
        {step.label} · {i + 1}/{STEPS.length}
      </p>

      <div key={step.id} className="panel how-to-enter p-5 sm:p-7">
        {step.id === "hook" && <Hook />}
        {step.id === "teams" && <Teams />}
        {step.id === "loop" && <Loop />}
        {step.id === "night" && <Night />}
        {step.id === "day" && <Day />}
        {step.id === "ghost" && <Ghosts />}
        {step.id === "signals" && <GhostSignalsGuide />}
        {step.id === "spirit" && <Spirit />}
        {step.id === "win" && <Win />}
        {step.id === "demo" && <Demo />}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" disabled={i === 0} onClick={() => setI((x) => x - 1)}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        {i < STEPS.length - 1 ? (
          <Button onClick={() => setI((x) => x + 1)}>
            Continue <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={onBack}>
            Got it — open host console <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------- slides ---------- */

function Hook() {
  return (
    <div className="space-y-5 text-center">
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt=""
        className="mx-auto size-24 rounded-xl object-cover shadow-[var(--shadow-glow)]"
        width={96}
        height={96}
        aria-hidden
      />
      <div>
        <h3 className="font-display text-2xl sm:text-3xl">Lie. Investigate. Betray.</h3>
        <p className="mt-2 text-lg text-primary">Even death isn&apos;t the end.</p>
      </div>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">
        A social deduction game for a group around a table. One person hosts with this console.
        Everyone else gets a secret role and night number from the host — privately.
      </p>
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        {[
          "🌙 Silent night actions",
          "☀️ Daytime arguing",
          "🗳️ Vote someone out",
          "👻 The dead still play",
        ].map((t) => (
          <span key={t} className="rounded-md border border-border bg-secondary/50 px-2.5 py-1.5">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Teams() {
  const [picked, setPicked] = useState<"mafia" | "citizens" | null>(null);

  return (
    <div className="space-y-5">
      <header>
        <h3 className="font-display text-2xl">You secretly belong to a team</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The host gives you your <strong className="text-foreground">role</strong> and{" "}
          <strong className="text-foreground">night number</strong> in secret. Never show your card.
        </p>
      </header>

      <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
        Only the host (and you) should know your role and number. Do not announce them.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setPicked("mafia")}
          className={`rounded-xl border p-4 text-left transition-all ${
            picked === "mafia"
              ? "border-mafia bg-mafia/15 shadow-[var(--shadow-glow)]"
              : "border-border bg-secondary/30 hover:border-mafia/50"
          }`}
        >
          <div className="text-2xl">🔪</div>
          <h4 className="mt-2 font-display text-xl text-mafia">Mafia</h4>
          <p className="mt-1 text-sm text-muted-foreground">Eliminate everyone else.</p>
        </button>
        <button
          type="button"
          onClick={() => setPicked("citizens")}
          className={`rounded-xl border p-4 text-left transition-all ${
            picked === "citizens"
              ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
              : "border-border bg-secondary/30 hover:border-primary/50"
          }`}
        >
          <div className="text-2xl">👥</div>
          <h4 className="mt-2 font-display text-xl">Citizens</h4>
          <p className="mt-1 text-sm text-muted-foreground">Find and eliminate all Mafia.</p>
        </button>
      </div>

      {picked && (
        <p className="how-to-enter rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
          {picked === "mafia" ? (
            <>You&apos;re hunting the room. Blend in during the day. Strike at night.</>
          ) : (
            <>
              You&apos;re hunting the killers. Use discussion, votes — and any special roles — to
              clear the table of Mafia.
            </>
          )}
        </p>
      )}
    </div>
  );
}

function Loop() {
  const beats = [
    { icon: "🌙", title: "Night", text: "Silent pointing. Host confirms with thumbs up / down." },
    { icon: "☀️", title: "Day", text: "Announce deaths. Accuse. Defend. Lie." },
    { icon: "🗳️", title: "Vote", text: "Most votes → that person dies." },
    { icon: "👻", title: "Afterlife", text: "The dead become Ghosts — still in the game." },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h3 className="font-display text-2xl">The whole game is one loop</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Repeat until Mafia control the table — or Citizens wipe them out.
        </p>
      </header>

      <ol className="grid gap-2 sm:grid-cols-2">
        {beats.map((b, idx) => (
          <li
            key={b.title}
            className="relative rounded-xl border border-border bg-secondary/30 p-4"
          >
            <span className="absolute right-3 top-3 font-display text-xs text-primary/70">
              {idx + 1}
            </span>
            <div className="text-2xl">{b.icon}</div>
            <h4 className="mt-2 font-display text-lg">{b.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
          </li>
        ))}
      </ol>

      <p className="text-center text-sm text-muted-foreground">
        Night → Day → Vote → (maybe Ghost) → Night again…
      </p>
    </div>
  );
}

function Night() {
  const [open, setOpen] = useState<"mafia" | "numbers" | "silent" | Role>("mafia");

  return (
    <div className="space-y-5">
      <header>
        <h3 className="font-display text-2xl">🌙 Night — secrets move</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone closes their eyes. Your role and number were already given secretly by the host.
        </p>
      </header>

      <button
        type="button"
        onClick={() => setOpen("silent")}
        className={`w-full rounded-xl border p-4 text-left transition-colors ${
          open === "silent"
            ? "border-primary bg-primary/10"
            : "border-border bg-secondary/30 hover:border-primary/40"
        }`}
      >
        <h4 className="font-display text-base">🤫 All night talk is silent</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          No whispering between players. Point at who you mean. The host answers with a{" "}
          <strong className="text-foreground">thumbs up</strong> or{" "}
          <strong className="text-foreground">thumbs down</strong> (and may whisper results only to
          the Detective).
        </p>
      </button>

      <button
        type="button"
        onClick={() => setOpen("mafia")}
        className={`w-full rounded-xl border p-4 text-left transition-colors ${
          open === "mafia"
            ? "border-mafia bg-mafia/10"
            : "border-border bg-secondary/30 hover:border-mafia/40"
        }`}
      >
        <h4 className="font-display text-base text-mafia">1. Host calls Mafia first</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          All Mafia open their eyes together, learn who is who, and silently agree on{" "}
          <strong className="text-foreground">one kill</strong> before the timer ends. Then they
          close their eyes again.
        </p>
      </button>

      <button
        type="button"
        onClick={() => setOpen("numbers")}
        className={`w-full rounded-xl border p-4 text-left transition-colors ${
          open === "numbers"
            ? "border-primary bg-primary/10"
            : "border-border bg-secondary/30 hover:border-primary/40"
        }`}
      >
        <h4 className="font-display text-base">2. Then secret numbers</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          The host calls every number, one at a time, in <em>random</em> order. Only open your eyes
          when <strong className="text-foreground">your</strong> number is called. This hides how
          many Detectives, Doctors, etc. are playing.
        </p>
        {open === "numbers" && (
          <p className="mt-2 text-xs text-primary">
            Mafia also open their eyes on their number — but they already chose the kill, so they
            take no action.
          </p>
        )}
      </button>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          On your number call
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(ROLE) as Role[]).map((r) => {
            const meta = ROLE[r];
            const active = open === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setOpen(r)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  active
                    ? meta.tone + " shadow-[var(--shadow-glow)]"
                    : "border-border bg-secondary/30"
                }`}
              >
                <div className="font-display text-sm">
                  {meta.icon} {meta.label}
                </div>
                {active && <p className="mt-1.5 text-xs opacity-90">{meta.tip}</p>}
                {!active && (
                  <p className="mt-1 text-xs text-muted-foreground">Tap to see what they do</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Day() {
  return (
    <div className="space-y-5">
      <header>
        <h3 className="font-display text-2xl">☀️ Day — talk, then vote</h3>
        <p className="mt-1 text-sm text-muted-foreground">Everyone wakes up.</p>
      </header>

      <ol className="space-y-3">
        {[
          {
            n: "1",
            t: "Who died?",
            d: "The host announces who died. The dead person’s role is NOT revealed.",
          },
          {
            n: "2",
            t: "🗣️ Discuss",
            d: "Accuse. Defend. Lie. Reveal your role. Fake a role. Manipulate everyone. No private conversations.",
          },
          {
            n: "3",
            t: "🗳️ Vote",
            d: "Everyone votes simultaneously. Most votes → eliminated → becomes a Ghost. Tie → nobody dies.",
          },
        ].map((x) => (
          <li key={x.n} className="flex gap-3 rounded-xl border border-border bg-secondary/30 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 font-display text-primary">
              {x.n}
            </span>
            <div>
              <h4 className="font-display text-base">{x.t}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Ghosts() {
  return (
    <div className="space-y-5">
      <header>
        <h3 className="font-display text-2xl">👻 Death isn&apos;t leaving</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re dead, but you&apos;re still playing. Your original team still matters.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-mafia/40 bg-mafia/10 p-4">
          <h4 className="font-display text-mafia">🔪 Mafia Ghost</h4>
          <p className="mt-1 text-sm text-muted-foreground">Help the living Mafia win.</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <h4 className="font-display">👥 Everyone else</h4>
          <p className="mt-1 text-sm text-muted-foreground">Help the Citizens win.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-doctor/35 bg-doctor/5 p-4">
          <h4 className="text-sm font-medium text-doctor">You CAN</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>Watch Day discussions</li>
            <li>On your night number: silently bet or send messages</li>
            <li>Earn Spirit Energy</li>
            <li>Send cryptic messages (via the host)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-destructive/35 bg-destructive/5 p-4">
          <h4 className="text-sm font-medium text-destructive">You CANNOT</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>Vote</li>
            <li>Speak about the game</li>
            <li>Reveal your role</li>
            <li>Directly identify Mafia</li>
            <li>Talk privately / watch living Night actions</li>
          </ul>
        </div>
      </div>

      <p className="rounded-xl border border-ghost/35 bg-ghost/5 px-3 py-2 text-sm text-muted-foreground">
        Ghosts keep their eyes closed at night <em>except</em> when their number is called — that is
        when they signal the host. Next: the full gesture list.
      </p>
    </div>
  );
}

function Spirit() {
  const [tier, setTier] = useState(0);
  const powers = [
    {
      name: "🕯️ Murmur",
      cost: 4,
      eg: "Among Rahul, Priya & Akash, suspicion should fall.",
    },
    {
      name: "🔮 Omen",
      cost: 8,
      eg: "Among Rahul, Priya & Akash, exactly ONE is Mafia.",
    },
    {
      name: "👁️ Revelation",
      cost: 14,
      eg: "Of Rahul, Priya & Akash, exactly TWO are innocent.",
    },
  ];
  const p = powers[tier]!;

  return (
    <div className="space-y-5">
      <header>
        <h3 className="font-display text-2xl">⚡ Ghosts earn Spirit Energy</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Predict to the host <em>before</em> the outcome happens. Correct = energy.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        {[
          { label: "Next Mafia victim", pts: "+2" },
          { label: "Next vote-out", pts: "+2" },
          { label: "Hidden role*", pts: "+4" },
        ].map((x) => (
          <div key={x.label} className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="font-display text-lg text-primary">{x.pts}</div>
            <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{x.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        * Hidden role: only one attempt per Ghost, per game.
      </p>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          At night, after the note-writing-on-palm gesture, signal 1 / 2 / 3 fingers. Spend Spirit
          on a tier (only if more than 3 living players):
        </p>
        <div className="mb-3 flex gap-2">
          {powers.map((power, idx) => (
            <button
              key={power.name}
              type="button"
              onClick={() => setTier(idx)}
              className={`flex-1 rounded-md border px-2 py-2 text-xs transition-colors ${
                tier === idx
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {power.cost}⚡
            </button>
          ))}
        </div>
        <div className="how-to-enter rounded-xl border border-ghost/40 bg-ghost/10 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-display">{p.name}</h4>
            <span className="text-xs text-primary">{p.cost} Spirit</span>
          </div>
          <p className="mt-2 text-sm italic text-ghost">“{p.eg}”</p>
        </div>
      </div>

      <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        Messages must involve multiple living players. They cannot directly say who is Mafia, reveal
        the Ghost&apos;s identity, and are not necessarily truthful. The living decide whether to
        trust them.
      </p>
    </div>
  );
}

function Win() {
  return (
    <div className="space-y-5">
      <header>
        <h3 className="font-display text-2xl">🏆 How you win</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep the loop going until one side hits it.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-mafia/45 bg-mafia/10 p-5">
          <div className="text-2xl">🔪</div>
          <h4 className="mt-2 font-display text-xl text-mafia">Mafia</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Win when <strong className="text-foreground">Mafia ≥ everyone else</strong> still alive.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <div className="text-2xl">👥</div>
          <h4 className="mt-2 font-display text-xl">Citizens</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Win when <strong className="text-foreground">all Mafia are eliminated</strong>.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs uppercase tracking-wider text-primary">Remember</p>
        <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
          <li>Night = silent actions</li>
          <li>Day = discussion</li>
          <li>Vote = someone dies</li>
          <li>Death = become a Ghost</li>
          <li className="sm:col-span-2">Spirit = cryptic communication</li>
        </ul>
        <p className="mt-3 text-center font-display text-sm text-primary">
          The dead aren&apos;t out. They&apos;re just playing from the other side. 👻
        </p>
      </div>
    </div>
  );
}

/* ---------- live demo ---------- */

type DemoBeat = {
  title: string;
  narrate: string;
  /** Highlight only these player names (usually the person whose number was called). */
  glow?: string[];
  dead?: string[];
  showRoles?: boolean;
  bubble?: string;
  callNumber?: number;
};

const DEMO: DemoBeat[] = [
  {
    title: "Six people. Roles hidden.",
    narrate:
      "The host gave each person a role and night number in secret. Tap a name anytime to peek (host privilege).",
  },
  {
    title: "Night — eyes closed",
    narrate:
      "Everyone closes their eyes. All night communication is silent: players point, the host thumbs up or down.",
  },
  {
    title: "Host calls Mafia",
    narrate:
      "Rahul & Dev open their eyes together, see each other, and under the timer silently point at Meera to kill. Host thumbs up.",
    glow: ["Rahul", "Dev"],
  },
  {
    title: "Calling #1 — Priya",
    narrate:
      "Detective wakes alone. She silently points at Rahul. Host thumbs up, then whispers: MAFIA.",
    callNumber: 1,
    glow: ["Priya"],
  },
  {
    title: "Calling #5 — Akash",
    narrate: "Doctor wakes alone. He silently points at Sara to protect. Host thumbs up.",
    callNumber: 5,
    glow: ["Akash"],
  },
  {
    title: "Calling #3 — Rahul",
    narrate: "Mafia number. Rahul opens his eyes — no action. Kill was already chosen.",
    callNumber: 3,
    glow: ["Rahul"],
  },
  {
    title: "Dawn",
    narrate: "Host: “Meera died.” Role stays secret. Meera is now a Ghost.",
    dead: ["Meera"],
  },
  {
    title: "Day → Vote",
    narrate: "Argue. Then vote together. Village eliminates Dev. He becomes a Ghost too.",
    dead: ["Meera", "Dev"],
    glow: ["Dev"],
  },
  {
    title: "Calling #2 — Ghost Meera",
    narrate:
      "Meera taps her palm (bet), then kill-slashes and points at Sara. Later she note-writes on her palm, holds up 1 finger; host 👍; she points at three names.",
    callNumber: 2,
    glow: ["Meera"],
    dead: ["Meera", "Dev"],
  },
  {
    title: "Host reads her Murmur",
    narrate: "Cryptic — not a direct outing. The living decide whether to trust it.",
    dead: ["Meera", "Dev"],
    bubble: "Among Rahul, Priya & Akash, suspicion should fall.",
  },
  {
    title: "And the loop continues…",
    narrate: "Night again. Day again. Until Mafia outnumber the town — or every Mafia is gone.",
    dead: ["Meera", "Dev"],
    showRoles: true,
  },
];

function Demo() {
  const [beat, setBeat] = useState(0);
  const [peek, setPeek] = useState<Record<string, boolean>>({});
  const b = DEMO[beat]!;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-2xl">See one round</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A tiny table run — tap Continue to advance.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setBeat(0);
            setPeek({});
          }}
        >
          <RotateCcw className="size-4" /> Restart
        </Button>
      </header>

      <div className="flex gap-1">
        {DEMO.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Demo step ${idx + 1}`}
            onClick={() => setBeat(idx)}
            className={`h-1.5 flex-1 rounded-full ${
              idx === beat ? "bg-primary" : idx < beat ? "bg-primary/40" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="how-to-enter rounded-xl border border-border bg-secondary/25 p-4">
        <p className="text-xs text-muted-foreground">
          Beat {beat + 1}/{DEMO.length}
        </p>
        <h4 className="mt-1 font-display text-lg text-primary">{b.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{b.narrate}</p>
        {b.bubble && (
          <p className="mt-3 rounded-md border border-ghost/40 bg-ghost/10 px-3 py-2 text-sm italic text-ghost">
            👻 “{b.bubble}”
          </p>
        )}
        {b.callNumber != null && (
          <p className="mt-2 text-xs text-primary">Host calls number {b.callNumber}…</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CAST.map((p) => {
          const dead = b.dead?.includes(p.name) ?? false;
          const lit = b.glow?.includes(p.name) ?? false;
          const show = b.showRoles || peek[p.name];
          const meta = ROLE[p.role];
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setPeek((prev) => ({ ...prev, [p.name]: !prev[p.name] }))}
              className={`rounded-lg border p-2.5 text-left transition-all ${
                dead
                  ? "border-ghost/40 bg-ghost/10"
                  : lit
                    ? "border-primary bg-primary/12 shadow-[var(--shadow-glow)]"
                    : "border-border bg-secondary/40 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate font-display text-sm">{p.name}</span>
                <span className="font-display text-[10px] text-primary">#{p.number}</span>
              </div>
              <div className="mt-1.5 text-[11px]">
                {dead ? (
                  <span className="text-ghost">👻 Ghost</span>
                ) : show ? (
                  <span>
                    {meta.icon} {meta.label}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Hidden</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          size="sm"
          disabled={beat === 0}
          onClick={() => setBeat((x) => x - 1)}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Button size="sm" disabled={beat >= DEMO.length - 1} onClick={() => setBeat((x) => x + 1)}>
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
