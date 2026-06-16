import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { notificationsApi } from "../../services/api";
import { toList } from "../../hooks/useChildren";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => toList((await notificationsApi.list()).data),
    refetchInterval: 60000,
  });

  const items = data ?? [];
  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-2xl border border-white/10 bg-black/40 p-2.5 transition-colors hover:bg-white/10"
      >
        <Bell className="h-5 w-5 text-text-primary" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card absolute right-0 z-50 mt-2 w-80 max-h-96 overflow-y-auto p-3"
          >
            <p className="mb-2 px-2 text-sm font-bold text-text-secondary">
              Уведомления
            </p>
            {items.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-text-secondary">
                Пока тихо
              </p>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className={`rounded-2xl p-3 mb-1.5 ${
                  n.is_read ? "bg-white/5" : "border border-white/25 bg-white/10"
                }`}
              >
                <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                <p className="text-xs text-text-secondary">{n.body}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
