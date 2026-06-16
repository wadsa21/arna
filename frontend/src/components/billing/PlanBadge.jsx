import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

const STYLES = {
  FREE: "bg-white/5 text-text-secondary border-white/10",
  OTBASY: "bg-white text-black border-white shadow-neon-primary",
  PRO: "bg-white text-black border-white shadow-neon-secondary",
  ENTERPRISE: "bg-white text-black border-white",
};

/** Маленький бейдж текущего плана — для хедера. */
export default function PlanBadge({ plan = "FREE", className = "" }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${STYLES[plan] || STYLES.FREE} ${className}`}
    >
      {(plan === "PRO" || plan === "ENTERPRISE") && <Crown className="h-3 w-3" />}
      {t(`billing.plans.${plan}`)}
    </span>
  );
}
