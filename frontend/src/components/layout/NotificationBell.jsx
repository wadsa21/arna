import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { notificationsApi } from "../../services/api";
import { toList } from "../../hooks/useChildren";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => toList((await notificationsApi.list()).data),
    refetchInterval: 60000,
  });

  const items = data ?? [];
  const unread = items.filter((n) => !n.is_read).length;

  const readMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readAllMutation = useMutation({
    mutationFn: () =>
      Promise.all(
        items.filter((n) => !n.is_read).map((n) => notificationsApi.markRead(n.id))
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const onItemClick = (n) => {
    if (!n.is_read) readMutation.mutate(n.id);
  };

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
            className="glass-card absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto p-3"
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-sm font-bold text-text-secondary">Уведомления</p>
              {unread > 0 && (
                <button
                  onClick={() => readAllMutation.mutate()}
                  className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Прочитать все
                </button>
              )}
            </div>
            {items.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-text-secondary">
                Пока тихо
              </p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => onItemClick(n)}
                className={`mb-1.5 block w-full rounded-2xl p-3 text-left transition-colors ${
                  n.is_read
                    ? "bg-white/5"
                    : "border border-white/25 bg-white/10 hover:bg-white/15"
                }`}
              >
                <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                <p className="text-xs text-text-secondary">{n.body}</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
