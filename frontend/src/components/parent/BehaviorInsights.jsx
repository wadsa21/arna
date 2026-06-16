import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, TrendingDown, Minus, Lock, Lightbulb } from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import { SkeletonList } from "../ui/Skeleton";
import { behaviorApi } from "../../services/api";
import { useSubscriptionStore } from "../../store/subscriptionStore";

const MOOD_EMOJI = { 1: "😣", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄" };
const TREND_ICON = { improving: TrendingUp, declining: TrendingDown, stable: Minus };

export default function BehaviorInsights({ childId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasAi = useSubscriptionStore((s) => s.isFeatureAvailable("has_ai"));

  const { data, isLoading } = useQuery({
    queryKey: ["behavior-insights", childId],
    enabled: !!childId && hasAi,
    queryFn: async () => (await behaviorApi.insights(childId)).data,
  });

  // Заблокировано — мягкий тизер с апгрейдом до PRO
  if (!hasAi) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Lock className="h-6 w-6 text-text-secondary" />
          </div>
          <p className="font-semibold">{t("behavior.insights_title")}</p>
          <p className="max-w-xs text-sm text-text-secondary">
            {t("behavior.insights_locked")}
          </p>
          <Button onClick={() => navigate("/checkout?plan=PRO")}>
            <Sparkles className="h-4 w-4" /> {t("billing.plans.PRO")}
          </Button>
        </div>
      </Card>
    );
  }

  const Trend = TREND_ICON[data?.trend] || Minus;

  return (
    <Card glow>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-text-primary" />
        <h2 className="text-lg font-bold">{t("behavior.insights_title")}</h2>
      </div>

      {isLoading ? (
        <SkeletonList count={2} itemClass="h-12" />
      ) : !data || data.data_points === 0 ? (
        <p className="py-8 text-center text-text-secondary">{t("common.empty")}</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-2xl font-black gradient-text">
                {MOOD_EMOJI[Math.round(data.average_mood)] || ""} {data.average_mood}
              </p>
              <p className="text-xs text-text-secondary">{t("behavior.avg_mood")}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="flex items-center justify-center gap-1 text-lg font-bold">
                <Trend className="h-5 w-5" /> {t(`behavior.trend_${data.trend}`)}
              </p>
              <p className="text-xs text-text-secondary">{t("behavior.trend")}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-2xl font-black gradient-text">{data.good_streak}</p>
              <p className="text-xs text-text-secondary">{t("behavior.streak")}</p>
            </div>
          </div>

          {data.common_triggers?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.common_triggers.map((tr) => (
                <span
                  key={tr.text}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
                >
                  {tr.text} · {tr.count}×
                </span>
              ))}
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
              <Lightbulb className="h-4 w-4" /> {t("behavior.recommendations")}
            </p>
            <ul className="space-y-2">
              {data.recommendations?.map((rec, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-2xl bg-white/5 p-3 text-sm"
                >
                  <span className="text-text-secondary">{i + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
