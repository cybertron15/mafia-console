/**
 * Silent ghost ↔ host vocabulary used at night when a Ghost's number is called.
 */

export function GhostSignalsGuide({
  compact = false,
  aliveCount,
}: {
  compact?: boolean;
  /** Living players — cryptic messages need more than 3. */
  aliveCount?: number;
}) {
  const messagesLocked = aliveCount != null && aliveCount <= 3;

  if (compact) {
    return (
      <div className="mt-3 space-y-2 rounded-lg border border-ghost/40 bg-ghost/10 p-3 text-xs">
        <p className="font-display text-sm text-ghost">👻 Ghost turn — silent signals</p>
        <p className="text-muted-foreground">
          Finger tap on palm = <b className="text-foreground">bet</b>. Note-writing on palm ={" "}
          <b className="text-foreground">cryptic message</b>.
        </p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <b className="text-foreground">Kill bet:</b> kill slash + point → you 👍/👎
          </li>
          <li>
            <b className="text-foreground">Vote bet:</b> hand flick + point → you 👍/👎
          </li>
          <li>
            <b className="text-foreground">Role bet:</b> point own face + point person → you answer
            with a role sign (below)
          </li>
          <li>
            <b className="text-foreground">Message:</b> note-writing on palm → 1 / 2 / 3 fingers →
            crossed arms = not enough spirit, 👍 = ok → they point 3 names
            {messagesLocked && <span className="text-destructive"> · locked (≤3 alive)</span>}
          </li>
        </ul>
        <p className="pt-1 text-muted-foreground">
          <b className="text-foreground">Your role answers:</b> kill slash = Mafia · hand plus =
          Doctor · eye-peek (circle at eye) = Detective · open empty palm = Citizen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h3 className="font-display text-2xl">👻 Talking to the host</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          When your night number is called, open your eyes and signal the host — still silent. Then
          close your eyes again.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm">
        <p className="font-medium">Start with one of these</p>
        <ul className="mt-2 space-y-2 text-muted-foreground">
          <li>
            <b className="text-foreground">Tap a finger on your palm</b> — you want to place a bet /
            prediction.
          </li>
          <li>
            <b className="text-foreground">Note-writing gesture on your palm</b> (mime writing on
            your open hand) — you want to spend Spirit on a cryptic message.
          </li>
        </ul>
      </div>

      <section className="space-y-2">
        <h4 className="font-display text-lg text-primary">Bets (after palm tap)</h4>
        <div className="grid gap-2">
          {[
            {
              t: "🔪 Next Mafia kill",
              d: "Do a killing slash gesture, then point at the living person. Host thumbs up or down. Correct later = +2 Spirit.",
            },
            {
              t: "🗳️ Next vote-out",
              d: "Hand-flick motion (like brushing someone away), then point. Host thumbs up or down. Correct later = +2 Spirit.",
            },
            {
              t: "🎭 Hidden role (once per game)",
              d: "Point to your own face, then point at the person whose role you want. Host answers with a role sign — not words.",
            },
          ].map((x) => (
            <article key={x.t} className="rounded-xl border border-border bg-secondary/30 p-3">
              <h5 className="font-display text-sm">{x.t}</h5>
              <p className="mt-1 text-xs text-muted-foreground">{x.d}</p>
            </article>
          ))}
        </div>

        <div className="rounded-xl border border-ghost/35 bg-ghost/5 p-3">
          <p className="text-xs font-medium text-ghost">Host role answers</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li>
              <b className="text-foreground">Killing slash</b> → Mafia
            </li>
            <li>
              <b className="text-foreground">Plus with hands (+)</b> → Doctor
            </li>
            <li>
              <b className="text-foreground">Eye-peek</b> (finger circle at your eye, like a
              spyglass) → Detective
            </li>
            <li>
              <b className="text-foreground">Open empty palm</b> (flat hand, nothing special) →
              Citizen
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="font-display text-lg text-primary">Cryptic messages</h4>
        {messagesLocked && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Not available while 3 or fewer living players remain — need three names to point at.
          </p>
        )}
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="rounded-xl border border-border bg-secondary/30 p-3">
            <b className="text-foreground">1.</b> Do the{" "}
            <b className="text-foreground">note-writing gesture on your palm</b>.
          </li>
          <li className="rounded-xl border border-border bg-secondary/30 p-3">
            <b className="text-foreground">2.</b> Hold up <b className="text-foreground">1</b>,{" "}
            <b className="text-foreground">2</b>, or <b className="text-foreground">3</b> fingers
            (tier / Spirit cost).
          </li>
          <li className="rounded-xl border border-border bg-secondary/30 p-3">
            <b className="text-foreground">3.</b> Host replies:{" "}
            <b className="text-foreground">crossed arms</b> = not enough Spirit ·{" "}
            <b className="text-foreground">thumbs up</b> = request accepted.
          </li>
          <li className="rounded-xl border border-border bg-secondary/30 p-3">
            <b className="text-foreground">4.</b> If accepted, point at{" "}
            <b className="text-foreground">three living names</b>. The host later reads the cryptic
            line to the table.
          </li>
        </ol>
      </section>
    </div>
  );
}
