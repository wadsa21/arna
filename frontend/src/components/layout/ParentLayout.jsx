import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";
import AnimatedBackground from "../ui/AnimatedBackground";
import { useChildren } from "../../hooks/useChildren";
import { useNotificationsSocket } from "../../hooks/useNotificationsSocket";

export default function ParentLayout() {
  const { children, selectedChildId } = useChildren();
  const location = useLocation();
  useNotificationsSocket(); // реалтайм-уведомления через WebSocket

  return (
    <div className="min-h-screen flex">
      <AnimatedBackground />
      <Sidebar childId={selectedChildId} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header children={children} selectedChildId={selectedChildId} />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 px-4 pb-24 pt-2 lg:px-6 lg:pb-8"
        >
          <Outlet />
        </motion.main>
      </div>
      <MobileNav />
    </div>
  );
}
