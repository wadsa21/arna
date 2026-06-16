import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`glass-card relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6`}
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-text-primary">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
