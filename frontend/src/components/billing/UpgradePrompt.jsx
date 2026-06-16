import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Мягкий янтарный баннер для страниц, где фича заблокирована.
 */
export default function UpgradePrompt({ requiredPlan = "OTBASY", message }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 rounded-3xl border border-accent3/30 bg-gradient-to-br from-accent3/15 to-accent4/10 p-8 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-warm text-white shadow-lg">
        <Lock className="h-7 w-7" />
      </div>
      <p className="max-w-md text-lg font-semibold text-text-primary">
        {message || t("billing.locked", { plan: t(`billing.plans.${requiredPlan}`) })}
      </p>
      <button
        onClick={() => navigate(`/checkout?plan=${requiredPlan}`)}
        className="btn-gradient"
      >
        {t("billing.upgrade_btn", { plan: t(`billing.plans.${requiredPlan}`) })}
        <ArrowRight className="h-4 w-4" />
      </button>
      <button
        onClick={() => navigate("/pricing")}
        className="text-sm text-text-secondary hover:text-text-primary"
      >
        {t("billing.see_all_plans")}
      </button>
    </motion.div>
  );
}
