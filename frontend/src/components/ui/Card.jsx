import { motion } from "framer-motion";

export default function Card({
  className = "",
  hover = false,
  glow = false,
  gradientBorder = false,
  children,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hover
          ? { y: -5, transition: { duration: 0.25, ease: "easeOut" } }
          : undefined
      }
      className={`glass-card p-5 ${glow ? "neon-glow" : ""} ${
        gradientBorder ? "gradient-border" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
