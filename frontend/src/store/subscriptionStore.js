import { create } from "zustand";
import { billingApi } from "../services/api";

const deriveFromSub = (sub) => ({
  subscription: sub,
  currentPlan: sub?.plan?.name || "FREE",
  limits: {
    max_children: sub?.plan?.max_children ?? null,
    max_cards: sub?.plan?.max_cards ?? null,
  },
  usage: sub?.usage || { children: 0, cards: 0 },
});

/**
 * Стор подписки: текущий план, лимиты, использование, проверка фич
 * и состояние глобальной модалки апгрейда.
 */
export const useSubscriptionStore = create((set, get) => ({
  subscription: null,
  currentPlan: "FREE",
  limits: { max_children: 1, max_cards: 10 },
  usage: { children: 0, cards: 0 },
  loading: false,

  // глобальная модалка апгрейда + анти-спам
  upgrade: { open: false, requiredPlan: null, currentPlan: null, message: "" },
  _upgradeCooldownUntil: 0,

  /** Доступна ли фича плана (например "has_behavior_log", "has_ai"). */
  isFeatureAvailable(feature) {
    const sub = get().subscription;
    return !!(sub?.is_active && sub?.plan?.[feature]);
  },

  async fetchSubscription() {
    set({ loading: true });
    try {
      const { data } = await billingApi.subscription();
      set({ ...deriveFromSub(data), loading: false });
      return data;
    } catch {
      set({ loading: false });
      return null;
    }
  },

  async upgradePlan(planId, billingCycle, paymentMethod = "KASPI", referralCode) {
    const { data } = await billingApi.upgrade({
      plan_id: planId,
      billing_cycle: billingCycle,
      payment_method: paymentMethod,
      referral_code: referralCode || undefined,
    });
    set(deriveFromSub(data.subscription));
    return data;
  },

  openUpgrade({ requiredPlan, currentPlan, message } = {}) {
    const s = get();
    // Не спамим: пропускаем, если уже открыта или идёт период «тишины»
    if (s.upgrade.open || Date.now() < s._upgradeCooldownUntil) return;
    set({
      upgrade: {
        open: true,
        requiredPlan: requiredPlan || "OTBASY",
        currentPlan: currentPlan || s.currentPlan,
        message: message || "",
      },
    });
  },

  closeUpgrade() {
    // После закрытия — 5 минут тишины, чтобы реклама не выскакивала снова
    set((st) => ({
      upgrade: { ...st.upgrade, open: false },
      _upgradeCooldownUntil: Date.now() + 5 * 60 * 1000,
    }));
  },
}));
