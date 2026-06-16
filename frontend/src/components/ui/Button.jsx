import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200";

const VARIANTS = {
  gradient: "btn-gradient",
  ghost:
    `${BASE} px-6 py-3 text-text-primary border border-white/10 bg-white/[0.04] hover:bg-white/10 hover:border-white/25`,
  outline:
    `${BASE} px-6 py-3 text-text-primary border border-white/25 bg-transparent hover:bg-white hover:text-black hover:border-white`,
  danger:
    `${BASE} px-6 py-3 text-black bg-white hover:bg-text-primary hover:-translate-y-0.5`,
  soft:
    `${BASE} px-4 py-2 font-medium text-text-secondary hover:text-text-primary hover:bg-white/10`,
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
