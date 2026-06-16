import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquareHeart,
  NotebookPen,
  Baby,
  Sparkles,
} from "lucide-react";
import Logo from "../ui/Logo";

const NAV = [
  { to: "/parent/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { to: "/parent/schedule", icon: CalendarDays, key: "schedule" },
  { to: "/parent/cards", icon: MessageSquareHeart, key: "cards" },
  { to: "/parent/behavior", icon: NotebookPen, key: "behavior" },
];

export default function Sidebar({ childId }) {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-3 p-4">
      {/* Бренд */}
      <div className="glass-card flex items-center gap-3 p-4">
        <Logo size={44} showWord={false} />
        <div>
          <p className="text-lg font-extrabold gradient-text leading-none">
            {t("brand")}
          </p>
          <p className="mt-1 text-xs text-text-secondary">канал связи</p>
        </div>
      </div>

      {/* Навигация */}
      <nav className="glass-card flex-1 p-3">
        <div className="space-y-1">
          {NAV.map(({ to, icon: Icon, key }) => (
            <NavLink key={to} to={to} className="block">
              {({ isActive }) => (
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-2xl bg-white shadow-neon-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ x: isActive ? 0 : 4 }}
                    className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-colors ${
                      isActive
                        ? "text-black"
                        : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {t(`nav.${key}`)}
                  </motion.div>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {childId && (
        <NavLink to={`/child/${childId}`} className="btn-gradient w-full justify-center">
          <Baby className="h-5 w-5" />
          {t("nav.child_mode")}
          <Sparkles className="h-4 w-4" />
        </NavLink>
      )}
    </aside>
  );
}
