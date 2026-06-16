import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "kk", label: "ҚАЗ" },
  { code: "ru", label: "РУС" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/10 bg-black/40 p-1 ${className}`}
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
            current === code
              ? "bg-white text-black"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
