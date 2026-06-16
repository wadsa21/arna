import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import EmojiPicker from "../ui/EmojiPicker";

export default function ScheduleItemForm({ open, onClose, onSubmit, loading }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title_ru: "",
    title_kk: "",
    emoji: "📌",
    start_time: "09:00",
    duration_minutes: 30,
  });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form, () =>
      setForm({
        title_ru: "",
        title_kk: "",
        emoji: "📌",
        start_time: "09:00",
        duration_minutes: 30,
      })
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={t("schedule.add_activity")}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-3xl shadow-neon-primary">
            {form.emoji}
          </div>
          <div className="flex-1">
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t("schedule.emoji")}
            </span>
            <EmojiPicker
              value={form.emoji}
              onChange={(emoji) => setForm({ ...form, emoji })}
            />
          </div>
        </div>
        <Input
          label={t("schedule.activity_title_ru")}
          required
          value={form.title_ru}
          onChange={(e) => setForm({ ...form, title_ru: e.target.value })}
        />
        <Input
          label={t("schedule.activity_title_kk")}
          required
          value={form.title_kk}
          onChange={(e) => setForm({ ...form, title_kk: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("schedule.start_time")}
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
          <Input
            label={t("schedule.duration")}
            type="number"
            min="5"
            step="5"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={loading}>
            {t("common.add")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
