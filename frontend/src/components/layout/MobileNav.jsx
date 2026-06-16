import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquareHeart,
  NotebookPen,
} from "lucide-react";

const NAV = [
  { to: "/parent/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { to: "/parent/schedule", icon: CalendarDays, key: "schedule" },
  { to: "/parent/cards", icon: MessageSquareHeart, key: "cards" },
  { to: "/parent/behavior", icon: NotebookPen, key: "behavior" },
];

export default function MobileNav() {
  const { t } = useTranslation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-b-none rounded-t-3xl border-b-0 px-2 py-2 lg:hidden glass-card">
      <div className="flex justify-around">
        {NAV.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-all ${
                isActive ? "bg-white text-black" : "text-text-secondary"
              }`
            }
          >
            <Icon className="h-6 w-6" />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
