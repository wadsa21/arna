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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-card rounded-t-3xl rounded-b-none border-b-0 px-2 py-2">
      <div className="flex justify-around">
        {NAV.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-all ${
                isActive ? "text-primary" : "text-text-secondary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-6 w-6 ${isActive ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : ""}`}
                />
                {t(`nav.${key}`)}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
