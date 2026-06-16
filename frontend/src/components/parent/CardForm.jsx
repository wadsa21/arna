import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Upload, ImageOff } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Select } from "../ui/Input";
import EmojiPicker from "../ui/EmojiPicker";
import { cardsApi } from "../../services/api";

const CATEGORIES = ["NEEDS", "EMOTIONS", "ACTIONS", "FOOD", "PLACES"];

export default function CardForm({ open, onClose, childId }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fileRef = useRef();
  const [form, setForm] = useState({
    title_ru: "",
    title_kk: "",
    emoji: "🗣️",
    category: "NEEDS",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const reset = () => {
    setForm({ title_ru: "", title_kk: "", emoji: "🗣️", category: "NEEDS" });
    setImage(null);
    setPreview(null);
  };

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("child", childId);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      return cardsApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      toast.success(t("toast.created"));
      reset();
      onClose();
    },
    onError: () => toast.error(t("toast.error")),
  });

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <Modal open={open} onClose={onClose} title={t("cards.new_card")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-brand text-4xl shadow-neon-primary">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              form.emoji
            )}
          </div>
          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface2/60 py-2.5 text-sm font-medium hover:bg-white/5"
            >
              <Upload className="h-4 w-4" /> {t("cards.upload_image")}
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
                className="flex items-center gap-1 text-xs text-accent4"
              >
                <ImageOff className="h-3 w-3" /> {t("common.delete")}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
          </div>
        </div>

        {!preview && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t("cards.or_emoji")}
            </span>
            <EmojiPicker
              value={form.emoji}
              onChange={(emoji) => setForm({ ...form, emoji })}
            />
          </div>
        )}

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
        <Select
          label={t("cards.title")}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`cards.categories.${c}`)}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {t("common.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
