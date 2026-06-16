import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200";

const VARIANTS = {
  gradient: "btn-gradient",
  ghost:
    `${BASE} px-6 py-3 text-text-primary border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20`,
  outline:
    `${BASE} px-6 py-3 text-primary border border-primary/40 bg-primary/5 hover:bg-primary/15 hover:border-primary/70 hover:shadow-neon-primary`,
  danger:
    `${BASE} px-6 py-3 text-white bg-gradient-to-r from-accent4 to-rose-500 hover:shadow-[0_10px_28px_-8px_rgba(239,68,68,0.7)] hover:-translate-y-0.5`,
  soft:
    `${BASE} px-4 py-2 font-medium text-text-secondary hover:text-text-primary hover:bg-white/5`,
};

export default function Button({
  variant = "gradient",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${VARIANTS[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
