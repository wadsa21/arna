import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  MessageSquareHeart,
  CalendarDays,
  NotebookPen,
  Zap,
  ArrowRight,
  Building2,
  BarChart3,
  Cable,
  Mail,
} from "lucide-react";

import AnimatedBackground from "../components/ui/AnimatedBackground";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";

const DEMO_CARDS = ["💧", "🍎", "😄", "🧸", "🏠", "🚽"];
const DEMO_SCHEDULE = [
  { e: "☀️", t: "Подъём" },
  { e: "🥣", t: "Завтрак" },
  { e: "📚", t: "Занятие" },
  { e: "🌳", t: "Прогулка" },
];

const TONE_CLASS = {
  primary: "bg-primary/15 text-primary",
  accent1: "bg-accent1/15 text-accent1",
  accent2: "bg-accent2/15 text-accent2",
  accent3: "bg-accent3/15 text-accent3",
};

function Feature({ icon: Icon, title, desc, tone, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="glass-card p-6"
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${TONE_CLASS[tone]}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mb-1.5 text-lg font-bold">{title}</h3>
      <p className="text-sm text-text-secondary">{desc}</p>
    </motion.div>
  );
}

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      {/* Nav */}
      <header className="flex items-center justify-between px-5 py-5 lg:px-12">
        <Logo size={42} />
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="hidden text-sm font-semibold text-text-secondary hover:text-text-primary sm:block"
          >
            {t("billing.pricing_nav")}
          </Link>
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="ghost" className="!px-4 !py-2">
              {t("common.login")}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-12 lg:grid-cols-2 lg:px-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Мягкое свечение за заголовком */}
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-[100px]" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm">
            <Zap className="h-4 w-4" /> {t("landing.made_with")}
          </span>
          <h1 className="relative mt-5 text-5xl font-black leading-[1.05] text-balance lg:text-7xl">
            <span className="gradient-text">{t("landing.tagline")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-text-secondary">
            {t("landing.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register">
              <Button className="text-base">
                {t("landing.cta_start")} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="text-base">
                {t("landing.cta_login")}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Demo mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="glass-card neon-glow p-6">
            <p className="mb-3 text-sm font-bold text-text-secondary">
              {t("landing.demo_title")}
            </p>
            {/* Mini schedule */}
            <div className="mb-5 space-y-2">
              {DEMO_SCHEDULE.map((it, i) => (
                <motion.div
                  key={it.t}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  className="flex items-center gap-3 rounded-2xl bg-surface2/60 p-3"
                >
                  <span className="text-2xl">{it.e}</span>
                  <span className="font-semibold">{it.t}</span>
                  {i === 0 && (
                    <span className="ml-auto rounded-full bg-accent2/20 px-3 py-1 text-xs font-bold text-accent2">
                      ✓
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Mini cards */}
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CARDS.map((e, i) => (
                <motion.div
                  key={e}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-surface2 to-surface text-3xl"
                  style={{
                    boxShadow:
                      i % 2 === 0
                        ? "0 0 20px -6px rgba(99,102,241,0.5)"
                        : "0 0 20px -6px rgba(6,182,212,0.5)",
                  }}
                >
                  {e}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={MessageSquareHeart}
            tone="primary"
            title={t("landing.feature_cards_title")}
            desc={t("landing.feature_cards_desc")}
            delay={0}
          />
          <Feature
            icon={CalendarDays}
            tone="accent1"
            title={t("landing.feature_schedule_title")}
            desc={t("landing.feature_schedule_desc")}
            delay={0.1}
          />
          <Feature
            icon={NotebookPen}
            tone="accent2"
            title={t("landing.feature_behavior_title")}
            desc={t("landing.feature_behavior_desc")}
            delay={0.2}
          />
          <Feature
            icon={Zap}
            tone="accent3"
            title={t("landing.feature_realtime_title")}
            desc={t("landing.feature_realtime_desc")}
            delay={0.3}
          />
        </div>
      </section>

      {/* B2B / Enterprise секция */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card relative overflow-hidden p-8 lg:p-12"
        >
          <div className="animated-gradient-bg absolute inset-0 -z-10 opacity-10" />
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent3/30 bg-accent3/10 px-4 py-1.5 text-sm font-semibold text-accent3">
                <Building2 className="h-4 w-4" /> Enterprise
              </span>
              <h2 className="mt-4 text-3xl font-black text-balance lg:text-4xl">
                <span className="gradient-text">{t("billing.b2b_title")}</span>
              </h2>
              <p className="mt-4 max-w-md text-text-secondary">
                {t("billing.b2b_subtitle")}
              </p>
              <a href="mailto:b2b@arna.kz?subject=Enterprise%20Арна" className="btn-gradient mt-6 inline-flex">
                <Mail className="h-5 w-5" /> {t("billing.b2b_cta")}
              </a>
            </div>
            <div className="space-y-4">
              {[
                { icon: BarChart3, title: t("billing.b2b_1_title"), desc: t("billing.b2b_1_desc") },
                { icon: Building2, title: t("billing.b2b_2_title"), desc: t("billing.b2b_2_desc") },
                { icon: Cable, title: t("billing.b2b_3_title"), desc: t("billing.b2b_3_desc") },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 rounded-2xl bg-surface2/50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="text-sm text-text-secondary">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="flex flex-col items-center gap-3 py-10 text-center text-sm text-text-secondary">
        <Logo size={32} />
        <span>{t("landing.made_with")}</span>
      </footer>
    </div>
  );
}
