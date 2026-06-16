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

const NAV = [
  { to: "/parent/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { to: "/parent/schedule", icon: CalendarDays, key: "schedule" },
  { to: "/parent/cards", icon: MessageSquareHeart, key: "cards" },
  { to: "/parent/behavior", icon: NotebookPen, key: "behavior" },
];

export default function Sidebar({ childId }) {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-2 p-4">
      <div className="glass-card flex items-center gap-3 p-4 mb-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand text-2xl shadow-neon-primary">
          🌈
        </div>
        <div>
          <p className="text-lg font-extrabold gradient-text leading-none">
            {t("brand")}
          </p>
          <p className="text-xs text-text-secondary">канал связи</p>
        </div>
      </div>

      <nav className="glass-card flex-1 p-3 space-y-1">
        {NAV.map(({ to, icon: Icon, key }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-brand text-white shadow-neon-primary"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t(`nav.${key}`)}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {childId && (
        <NavLink
          to={`/child/${childId}`}
          className="btn-gradient w-full justify-center"
        >
          <Baby className="h-5 w-5" />
          {t("nav.child_mode")}
          <Sparkles className="h-4 w-4" />
        </NavLink>
      )}
    </aside>
  );
}
