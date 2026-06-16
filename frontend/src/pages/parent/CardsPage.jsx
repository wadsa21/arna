import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2, Power } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import EmptyChild from "../../components/parent/EmptyChild";
import CardForm from "../../components/parent/CardForm";
import { useChildren, toList } from "../../hooks/useChildren";
import { cardsApi } from "../../services/api";

const CATEGORIES = ["NEEDS", "EMOTIONS", "ACTIONS", "FOOD", "PLACES"];
const CAT_TONE = {
  NEEDS: "primary",
  EMOTIONS: "secondary",
  ACTIONS: "accent1",
  FOOD: "accent3",
  PLACES: "accent2",
};

export default function CardsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const qc = useQueryClient();
  const { selectedChild, children, isLoading: childrenLoading } = useChildren();
  const childId = selectedChild?.id;

  const [filter, setFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);

  const cardsQuery = useQuery({
    queryKey: ["cards", childId],
    enabled: !!childId,
    queryFn: async () => toList((await cardsApi.list({ child: childId })).data),
  });

  const toggleMutation = useMutation({
    mutationFn: (card) => cardsApi.update(card.id, { is_active: !card.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards", childId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (card) => cardsApi.remove(card.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", childId] });
      toast.success(t("toast.deleted"));
    },
  });

  if (!childrenLoading && children.length === 0) return <EmptyChild />;

  const cards = cardsQuery.data ?? [];
  const visible =
    filter === "ALL" ? cards : cards.filter((c) => c.category === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold gradient-text">{t("cards.title")}</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-5 w-5" /> {t("cards.new_card")}
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            filter === "ALL"
              ? "bg-gradient-brand text-white shadow-neon-primary"
              : "border border-white/10 bg-surface2/60 text-text-secondary hover:text-text-primary"
          }`}
        >
          {t("common.all")}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              filter === c
                ? "bg-gradient-brand text-white shadow-neon-primary"
                : "border border-white/10 bg-surface2/60 text-text-secondary hover:text-text-primary"
            }`}
          >
            {t(`cards.categories.${c}`)}
          </button>
        ))}
      </div>

      {cardsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : visible.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className={`glass-card flex flex-col items-center gap-2 p-4 text-center ${
                card.is_active ? "" : "opacity-50"
              }`}
            >
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-surface2 to-surface text-4xl">
                {card.image ? (
                  <img src={card.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  card.emoji
                )}
              </div>
              <p className="font-semibold leading-tight">
                {lang === "kk" ? card.title_kk : card.title_ru}
              </p>
              <Badge tone={CAT_TONE[card.category]}>
                {t(`cards.categories.${card.category}`)}
              </Badge>
              <div className="mt-1 flex gap-1">
                <button
                  onClick={() => toggleMutation.mutate(card)}
                  title={card.is_active ? t("cards.active") : t("cards.inactive")}
                  className={`rounded-xl p-2 transition-colors ${
                    card.is_active
                      ? "text-accent2 hover:bg-accent2/15"
                      : "text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(card)}
                  className="rounded-xl p-2 text-text-secondary hover:bg-accent4/20 hover:text-accent4"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-text-secondary">{t("common.empty")}</p>
      )}

      <CardForm open={formOpen} onClose={() => setFormOpen(false)} childId={childId} />
    </div>
  );
}
