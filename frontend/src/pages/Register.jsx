import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import AnimatedBackground from "../components/ui/AnimatedBackground";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Регистрируется всегда родитель/опекун: он заводит профили
      // детей и открывает им детский режим (/child/:id).
      await authApi.register({
        ...form,
        role: "PARENT",
        language: i18n.resolvedLanguage,
      });
      // авто-логин после регистрации
      const { data } = await authApi.login(form.email, form.password);
      setAuth({ user: data.user, access: data.access, refresh: data.refresh });
      toast.success(t("toast.created"));
      navigate("/parent/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data && typeof err.response.data === "object"
          ? Object.values(err.response.data).flat()[0]
          : t("auth.register_error");
      toast.error(msg || t("auth.register_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
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
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="text-4xl">🌈</span>
          <span className="text-3xl font-extrabold gradient-text">
            {t("brand")}
          </span>
        </Link>
        <h1 className="mb-7 text-center text-2xl font-bold">
          {t("auth.create_account")}
        </h1>

        <form onSubmit={submit} className="space-y-4">
          <Input
            label={t("auth.full_name")}
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            label={t("auth.email")}
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label={t("auth.password")}
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Button type="submit" loading={loading} className="w-full">
            {t("common.register")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {t("auth.have_account")}{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t("common.login")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
