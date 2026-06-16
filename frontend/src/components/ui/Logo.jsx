import { useTranslation } from "react-i18next";

/**
 * Фирменный знак «Арна» — волна-сигнал (канал связи) в градиентном тайле.
 * Заменяет эмодзи-логотип. size — сторона тайла в px.
 */
export default function Logo({ size = 40, showWord = true, className = "" }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-2xl"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#06B6D4 100%)",
          boxShadow: "0 6px 20px -6px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width={size * 0.62}
          height={size * 0.62}
          fill="none"
          aria-hidden
        >
          <path
            d="M10 40 Q26 8 32 32 Q38 56 54 24"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.95"
          />
        </svg>
      </span>
      {showWord && (
        <span className="text-xl font-extrabold gradient-text tracking-tight">
          {t("brand")}
        </span>
      )}
    </span>
  );
}
