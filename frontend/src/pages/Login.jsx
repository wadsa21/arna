import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";

import AnimatedBackground from "../components/ui/AnimatedBackground";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import { Input } from "../components/ui/Input";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form.email, form.password);
      setAuth({ user: data.user, access: data.access, refresh: data.refresh });
      const dest = location.state?.from?.pathname || "/parent/dashboard";
      navigate(dest, { replace: true });
    } catch {
      toast.error(t("auth.login_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground />
      <div className="absolute right-5 top-5">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card neon-glow w-full max-w-md p-8"
      >
        <Link to="/" className="mb-6 flex justify-center">
          <Logo size={52} />
        </Link>
        <h1 className="mb-1 text-center text-2xl font-bold">
          {t("auth.welcome_back")}
        </h1>
        <p className="mb-7 text-center text-sm text-text-secondary">
          {t("landing.tagline")}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-[42px] h-5 w-5 text-text-secondary" />
            <Input
              label={t("auth.email")}
              type="email"
              required
              className="pl-12"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="parent@arna.kz"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-[42px] h-5 w-5 text-text-secondary" />
            <Input
              label={t("auth.password")}
              type="password"
              required
              className="pl-12"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            {t("common.login")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {t("auth.no_account")}{" "}
          <Link to="/register" className="font-semibold text-text-primary hover:underline">
            {t("common.register")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
