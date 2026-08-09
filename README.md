# Mafia: The Afterlife — Host Console

A browser-based **host console** for running [Mafia: The Afterlife](#game-in-brief) at the table.

This app is **not** a player client. Players keep their eyes closed, talk, and vote in person. The host (or facilitator) uses this screen to:

- Deal secret roles and night numbers
- Call night numbers in random order
- Record Mafia kills, Detective checks, and Doctor protections
- Run day discussion / vote timers
- Track Ghosts, Spirit Energy, and cryptic messages
- See win conditions and a full game log

State is saved in `localStorage`, so a refresh mid-game usually resumes where you left off.

---

## Game in brief

Two secret teams:

| Team                                    | Goal                                                 |
| --------------------------------------- | ---------------------------------------------------- |
| **Mafia**                               | Eliminate everyone else until Mafia ≥ remaining town |
| **Citizens** (incl. Detective & Doctor) | Find and eliminate all Mafia                         |

Each night, players wake only when their secret number is called. Each day, the living discuss and vote. The dead become **Ghosts** — they still play via Spirit Energy and cryptic messages. Roles stay hidden when someone dies.

Open **How to Play** in the app (before starting a game) for an interactive walkthrough and a sample round simulation.

---

## Quick start

You need [Node.js](https://nodejs.org/) (LTS recommended) and npm.

```sh
git clone <your-fork-or-repo-url>
cd mafia
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Scripts

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Local development server with HMR  |
| `npm run build`   | Production build → `dist/`         |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | ESLint                             |
| `npm run format`  | Prettier write                     |

---

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Radix UI** (alert dialogs)
- **lucide-react** icons

Path alias: `@/` → `src/` (see `vite.config.ts` / `tsconfig.json`).

---

## Project layout

```
src/
  App.tsx                 # Game state, night/day resolve, win checks, persistence
  main.tsx
  styles.css              # Theme tokens, panel / ember utilities
  lib/
    game.ts               # Types, role deal, shuffle, winner logic, storage key
    sound.ts              # Tick / buzz helpers
    utils.ts              # cn() helper
  hooks/
    useCountdown.ts       # Shared timers
  components/
    game/
      SetupScreen.tsx     # Player list, settings, role/number deal
      HowToPlay.tsx       # Interactive rules + round simulation
      NightPanel.tsx      # Number calling + night targets
      DayPanel.tsx        # Discussion / vote
      GhostPanel.tsx      # Spirit energy + message powers
      RosterPanel.tsx     # Living / dead roster (host-only reveal)
    ui/                   # Shared Button, Input, AlertDialog
public/
  robots.txt
```

---

## How the host console works

### 1. Setup

1. Add player names (comma-separated works).
2. Tune timers (call / discussion / vote) and sound. Set a timer to `0` to disable it.
3. **Deal roles & numbers** — roles are suggested from player count (`suggestedRoles` in `game.ts`); night numbers are shuffled 1…N.
4. Adjust any role or number privately, then **Start Night 1**.

Only the host should see the deal screen. Never show role cards to the table.

### 2. Night

Night actions are **silent**: players point; the host confirms with thumbs up / down.

1. **Call Mafia first** — they wake together, learn who is who, and agree on one kill under the Mafia wake timer.
2. **Call numbers** in random order — Detective / Doctor act by pointing; Citizens stay silent; Mafia open their eyes on their number but take **no** action (kill already chosen).
3. Resolve night → victim dies unless Doctor saved them. Roles of the dead are **not** announced to the room (the log may still record them for the host).

### 3. Day

- Announce who died (not their role).
- Discussion timer, then simultaneous vote.
- Majority → eliminated → becomes a Ghost. Tie → nobody dies.

### 4. Afterlife (Ghosts)

Ghosts keep their original team allegiance (Mafia Ghosts help Mafia; others help Citizens). At night, when their number is called, they open their eyes and signal the host silently:

- **Palm tap** → place a bet (kill slash / vote flick / point-to-face for role)
- **Message sign** → spend Spirit (show 1–2–3 fingers; host crossed arms = not enough Spirit; 👍 = ok; then point three names). Disabled when ≤3 living players remain.

Host role answers for identity bets: kill slash = Mafia, hand plus = Doctor, no gesture = Citizen. They do not vote or speak about the game aloud.

### 5. Win

- **Citizens** win when no Mafia remain alive.
- **Mafia** win when alive Mafia ≥ alive citizens + doctors + detectives.

---

## Making changes

| You want to…                   | Start here                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| Change role mix / deal logic   | `src/lib/game.ts` → `suggestedRoles`                        |
| Change win conditions          | `src/lib/game.ts` → `checkWinner`                           |
| Change night flow / calling    | `src/components/game/NightPanel.tsx` + resolve in `App.tsx` |
| Change day / vote UX           | `src/components/game/DayPanel.tsx`                          |
| Change ghost powers / costs    | `src/components/game/GhostPanel.tsx` → `POWERS`             |
| Change rules copy / simulation | `src/components/game/HowToPlay.tsx`                         |
| Change colors / fonts          | `src/styles.css`, fonts in `index.html`                     |
| Change persistence key         | `STORAGE_KEY` in `src/lib/game.ts`                          |

Game state is a single `Game` object owned by `App.tsx`. Panels call `update((g) => …)` or dedicated handlers (`resolveNight`, `eliminate`, `addSpirit`, …). Prefer keeping rules logic in `lib/game.ts` and UI in components.

---

## Contributing

Contributions that improve hosting clarity, accessibility, or rules fidelity are welcome.

1. Fork and branch from `main` (`feature/…` or `fix/…`).
2. Keep the host-console model: do not turn this into a multiplayer network game unless that is an agreed separate effort.
3. Match existing TypeScript style, Tailwind patterns, and `panel` / `ember-text` utilities.
4. Run `npm run lint` and `npm run build` before opening a PR.
5. In the PR, describe **why** the change helps hosts or players, and how you tested it (player counts, edge cases like ties / doctor saves / all-mafia-dead).

### Good first contributions

- Clarify copy in How to Play
- Timer / sound polish
- Mobile layout tweaks for tablet hosting
- Extra spirit message templates (keep them cryptic — no direct “X is Mafia”)
- Tests around `suggestedRoles` / `checkWinner`

### Code of the table

This tool is meant for friendly social deduction. Don’t use PRs to hardcode “gotcha” rules that break the published Afterlife draft without discussion.

---

## License / credit

Built as a host tool for the **Mafia: The Afterlife** party-game draft. Adapt freely for your table; if you publish a fork, credit the original concept and keep the spirit of the Afterlife rules intact.
