import { motion } from "framer-motion";

export default function Card({
  className = "",
  hover = false,
  glow = false,
  children,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={`glass-card p-5 ${glow ? "neon-glow" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
