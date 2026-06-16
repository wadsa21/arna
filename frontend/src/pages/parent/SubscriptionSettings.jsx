import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Crown, Baby, MessageSquareHeart, Sparkles, Copy, Gift, XCircle } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { SkeletonList } from "../../components/ui/Skeleton";
import PlanBadge from "../../components/billing/PlanBadge";
import UsageMeter from "../../components/billing/UsageMeter";
import { billingApi } from "../../services/api";
import { useSubscriptionStore } from "../../store/subscriptionStore";

const STATUS_TONE = {
  ACTIVE: "accent2",
  TRIAL: "accent1",
  CANCELLED: "accent3",
  EXPIRED: "danger",
};
const PAY_TONE = { SUCCESS: "accent2", PENDING: "accent3", FAILED: "danger", REFUNDED: "muted" };
const fmt = (v) => Number(v).toLocaleString("ru-RU");

export default function SubscriptionSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { subscription, fetchSubscription } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const historyQuery = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => (await billingApi.history()).data,
  });

  const referralQuery = useQuery({
    queryKey: ["referral"],
    queryFn: async () => (await billingApi.myReferral()).data,
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingApi.cancel(),
    onSuccess: () => {
      fetchSubscription();
      qc.invalidateQueries({ queryKey: ["payment-history"] });
      toast.success(t("billing.cancelled"));
    },
  });

  if (!subscription) return <div className="mx-auto max-w-4xl"><SkeletonList count={3} itemClass="h-32" /></div>;

  const { plan, usage } = subscription;
  const expires = subscription.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("ru-RU")
    : t("billing.no_expiry");

  const copyCode = () => {
    navigator.clipboard?.writeText(referralQuery.data?.code || "");
    toast.success(t("billing.code_copied"));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-extrabold gradient-text">{t("billing.sub_title")}</h1>

      {/* Текущий план */}
      <Card glow>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-3xl shadow-neon-primary">
              {plan.name === "PRO" || plan.name === "ENTERPRISE" ? <Crown className="h-8 w-8 text-white" /> : "🏡"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <PlanBadge plan={plan.name} />
                <Badge tone={STATUS_TONE[subscription.status]}>{subscription.status}</Badge>
              </div>
              <p className="mt-1.5 text-sm text-text-secondary">
                {t("billing.expires")}: {expires}
                {subscription.days_left != null && (
                  <span className="ml-1">· {t("billing.days_left", { n: subscription.days_left })}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/pricing")}>
              <Sparkles className="h-4 w-4" /> {t("billing.choose")}
            </Button>
            {plan.name !== "FREE" && subscription.auto_renew && (
              <Button variant="ghost" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
                <XCircle className="h-4 w-4" /> {t("billing.cancel_renew")}
              </Button>
            )}
          </div>
        </div>

        {/* Использование лимитов */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UsageMeter
            label={t("billing.usage_children")}
            used={usage.children}
            limit={plan.max_children}
            icon={<Baby className="h-4 w-4" />}
          />
          <UsageMeter
            label={t("billing.usage_cards")}
            used={usage.cards}
            limit={plan.max_cards}
            icon={<MessageSquareHeart className="h-4 w-4" />}
          />
        </div>
      </Card>

      {/* Реферальная программа */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-bold">{t("billing.referral_section")}</h2>
        </div>
        {referralQuery.isLoading ? (
          <SkeletonList count={1} itemClass="h-16" />
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
              <span className="font-mono text-lg font-bold tracking-wider text-primary">
                {referralQuery.data?.code}
              </span>
              <button onClick={copyCode} className="rounded-lg p-1.5 hover:bg-white/10">
                <Copy className="h-4 w-4 text-text-secondary" />
              </button>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-black gradient-text">{referralQuery.data?.uses_count ?? 0}</p>
                <p className="text-xs text-text-secondary">{t("billing.uses")}</p>
              </div>
              <div>
                <p className="text-2xl font-black gradient-text">{fmt(referralQuery.data?.earned ?? 0)} ₸</p>
                <p className="text-xs text-text-secondary">{t("billing.earned")}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* История платежей */}
      <Card>
        <h2 className="mb-4 text-lg font-bold">{t("billing.payment_history")}</h2>
        {historyQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : historyQuery.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/5">
                {historyQuery.data.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-text-secondary">
                      {new Date(p.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="py-3 font-semibold">{p.plan_name}</td>
                    <td className="py-3">{fmt(p.amount)} {p.currency}</td>
                    <td className="py-3">{p.payment_method}</td>
                    <td className="py-3 text-right">
                      <Badge tone={PAY_TONE[p.status]}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-10 text-center text-text-secondary">{t("common.empty")}</p>
        )}
      </Card>
    </div>
  );
}
