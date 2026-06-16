import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

/**
 * Подключается к WebSocket Django Channels и показывает реалтайм-уведомления.
 * Используется в layout родителя.
 */
export function useNotificationsSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!accessToken) return;

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${window.location.host}/ws/notifications/?token=${accessToken}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    let pingTimer;
    ws.onopen = () => {
      pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN)
          ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "notification") {
          const n = msg.data;
          toast.success(`${n.title}\n${n.body}`, { duration: 6000, icon: "🎉" });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      } catch {
        /* игнорируем некорректные сообщения */
      }
    };

    ws.onclose = () => clearInterval(pingTimer);

    return () => {
      clearInterval(pingTimer);
      ws.close();
    };
  }, [accessToken, queryClient]);

  return wsRef;
}
