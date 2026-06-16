import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, GripVertical, Trash2, Copy, Clock } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { SkeletonList } from "../../components/ui/Skeleton";
import EmptyChild from "../../components/parent/EmptyChild";
import ScheduleItemForm from "../../components/parent/ScheduleItemForm";
import { useChildren, toList } from "../../hooks/useChildren";
import { scheduleApi } from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const STATUS_TONE = {
  PENDING: "muted",
  IN_PROGRESS: "accent3",
  DONE: "accent2",
  SKIPPED: "danger",
};

function ScheduleRow({ item, lang, t, onStatus, onDelete }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3"
    >
      <button
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab touch-none text-text-secondary hover:text-text-primary active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="text-2xl">{item.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {lang === "kk" ? item.title_kk : item.title_ru}
        </p>
        <p className="flex items-center gap-1 text-xs text-text-secondary">
          <Clock className="h-3 w-3" />
          {item.start_time?.slice(0, 5)} · {item.duration_minutes} {lang === "kk" ? "мин" : "мин"}
        </p>
      </div>
      <select
        value={item.status}
        onChange={(e) => onStatus(item, e.target.value)}
        className="rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-xs font-semibold outline-none focus:border-white/60"
      >
        {["PENDING", "IN_PROGRESS", "DONE", "SKIPPED"].map((s) => (
          <option key={s} value={s}>
            {t(`schedule.status.${s}`)}
          </option>
        ))}
      </select>
      <Badge tone={STATUS_TONE[item.status]}>
        {t(`schedule.status.${item.status}`)}
      </Badge>
      <button
        onClick={() => onDelete(item)}
        className="rounded-xl p-2 text-text-secondary hover:bg-white hover:text-black"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </Reorder.Item>
  );
}

export default function SchedulePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const qc = useQueryClient();
  const { selectedChild, children, isLoading: childrenLoading } = useChildren();
  const childId = selectedChild?.id;

  const [date, setDate] = useState(today());
  const [items, setItems] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyDate, setCopyDate] = useState("");

  const scheduleQuery = useQuery({
    queryKey: ["schedule", childId, date],
    enabled: !!childId,
    queryFn: async () =>
      toList((await scheduleApi.list({ child: childId, date })).data)[0] || null,
  });

  useEffect(() => {
    setItems(scheduleQuery.data?.items ?? []);
  }, [scheduleQuery.data]);

  // Гарантируем наличие расписания на дату (get-or-create)
  const ensureSchedule = async () => {
    if (scheduleQuery.data) return scheduleQuery.data;
    const { data } = await scheduleApi.create({ child: childId, date });
    return data;
  };

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const schedule = await ensureSchedule();
      return scheduleApi.addItem(schedule.id, {
        ...payload,
        order: items.length,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule", childId, date] });
      toast.success(t("toast.created"));
      setAddOpen(false);
    },
    onError: () => toast.error(t("toast.error")),
  });

  const statusMutation = useMutation({
    mutationFn: ({ item, status }) =>
      scheduleApi.updateItem(item.id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule", childId, date] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (item) => scheduleApi.removeItem(item.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule", childId, date] });
      toast.success(t("toast.deleted"));
    },
  });

  const copyMutation = useMutation({
    mutationFn: () => scheduleApi.copy(scheduleQuery.data.id, [copyDate]),
    onSuccess: () => {
      toast.success(t("toast.copied"));
      setCopyOpen(false);
      setCopyDate("");
    },
    onError: () => toast.error(t("toast.error")),
  });

  // Сохраняем новый порядок после drag
  const persistOrder = (reordered) => {
    setItems(reordered);
    reordered.forEach((it, idx) => {
      if (it.order !== idx) scheduleApi.updateItem(it.id, { order: idx });
    });
  };

  if (!childrenLoading && children.length === 0) return <EmptyChild />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold gradient-text">
          {t("schedule.title")}
        </h1>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="!py-2"
          />
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">{t("schedule.drag_hint")}</p>
          <div className="flex gap-2">
            {scheduleQuery.data && items.length > 0 && (
              <Button variant="ghost" onClick={() => setCopyOpen(true)}>
                <Copy className="h-4 w-4" /> {t("schedule.copy_to")}
              </Button>
            )}
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-5 w-5" /> {t("schedule.add_activity")}
            </Button>
          </div>
        </div>

        {scheduleQuery.isLoading ? (
          <SkeletonList count={5} />
        ) : items.length ? (
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={persistOrder}
            className="space-y-2"
          >
            {items.map((item) => (
              <ScheduleRow
                key={item.id}
                item={item}
                lang={lang}
                t={t}
                onStatus={(it, status) => statusMutation.mutate({ item: it, status })}
                onDelete={(it) => deleteMutation.mutate(it)}
              />
            ))}
          </Reorder.Group>
        ) : (
          <p className="py-12 text-center text-text-secondary">{t("common.empty")}</p>
        )}
      </Card>

      <ScheduleItemForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        loading={addMutation.isPending}
        onSubmit={(form, reset) => addMutation.mutate(form, { onSuccess: reset })}
      />

      <Modal open={copyOpen} onClose={() => setCopyOpen(false)} title={t("schedule.copy_to")}>
        <div className="space-y-4">
          <Input
            label={t("common.today")}
            type="date"
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setCopyOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              loading={copyMutation.isPending}
              disabled={!copyDate}
              onClick={() => copyMutation.mutate()}
            >
              <Copy className="h-4 w-4" /> {t("common.create")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
