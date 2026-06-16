import { useCallback, useRef } from "react";

/**
 * Простые звуки через Web Audio API — без аудиофайлов.
 * Используется в детском интерфейсе для тактильно-звукового фидбэка.
 */
export function useSound() {
  const ctxRef = useRef(null);

  const ctx = () => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    return ctxRef.current;
  };

  const tone = useCallback((freq, duration = 0.18, type = "sine", delay = 0) => {
    const audio = ctx();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const start = audio.currentTime + delay;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration);
  }, []);

  // Мягкий "поп" при нажатии на карточку
  const playTap = useCallback(() => {
    tone(523.25, 0.15, "sine"); // C5
  }, [tone]);

  // Радостная восходящая трель при завершении активности
  const playSuccess = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.2, "triangle", i * 0.1));
  }, [tone]);

  return { playTap, playSuccess };
}
