import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, ChevronDown } from "lucide-react";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import PlanBadge from "../billing/PlanBadge";
import Logo from "../ui/Logo";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";

export default function Header({ children = [], selectedChildId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setSelectedChild = useUIStore((s) => s.setSelectedChild);
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.08] bg-background/70 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="lg:hidden">
        <Logo size={32} />
      </div>

      {children.length > 1 && (
        <div className="relative hidden sm:block">
          <select
            value={selectedChildId || ""}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="appearance-none rounded-2xl border border-white/10 bg-black/40 py-2 pl-4 pr-9 text-sm font-semibold text-text-primary outline-none focus:border-white/60"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-text-secondary" />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link to="/settings/subscription" className="hidden sm:block">
          <PlanBadge plan={currentPlan} />
        </Link>
        <LanguageSwitcher />
        <NotificationBell />
        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-black/40 py-1.5 pl-3 pr-1.5 sm:flex">
          <span className="text-sm font-semibold text-text-primary max-w-32 truncate">
            {user?.full_name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            title={t("common.logout")}
            className="rounded-xl p-1.5 text-text-secondary transition-colors hover:bg-white hover:text-black"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-xl p-2 text-text-secondary hover:bg-white hover:text-black sm:hidden"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
