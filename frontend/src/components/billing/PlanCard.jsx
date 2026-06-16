import { motion } from "framer-motion";
import { Check, X, Clock, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { planFeatureRows, PLAN_GRADIENTS, PLAN_EMOJI } from "./planFeatures";

const StatusIcon = ({ status }) => {
  if (status === "yes") return <Check className="h-4 w-4 shrink-0 text-accent2" />;
  if (status === "soon") return <Clock className="h-4 w-4 shrink-0 text-accent3" />;
  return <X className="h-4 w-4 shrink-0 text-text-secondary/50" />;
};

const fmtPrice = (v) => Number(v).toLocaleString("ru-RU");

export default function PlanCard({ plan, billingCycle, currentPlan, onSelect, index }) {
  const { t } = useTranslation();
  const rows = planFeatureRows(plan, t);
  const isCurrent = currentPlan === plan.name;
  const featured = plan.is_featured;

  const priceBlock = () => {
    if (plan.is_contact_sales)
      return <span className="text-3xl font-black">{t("billing.contact_price")}</span>;
    if (!Number(plan.price_monthly))
      return <span className="text-3xl font-black">{t("billing.free_price")}</span>;
    const amount =
      billingCycle === "YEARLY" ? plan.price_yearly : plan.price_monthly;
    const unit = billingCycle === "YEARLY" ? t("billing.per_year") : t("billing.per_month");
    return (
      <div>
        <span className="text-4xl font-black gradient-text">{fmtPrice(amount)}</span>
        <span className="ml-1 text-sm text-text-secondary">{unit}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className={`glass-card relative flex flex-col p-6 ${
        featured
          ? "neon-glow border-primary/40 lg:scale-105 lg:-my-2"
          : ""
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-xs font-bold text-white shadow-neon-primary">
          <Crown className="mr-1 inline h-3 w-3" />
          {t("billing.popular")}
        </span>
      )}

      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${PLAN_GRADIENTS[plan.name]} text-3xl`}
      >
        {PLAN_EMOJI[plan.name]}
      </div>

      <h3 className="text-xl font-extrabold">{t(`billing.plans.${plan.name}`)}</h3>
      <div className="mt-2 mb-5 min-h-[3rem]">{priceBlock()}</div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {rows.map((row) => (
          <li
            key={row.key}
            className={`flex items-center gap-2 text-sm ${
              row.status === "no" ? "text-text-secondary/60" : "text-text-primary"
            }`}
          >
            <StatusIcon status={row.status} />
            <span>
              {row.label}
              {row.status === "soon" && (
                <span className="ml-1.5 rounded-full bg-accent3/15 px-1.5 py-0.5 text-[10px] font-bold text-accent3">
                  {t("billing.soon")}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="rounded-2xl border border-accent2/40 bg-accent2/10 py-3 text-center text-sm font-bold text-accent2">
          {t("billing.current")}
        </div>
      ) : plan.is_contact_sales ? (
        <button onClick={() => onSelect(plan)} className="btn-gradient w-full justify-center">
          {t("billing.contact_us")}
        </button>
      ) : !Number(plan.price_monthly) ? (
        <button
          onClick={() => onSelect(plan)}
          className="w-full rounded-2xl border border-white/10 py-3 font-semibold text-text-primary transition-colors hover:bg-white/5"
        >
          {t("billing.start_free")}
        </button>
      ) : (
        <button onClick={() => onSelect(plan)} className="btn-gradient w-full justify-center">
          {t("billing.choose")}
        </button>
      )}
    </motion.div>
  );
}
