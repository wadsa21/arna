const TONES = {
  primary: "bg-white text-black border-white",
  secondary: "bg-white/[0.12] text-text-primary border-white/25",
  accent1: "bg-white/[0.12] text-text-primary border-white/25",
  accent2: "bg-white text-black border-white",
  accent3: "bg-white/10 text-text-secondary border-white/20",
  danger: "bg-white text-black border-white",
  muted: "bg-white/5 text-text-secondary border-white/10",
};

export default function Badge({ tone = "muted", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
