/**
 * Превращает объект плана в список строк-фич для карточки тарифа.
 * status: "yes" (✅) | "no" (❌) | "soon" (🔜 — для ИИ).
 * label — ключ i18n внутри billing.features.
 */
export function planFeatureRows(plan, t) {
  const yes = (k) => ({ key: k, label: t(`billing.features.${k}`), status: "yes" });
  const no = (k) => ({ key: k, label: t(`billing.features.${k}`), status: "no" });
  const soon = (k) => ({ key: k, label: t(`billing.features.${k}`), status: "soon" });

  const childrenRow =
    plan.max_children == null ? yes("children_unlim")
    : plan.max_children >= 3 ? yes("children_3")
    : yes("children_1");

  const cardsRow = plan.max_cards == null ? yes("cards_unlim") : yes("cards_10");
  const scheduleRow = plan.schedule_any_date ? yes("schedule_any") : yes("schedule_today");

  const rows = [
    childrenRow,
    cardsRow,
    scheduleRow,
    plan.has_behavior_log ? yes("behavior") : no("behavior"),
    plan.has_realtime ? yes("realtime") : no("realtime"),
    plan.has_pdf_export ? yes("pdf") : no("pdf"),
    // ИИ — помечаем «скоро» там, где включено (логика появится позже)
    plan.has_ai ? soon("ai") : no("ai"),
  ];

  // Премиальные строки показываем только если включены — чтобы карточки не раздувались
  if (plan.has_priority_support) rows.push(yes("priority"));
  if (plan.has_white_label) rows.push(yes("white_label"));
  if (plan.multi_admin) rows.push(yes("multi_admin"));
  if (plan.has_api_access) rows.push(yes("api"));

  return rows;
}

import { Sparkles, Home, Crown, Building2 } from "lucide-react";

export const PLAN_GRADIENTS = {
  FREE: "from-white to-neutral-400",
  OTBASY: "from-white to-neutral-300",
  PRO: "from-white via-neutral-300 to-neutral-500",
  ENTERPRISE: "from-white to-neutral-500",
};

/** Иконки тарифов (Lucide) вместо эмодзи. */
export const PLAN_ICON = {
  FREE: Sparkles,
  OTBASY: Home,
  PRO: Crown,
  ENTERPRISE: Building2,
};
