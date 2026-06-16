import { motion } from "framer-motion";

/**
 * Огромная тактильная кнопка для детского интерфейса.
 * Минимум 120×120px, яркая, с анимацией нажатия.
 */
export default function BigButton({
  emoji,
  label,
  onClick,
  gradient = "from-primary to-secondary",
  size = "md",
  done = false,
}) {
  const sizes = {
    md: "min-h-[120px] min-w-[120px] p-5 text-xl",
    lg: "min-h-[160px] p-7 text-2xl",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.04 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br ${gradient}
                  ${sizes[size]} font-extrabold text-white shadow-2xl
                  ${done ? "opacity-60" : ""}`}
      style={{ boxShadow: "0 12px 40px -8px rgba(99,102,241,0.6)" }}
    >
      <span className="text-6xl drop-shadow-lg sm:text-7xl">{emoji}</span>
      <span className="text-center leading-tight">{label}</span>
      {done && (
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-2xl">
          ✅
        </span>
      )}
    </motion.button>
  );
}
