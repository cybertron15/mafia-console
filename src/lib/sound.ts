let ctx: AudioContext | null = null;
let muted = false;

export function setSoundMuted(next: boolean) {
  muted = next;
}

export function isSoundMuted() {
  return muted;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType, gain: number) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
}

export const playTick = () => beep(1100, 0.05, "square", 0.05);
export const playBuzz = () => {
  beep(160, 0.5, "sawtooth", 0.18);
  setTimeout(() => beep(120, 0.6, "sawtooth", 0.18), 180);
};
export const primeAudio = () => {
  if (muted) return null;
  return audio();
};