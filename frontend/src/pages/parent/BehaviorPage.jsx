import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import Card from "../../components/ui/Card";
import { SkeletonList } from "../../components/ui/Skeleton";
import MoodChart from "../../components/parent/MoodChart";
import BehaviorForm from "../../components/parent/BehaviorForm";
import EmptyChild from "../../components/parent/EmptyChild";
import UpgradePrompt from "../../components/billing/UpgradePrompt";
import { useChildren, toList } from "../../hooks/useChildren";
import { behaviorApi } from "../../services/api";
import { useSubscriptionStore } from "../../store/subscriptionStore";

const MOOD_EMOJI = { 1: "😣", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄" };

export default function BehaviorPage() {
  const { t } = useTranslation();
  const { selectedChild, children, isLoading: childrenLoading } = useChildren();
  const childId = selectedChild?.id;
  const isFeatureAvailable = useSubscriptionStore((s) => s.isFeatureAvailable);
  const hasBehavior = isFeatureAvailable("has_behavior_log");

  const logsQuery = useQuery({
    queryKey: ["behavior", childId],
    enabled: !!childId && hasBehavior,
    queryFn: async () =>
      toList((await behaviorApi.list({ child: childId, ordering: "date" })).data),
  });

  if (!childrenLoading && children.length === 0) return <EmptyChild />;

  // Дневник поведения — фича платных тарифов
  if (!hasBehavior) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-extrabold gradient-text">{t("behavior.title")}</h1>
        <UpgradePrompt requiredPlan="OTBASY" />
      </div>
    );
  }

  const logs = logsQuery.data ?? [];
  const monthData = logs.slice(-30).map((l) => ({ date: l.date, mood: l.mood }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-extrabold gradient-text">{t("behavior.title")}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BehaviorForm childId={childId} />

        <Card>
          <h2 className="mb-4 text-lg font-bold">{t("behavior.month_chart")}</h2>
          {logsQuery.isLoading ? (
            <SkeletonList count={1} itemClass="h-52" />
          ) : monthData.length ? (
            <MoodChart data={monthData} />
          ) : (
            <p className="py-16 text-center text-text-secondary">{t("common.empty")}</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-bold">{t("behavior.history")}</h2>
        {logsQuery.isLoading ? (
          <SkeletonList count={4} />
        ) : logs.length ? (
          <div className="space-y-3">
            {[...logs].reverse().map((l) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-surface2/50 p-4"
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl">{MOOD_EMOJI[l.mood]}</span>
                  <span className="text-xs text-text-secondary">{l.date}</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  {l.positive_moments && (
                    <p className="text-sm">
                      <span className="font-semibold text-accent2">+ </span>
                      {l.positive_moments}
                    </p>
                  )}
                  {l.triggers && (
                    <p className="text-sm">
                      <span className="font-semibold text-accent3">⚡ </span>
                      {l.triggers}
                    </p>
                  )}
                  {l.notes && (
                    <p className="text-sm text-text-secondary">{l.notes}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-text-secondary">{t("common.empty")}</p>
        )}
      </Card>
    </div>
  );
}
