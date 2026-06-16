import { motion } from "framer-motion";

/**
 * Прогресс-бар использования лимита.
 * < 70% — зелёный, 70–90% — янтарный, > 90% — красный.
 * limit === null означает безлимит.
 */
export default function UsageMeter({ label, used, limit, icon }) {
  const unlimited = limit == null;
  const pct = unlimited ? 0 : Math.min(Math.round((used / limit) * 100), 100);
  const color =
    pct > 90 ? "from-accent4 to-accent4" : pct >= 70 ? "from-accent3 to-accent3" : "from-accent2 to-accent1";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-text-secondary">
          {icon} {label}
        </span>
        <span className="font-bold text-text-primary">
          {used}
          {unlimited ? " / ∞" : ` / ${limit}`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: unlimited ? "100%" : `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={unlimited ? { opacity: 0.25 } : undefined}
        />
      </div>
    </div>
  );
}
