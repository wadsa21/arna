import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft } from "lucide-react";

import AnimatedBackground from "../components/ui/AnimatedBackground";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import { Skeleton } from "../components/ui/Skeleton";
import PlanCard from "../components/billing/PlanCard";
import { billingApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useSubscriptionStore } from "../store/subscriptionStore";

const FAQ_KEYS = ["1", "2", "3", "4"];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card overflow-hidden p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="font-semibold">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5"
          >
            <p className="pb-5 text-sm text-text-secondary">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.accessToken);
  const [cycle, setCycle] = useState("MONTHLY");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await billingApi.plans()).data,
  });

  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);
  const subscription = useSubscriptionStore((s) => s.subscription);

  useEffect(() => {
    if (token && !subscription) fetchSubscription();
  }, [token, subscription, fetchSubscription]);

  const handleSelect = (plan) => {
    if (plan.is_contact_sales) {
      window.location.href = "mailto:b2b@arna.kz?subject=Enterprise%20Арна";
      return;
    }
    if (!Number(plan.price_monthly)) {
      navigate(token ? "/parent/dashboard" : "/register");
      return;
    }
    navigate(token ? `/checkout?plan=${plan.name}` : "/register");
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <AnimatedBackground />

      <header className="flex items-center justify-between px-5 py-5 lg:px-12">
        <Link to={token ? "/parent/dashboard" : "/"} className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-2xl">🌈</span>
          <span className="text-xl font-extrabold gradient-text">{t("brand")}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="mx-auto max-w-6xl px-5 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-balance lg:text-5xl"
        >
          <span className="gradient-text">{t("billing.pricing_title")}</span>
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          {t("billing.pricing_subtitle")}
        </p>

        {/* Цикл оплаты */}
        <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-white/10 bg-surface2/60 p-1">
          {["MONTHLY", "YEARLY"].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${
                cycle === c ? "bg-gradient-brand text-white shadow-neon-primary" : "text-text-secondary"
              }`}
            >
              {t(`billing.${c === "MONTHLY" ? "monthly" : "yearly"}`)}
              {c === "YEARLY" && (
                <span className="rounded-full bg-accent2/20 px-2 py-0.5 text-[10px] font-bold text-accent2">
                  {t("billing.save_hint")}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Карточки */}
      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 px-5 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[28rem]" />)
          : plans?.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={i}
                billingCycle={cycle}
                currentPlan={currentPlan}
                onSelect={handleSelect}
              />
            ))}
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-20 max-w-2xl px-5">
        <h2 className="mb-6 text-center text-2xl font-bold gradient-text">
          {t("billing.faq_title")}
        </h2>
        <div className="space-y-3">
          {FAQ_KEYS.map((k) => (
            <FaqItem key={k} q={t(`billing.faq.q${k}`)} a={t(`billing.faq.a${k}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
