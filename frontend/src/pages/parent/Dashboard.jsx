import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, Baby, Sparkles, TrendingUp } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { SkeletonList } from "../../components/ui/Skeleton";
import MoodChart from "../../components/parent/MoodChart";
import EmptyChild from "../../components/parent/EmptyChild";
import { useChildren, toList } from "../../hooks/useChildren";
import { scheduleApi, behaviorApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

const today = () => new Date().toISOString().slice(0, 10);
const MOOD_EMOJI = { 1: "😣", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄" };

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const user = useAuthStore((s) => s.user);
  const { selectedChild, isLoading: childrenLoading, children } = useChildren();
  const childId = selectedChild?.id;

  const scheduleQuery = useQuery({
    queryKey: ["schedule", childId, today()],
    enabled: !!childId,
    queryFn: async () =>
      toList((await scheduleApi.list({ child: childId, date: today() })).data)[0] ||
      null,
  });

  const behaviorQuery = useQuery({
    queryKey: ["behavior", childId],
    enabled: !!childId,
    queryFn: async () =>
      toList((await behaviorApi.list({ child: childId, ordering: "date" })).data),
  });

  if (!childrenLoading && children.length === 0) return <EmptyChild />;

  const schedule = scheduleQuery.data;
  const progress = schedule?.progress || { done: 0, total: 0, percent: 0 };
  const logs = behaviorQuery.data ?? [];
  const moodData = logs.slice(-7).map((l) => ({ date: l.date, mood: l.mood }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">
            <span className="gradient-text">
              {t("dashboard.greeting", { name: user?.full_name?.split(" ")[0] || "👋" })}
            </span>
          </h1>
          {selectedChild && (
            <p className="mt-1 text-text-secondary">
              {selectedChild.name} · {selectedChild.age || "—"}{" "}
              <Badge tone="primary" className="ml-1">
                {t(`children.level.${selectedChild.communication_level}`)}
              </Badge>
            </p>
          )}
        </div>
        {childId && (
          <Link to={`/child/${childId}`}>
            <Button>
              <Baby className="h-5 w-5" /> {t("dashboard.open_child_mode")}
              <Sparkles className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Mood chart */}
        <Card className="lg:col-span-2" glow>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-bold">{t("dashboard.mood_week")}</h2>
          </div>
          {behaviorQuery.isLoading ? (
            <SkeletonList count={1} itemClass="h-52" />
          ) : moodData.length ? (
            <MoodChart data={moodData} />
          ) : (
            <p className="py-16 text-center text-text-secondary">{t("common.empty")}</p>
          )}
        </Card>

        {/* Progress ring */}
        <Card glow>
          <h2 className="mb-4 text-lg font-bold">{t("dashboard.progress")}</h2>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative h-40 w-40">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#ring)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 42 * (1 - progress.percent / 100),
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black gradient-text">
                  {progress.percent}%
                </span>
                <span className="text-xs text-text-secondary">
                  {progress.done}/{progress.total}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today schedule */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-accent1" />
              <h2 className="text-lg font-bold">{t("dashboard.today_schedule")}</h2>
            </div>
            <Link to="/parent/schedule">
              <Button variant="soft">{t("common.edit")}</Button>
            </Link>
          </div>
          {scheduleQuery.isLoading ? (
            <SkeletonList count={4} />
          ) : schedule?.items?.length ? (
            <div className="space-y-2">
              {schedule.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 rounded-2xl bg-surface2/50 p-3"
                >
                  <span className="text-2xl">{it.emoji}</span>
                  <span className="font-semibold">
                    {lang === "kk" ? it.title_kk : it.title_ru}
                  </span>
                  <span className="ml-auto text-sm text-text-secondary">
                    {it.start_time?.slice(0, 5)}
                  </span>
                  {it.status === "DONE" && (
                    <Badge tone="accent2">✓</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-text-secondary">{t("common.empty")}</p>
          )}
        </Card>

        {/* Recent logs */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("dashboard.recent_logs")}</h2>
            <Link to="/parent/behavior">
              <Button variant="soft">{t("common.add")}</Button>
            </Link>
          </div>
          {behaviorQuery.isLoading ? (
            <SkeletonList count={3} />
          ) : logs.length ? (
            <div className="space-y-2">
              {[...logs].reverse().slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-2xl bg-surface2/50 p-3"
                >
                  <span className="text-2xl">{MOOD_EMOJI[l.mood]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{l.date}</p>
                    <p className="truncate text-xs text-text-secondary">
                      {l.positive_moments || l.notes || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-text-secondary">{t("common.empty")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
