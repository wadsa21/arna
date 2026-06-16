import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { RequireAuth, RedirectIfAuth } from "./components/RouteGuards";
import ParentLayout from "./components/layout/ParentLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/parent/Dashboard";
import SchedulePage from "./pages/parent/SchedulePage";
import CardsPage from "./pages/parent/CardsPage";
import BehaviorPage from "./pages/parent/BehaviorPage";
import SubscriptionSettings from "./pages/parent/SubscriptionSettings";
import ChildView from "./pages/child/ChildView";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <Register />
            </RedirectIfAuth>
          }
        />

        {/* Детский режим — отдельный полноэкранный layout без сайдбара */}
        <Route
          path="/child/:childId"
          element={
            <RequireAuth>
              <ChildView />
            </RequireAuth>
          }
        />

        {/* Панель родителя */}
        <Route
          path="/parent"
          element={
            <RequireAuth>
              <ParentLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="behavior" element={<BehaviorPage />} />
        </Route>

        {/* Управление подпиской — переиспользуем layout родителя */}
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <ParentLayout />
            </RequireAuth>
          }
        >
          <Route path="subscription" element={<SubscriptionSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}
