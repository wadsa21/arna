import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, ArrowRight } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { PLAN_EMOJI } from "./planFeatures";

/** Глобальная модалка апгрейда — открывается автоматически при 403 upgrade_required. */
export default function UpgradeModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const upgrade = useSubscriptionStore((s) => s.upgrade);
  const close = useSubscriptionStore((s) => s.closeUpgrade);

  const plan = upgrade.requiredPlan || "OTBASY";
  const planLabel = t(`billing.plans.${plan}`);

  const goCheckout = () => {
    close();
    navigate(`/checkout?plan=${plan}`);
  };
  const goPricing = () => {
    close();
    navigate("/pricing");
  };

  return (
    <Modal open={upgrade.open} onClose={close} title="">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-brand text-5xl shadow-neon-primary">
          {PLAN_EMOJI[plan] || "✨"}
        </div>
        <h3 className="text-2xl font-bold gradient-text">
          {t("billing.upgrade_title", { plan: planLabel })}
        </h3>
        <p className="max-w-sm text-text-secondary">
          {upgrade.message || t("billing.upgrade_desc", { plan: planLabel })}
        </p>
        <Button onClick={goCheckout} className="mt-2 w-full">
          <Sparkles className="h-5 w-5" />
          {t("billing.upgrade_btn", { plan: planLabel })}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <button
          onClick={goPricing}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          {t("billing.see_all_plans")}
        </button>
      </div>
    </Modal>
  );
}
