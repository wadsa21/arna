const TONES = {
  primary: "bg-primary/15 text-primary border-primary/30",
  secondary: "bg-secondary/15 text-secondary border-secondary/30",
  accent1: "bg-accent1/15 text-accent1 border-accent1/30",
  accent2: "bg-accent2/15 text-accent2 border-accent2/30",
  accent3: "bg-accent3/15 text-accent3 border-accent3/30",
  danger: "bg-accent4/15 text-accent4 border-accent4/30",
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
