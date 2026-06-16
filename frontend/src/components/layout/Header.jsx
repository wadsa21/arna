import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, ChevronDown } from "lucide-react";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

export default function Header({ children = [], selectedChildId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setSelectedChild = useUIStore((s) => s.setSelectedChild);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
      <div className="lg:hidden flex items-center gap-2">
        <span className="text-2xl">🌈</span>
        <span className="font-extrabold gradient-text">{t("brand")}</span>
      </div>

      {children.length > 1 && (
        <div className="relative hidden sm:block">
          <select
            value={selectedChildId || ""}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="appearance-none rounded-2xl border border-white/10 bg-surface2/60 py-2 pl-4 pr-9 text-sm font-semibold text-text-primary outline-none focus:border-primary/60"
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
        <LanguageSwitcher />
        <NotificationBell />
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-surface2/60 py-1.5 pl-3 pr-1.5">
          <span className="text-sm font-semibold text-text-primary max-w-32 truncate">
            {user?.full_name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            title={t("common.logout")}
            className="rounded-xl p-1.5 text-text-secondary hover:bg-accent4/20 hover:text-accent4 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="sm:hidden rounded-xl p-2 text-text-secondary hover:text-accent4"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
