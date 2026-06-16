import { useTranslation } from "react-i18next";

export default function Logo({ size = 40, showWord = true, className = "" }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-2xl"
        style={{
          width: size,
          height: size,
          background: "#F5F5F5",
          boxShadow: "0 18px 36px -28px rgba(255,255,255,0.75), inset 0 0 0 1px rgba(0,0,0,0.08)",
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
            stroke="black"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.95"
          />
        </svg>
      </span>
      {showWord && (
        <span className="text-xl font-extrabold gradient-text">
          {t("brand")}
        </span>
      )}
    </span>
  );
}
