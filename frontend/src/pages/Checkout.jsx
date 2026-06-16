import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard, Check, Tag, Smartphone } from "lucide-react";

import AnimatedBackground from "../components/ui/AnimatedBackground";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { billingApi } from "../services/api";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { PLAN_ICON, PLAN_GRADIENTS } from "../components/billing/planFeatures";

const fmt = (v) => Number(v).toLocaleString("ru-RU");
const METHODS = [
  { value: "KASPI", label: "Kaspi Pay", icon: Smartphone },
  { value: "CARD", label: "Visa / Mastercard", icon: CreditCard },
];

export default function Checkout() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planName = params.get("plan") || "OTBASY";
  const upgradePlan = useSubscriptionStore((s) => s.upgradePlan);

  const [cycle, setCycle] = useState("MONTHLY");
  const [method, setMethod] = useState("KASPI");
  const [code, setCode] = useState("");
  const [referral, setReferral] = useState(null); // {valid, discount_percent}
  const [loading, setLoading] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await billingApi.plans()).data,
  });

  const plan = plans?.find((p) => p.name === planName);

  const { base, discount, total } = useMemo(() => {
    if (!plan) return { base: 0, discount: 0, total: 0 };
    const b = Number(cycle === "YEARLY" ? plan.price_yearly : plan.price_monthly);
    const d = referral?.valid ? (b * referral.discount_percent) / 100 : 0;
    return { base: b, discount: d, total: b - d };
  }, [plan, cycle, referral]);

  const applyCode = async () => {
    if (!code.trim()) return;
    const { data } = await billingApi.validateReferral(code.trim());
    if (data.valid) {
      setReferral(data);
      toast.success(t("billing.referral_valid", { percent: data.discount_percent }));
    } else {
      setReferral(null);
      toast.error(t("billing.referral_invalid"));
    }
  };

  const pay = async () => {
    setLoading(true);
    try {
      await upgradePlan(plan.id, cycle, method, referral?.valid ? code.trim() : undefined);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#FFFFFF", "#D4D4D4", "#A3A3A3", "#737373"],
      });
      toast.success(t("billing.pay_success"));
      setTimeout(() => navigate("/parent/dashboard"), 1200);
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <header className="flex items-center justify-between px-5 py-5 lg:px-12">
        <Link to="/pricing" className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-5 w-5" /> {t("common.back")}
        </Link>
      </header>

      <div className="mx-auto max-w-lg px-5 pb-16">
        <h1 className="mb-6 text-center text-3xl font-black gradient-text">
          {t("billing.checkout_title")}
        </h1>

        {isLoading || !plan ? (
          <Skeleton className="h-96" />
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card neon-glow p-6">
            {/* Выбранный план */}
            <div className="mb-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${PLAN_GRADIENTS[plan.name]} text-black`}
              >
                {(() => {
                  const Icon = PLAN_ICON[plan.name] || PLAN_ICON.FREE;
                  return <Icon className="h-7 w-7" />;
                })()}
              </div>
              <div>
                <p className="text-lg font-bold">{t(`billing.plans.${plan.name}`)}</p>
                <p className="text-sm text-text-secondary">Арна</p>
              </div>
            </div>

            {/* Цикл */}
            <div className="mb-5 inline-flex w-full rounded-2xl border border-white/10 bg-black/40 p-1">
              {["MONTHLY", "YEARLY"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
                    cycle === c ? "bg-white text-black" : "text-text-secondary"
                  }`}
                >
                  {t(`billing.${c === "MONTHLY" ? "monthly" : "yearly"}`)}
                </button>
              ))}
            </div>

            {/* Способ оплаты */}
            <p className="mb-2 text-sm font-medium text-text-secondary">
              {t("billing.payment_method")}
            </p>
            <div className="mb-5 grid grid-cols-2 gap-3">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition-all ${
                      method === m.value
                        ? "border-white bg-white text-black shadow-neon-primary"
                        : "border-white/10 bg-black/30 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {m.label}
                  </button>
                );
              })}
            </div>

            {/* Реферальный код */}
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
              <Tag className="h-4 w-4" /> {t("billing.referral_code")}
            </p>
            <div className="mb-5 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ARNA..."
                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-text-primary outline-none focus:border-white/60"
              />
              <Button variant="ghost" onClick={applyCode} className="!py-2.5">
                {referral?.valid ? <Check className="h-4 w-4 text-text-primary" /> : t("billing.referral_apply")}
              </Button>
            </div>

            {/* Итого */}
            <div className="mb-5 space-y-2 border-t border-white/10 pt-4">
              {discount > 0 && (
                <div className="flex justify-between text-sm text-text-primary">
                  <span>{t("billing.discount")}</span>
                  <span>−{fmt(discount)} ₸</span>
                </div>
              )}
              <div className="flex items-end justify-between">
                <span className="font-semibold">{t("billing.total")}</span>
                <span className="text-3xl font-black gradient-text">{fmt(total)} ₸</span>
              </div>
            </div>

            <Button onClick={pay} loading={loading} className="w-full">
              <CreditCard className="h-5 w-5" /> {t("billing.pay")}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
