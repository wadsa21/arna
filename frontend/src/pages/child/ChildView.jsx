import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarHeart, MessageCircleHeart } from "lucide-react";

import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import { Skeleton } from "../../components/ui/Skeleton";
import ChildSchedule from "../../components/child/ChildSchedule";
import CommunicationCards from "../../components/child/CommunicationCards";
import { scheduleApi, cardsApi } from "../../services/api";
import { toList } from "../../hooks/useChildren";

const today = () => new Date().toISOString().slice(0, 10);

export default function ChildView() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab] = useState("schedule");

  const scheduleQuery = useQuery({
    queryKey: ["child-schedule", childId, today()],
    queryFn: async () =>
      toList((await scheduleApi.list({ child: childId, date: today() })).data)[0] ||
      null,
  });

  const cardsQuery = useQuery({
    queryKey: ["child-cards", childId],
    queryFn: async () =>
      toList((await cardsApi.list({ child: childId, is_active: true })).data),
  });

  const cards = cardsQuery.data ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Яркий анимированный фон */}
      <div className="animated-gradient-bg fixed inset-0 -z-10 opacity-20" />
      <div className="fixed inset-0 -z-10 bg-background/80" />

      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate("/parent/dashboard")}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2/70 text-text-primary tap-shrink"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <LanguageSwitcher />
      </div>

      {/* Tabs — огромные */}
      <div className="mx-auto flex max-w-2xl gap-3 px-4">
        {[
          { key: "schedule", icon: CalendarHeart, label: t("child.my_day"), grad: "from-primary to-accent1" },
          { key: "cards", icon: MessageCircleHeart, label: t("child.i_want_to_say"), grad: "from-secondary to-accent3" },
        ].map(({ key, icon: Icon, label, grad }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.94 }}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-3xl py-5 text-xl font-extrabold transition-all ${
              tab === key
                ? `bg-gradient-to-r ${grad} text-white shadow-2xl`
                : "bg-surface2/60 text-text-secondary"
            }`}
          >
            <Icon className="h-7 w-7" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl p-5 pb-16">
        {tab === "schedule" ? (
          scheduleQuery.isLoading ? (
            <div className="flex flex-col items-center gap-6 py-10">
              <Skeleton className="h-52 w-52 rounded-[2.5rem]" />
              <Skeleton className="h-10 w-64" />
            </div>
          ) : (
            <ChildSchedule
              schedule={scheduleQuery.data}
              childId={childId}
              date={today()}
            />
          )
        ) : cardsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : cards.length ? (
          <CommunicationCards cards={cards} />
        ) : (
          <p className="py-16 text-center text-2xl text-text-secondary">🤔</p>
        )}
      </div>
    </div>
  );
}
