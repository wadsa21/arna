import { motion } from "framer-motion";

export default function BigButton({
  emoji,
  label,
  onClick,
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
      className={`relative flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/20 bg-white
                  ${sizes[size]} font-extrabold text-black shadow-2xl
                  ${done ? "opacity-60" : ""}`}
      style={{ boxShadow: "0 16px 48px -28px rgba(255,255,255,0.7)" }}
    >
      <span className="text-6xl drop-shadow-lg sm:text-7xl">{emoji}</span>
      <span className="text-center leading-tight">{label}</span>
      {done && (
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black text-2xl">
          ✅
        </span>
      )}
    </motion.button>
  );
}
