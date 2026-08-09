import { ROLE_META, type Player } from "@/lib/game";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleColor: Record<string, string> = {
  mafia: "text-mafia border-mafia/40 bg-mafia/10",
  detective: "text-detective border-detective/40 bg-detective/10",
  doctor: "text-doctor border-doctor/40 bg-doctor/10",
  citizen: "text-citizen border-citizen/40 bg-citizen/10",
};

export function RosterPanel({
  players,
  reveal,
  setReveal,
}: {
  players: Player[];
  reveal: boolean;
  setReveal: (v: boolean) => void;
}) {
  const sorted = [...players].sort((a, b) => a.number - b.number);
  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg">Roster</h3>
        <Button size="sm" variant="ghost" onClick={() => setReveal(!reveal)}>
          {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {reveal ? "Hide roles" : "Show roles"}
        </Button>
      </div>
      <ul className="mt-3 space-y-1.5">
        {sorted.map((p) => (
          <li
            key={p.id}
            className={`flex items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-sm ${
              p.alive ? "bg-secondary/40" : "bg-background/40 opacity-60"
            }`}
          >
            <span className="w-7 shrink-0 text-center font-display text-base text-primary">
              {p.number}
            </span>
            <span className={`flex-1 truncate ${p.alive ? "" : "line-through"}`}>
              {p.name}
            </span>
            {!p.alive && (
              <span className="text-xs text-ghost">👻 {p.spirit} spirit</span>
            )}
            {reveal ? (
              <span
                className={`rounded border px-1.5 py-0.5 text-[11px] ${roleColor[p.role]}`}
              >
                {ROLE_META[p.role].icon} {ROLE_META[p.role].label}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">•••</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
