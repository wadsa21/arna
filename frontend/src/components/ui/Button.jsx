import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  gradient: "btn-gradient",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-text-primary border border-white/10 hover:bg-white/5 transition-colors",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-primary border border-primary/50 hover:bg-primary/10 transition-colors",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white bg-accent4 hover:bg-accent4/90 transition-colors",
  soft:
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors",
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
