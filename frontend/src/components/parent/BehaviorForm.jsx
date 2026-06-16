import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Card from "../ui/Card";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { behaviorApi } from "../../services/api";

const MOODS = [
  { v: 1, e: "😣" },
  { v: 2, e: "🙁" },
  { v: 3, e: "😐" },
  { v: 4, e: "🙂" },
  { v: 5, e: "😄" },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function BehaviorForm({ childId }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    date: today(),
    mood: 3,
    notes: "",
    triggers: "",
    positive_moments: "",
  });

  const mutation = useMutation({
    mutationFn: () => behaviorApi.create({ ...form, child: childId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["behavior", childId] });
      toast.success(t("toast.saved"));
      setForm({ ...form, notes: "", triggers: "", positive_moments: "", mood: 3 });
    },
    onError: () => toast.error(t("toast.error")),
  });

  return (
    <Card glow>
      <h2 className="mb-4 text-lg font-bold">{t("behavior.new_entry")}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <Input
          label={t("common.today")}
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <div>
          <span className="mb-2 block text-sm font-medium text-text-secondary">
            {t("behavior.mood")}
          </span>
          <div className="flex justify-between gap-2">
            {MOODS.map(({ v, e }) => (
              <motion.button
                key={v}
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setForm({ ...form, mood: v })}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border p-2 transition-all ${
                  form.mood === v
                    ? "scale-105 border-white bg-white text-black shadow-neon-primary"
                    : "border-white/10 bg-black/30 hover:bg-white/10"
                }`}
              >
                <span className="text-3xl">{e}</span>
                <span
                  className={`text-[10px] ${
                    form.mood === v ? "text-black/70" : "text-text-secondary"
                  }`}
                >
                  {t(`behavior.mood_labels.${v}`)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <Textarea
          label={t("behavior.positive")}
          value={form.positive_moments}
          onChange={(e) => setForm({ ...form, positive_moments: e.target.value })}
        />
        <Textarea
          label={t("behavior.triggers")}
          value={form.triggers}
          onChange={(e) => setForm({ ...form, triggers: e.target.value })}
        />
        <Textarea
          label={t("behavior.notes")}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <Button type="submit" loading={mutation.isPending} className="w-full">
          {t("common.save")}
        </Button>
      </form>
    </Card>
  );
}
