import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

import { scheduleApi } from "../../services/api";
import { useSound } from "../../hooks/useSound";

const fireConfetti = () => {
  const colors = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors });
  setTimeout(
    () => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors }),
    150
  );
  setTimeout(
    () => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors }),
    300
  );
};

export default function ChildSchedule({ schedule, childId, date }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const qc = useQueryClient();
  const { playSuccess } = useSound();
  const [celebrating, setCelebrating] = useState(false);

  const items = schedule?.items ?? [];
  // Текущая активность — первая невыполненная
  const current = items.find((i) => i.status !== "DONE" && i.status !== "SKIPPED");
  const allDone = items.length > 0 && !current;

  const completeMutation = useMutation({
    mutationFn: (item) => scheduleApi.completeItem(item.id),
    onMutate: () => {
      playSuccess();
      fireConfetti();
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1600);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["child-schedule", childId, date] }),
  });

  if (allDone) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center gap-6 py-16 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-9xl"
        >
          🌟
        </motion.div>
        <p className="text-4xl font-black gradient-text">{t("child.all_done")}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Текущая активность — крупно */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={
                celebrating
                  ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }
                  : { y: [0, -10, 0] }
              }
              transition={
                celebrating ? { duration: 0.8 } : { repeat: Infinity, duration: 3 }
              }
              className="flex h-52 w-52 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-accent1 text-9xl shadow-2xl"
              style={{ boxShadow: "0 20px 60px -10px rgba(139,92,246,0.7)" }}
            >
              {current.emoji}
            </motion.div>
            <p className="text-center text-4xl font-black text-text-primary">
              {lang === "kk" ? current.title_kk : current.title_ru}
            </p>

            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => completeMutation.mutate(current)}
              disabled={completeMutation.isPending}
              className="flex items-center gap-3 rounded-[2rem] bg-gradient-to-r from-accent2 to-accent1 px-12 py-7 text-3xl font-black text-white"
              style={{ boxShadow: "0 16px 50px -8px rgba(16,185,129,0.7)" }}
            >
              ✋ {t("common.done")}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Полоса прогресса из эмодзи */}
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((it) => (
          <div
            key={it.id}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-all ${
              it.status === "DONE"
                ? "bg-accent2/20 ring-2 ring-accent2"
                : it.id === current?.id
                  ? "bg-primary/20 ring-2 ring-primary scale-110"
                  : "bg-surface2/60 opacity-60"
            }`}
          >
            {it.status === "DONE" ? "✅" : it.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
