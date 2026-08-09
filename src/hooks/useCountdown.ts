import { useCallback, useEffect, useRef, useState } from "react";
import { playBuzz, playTick, primeAudio } from "@/lib/sound";

export function useCountdown(sound: boolean) {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [running, setRunning] = useState(false);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const start = useCallback((seconds: number) => {
    primeAudio();
    setTotal(seconds);
    setRemaining(seconds);
    setRunning(seconds > 0);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setRemaining(0);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        if (next > 0) {
          if (soundRef.current) playTick();
          return next;
        }
        if (soundRef.current) playBuzz();
        setRunning(false);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  return { remaining, total, running, start, stop };
}

export const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
