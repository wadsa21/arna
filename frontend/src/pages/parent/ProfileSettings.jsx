import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, Mail, Globe } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import PlanBadge from "../../components/billing/PlanBadge";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";

export default function ProfileSettings() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    language: user?.language || i18n.resolvedLanguage || "ru",
  });

  const mutation = useMutation({
    mutationFn: () => authApi.updateMe(form),
    onSuccess: ({ data }) => {
      setUser({ ...user, ...data });
      if (form.language && form.language !== i18n.resolvedLanguage) {
        i18n.changeLanguage(form.language);
      }
      toast.success(t("toast.saved"));
    },
    onError: () => toast.error(t("toast.error")),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold gradient-text">{t("auth.profile")}</h1>
        <p className="mt-1 text-text-secondary">{t("auth.profile_subtitle")}</p>
      </div>

      <Card glow>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black">
            {(user?.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-bold">
              {user?.full_name || "—"} <PlanBadge plan={currentPlan} />
            </p>
            <p className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-[42px] h-5 w-5 text-text-secondary" />
            <Input
              label={t("auth.full_name")}
              className="pl-12"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div className="relative">
            <Globe className="pointer-events-none absolute left-4 top-[42px] z-10 h-5 w-5 text-text-secondary" />
            <Select
              label={t("auth.language")}
              className="pl-12"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="kk">Қазақша</option>
              <option value="ru">Русский</option>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={mutation.isPending}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
