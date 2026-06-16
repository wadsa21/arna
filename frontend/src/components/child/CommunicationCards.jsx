import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "../../hooks/useSound";

const CARD_GRADIENTS = [
  "from-primary to-secondary",
  "from-accent1 to-accent2",
  "from-accent3 to-accent4",
  "from-secondary to-accent1",
  "from-accent2 to-primary",
];

export default function CommunicationCards({ cards }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const { playTap } = useSound();
  const [spoken, setSpoken] = useState(null);

  const speak = (card) => {
    playTap();
    const text = lang === "kk" ? card.title_kk : card.title_ru;
    setSpoken(card);
    // Голос через SpeechSynthesis (если доступен)
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "kk" ? "kk-KZ" : "ru-RU";
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
    setTimeout(() => setSpoken(null), 1800);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            onClick={() => speak(card)}
            className={`tap-shrink flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br ${
              CARD_GRADIENTS[i % CARD_GRADIENTS.length]
            } p-4 text-white shadow-xl`}
            style={{ boxShadow: "0 10px 32px -8px rgba(99,102,241,0.5)" }}
          >
            <span className="text-5xl drop-shadow-lg sm:text-6xl">
              {card.image ? (
                <img
                  src={card.image}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                card.emoji
              )}
            </span>
            <span className="text-center text-lg font-extrabold leading-tight">
              {lang === "kk" ? card.title_kk : card.title_ru}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Большая анимация выбранной карточки */}
      <AnimatePresence>
        {spoken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => setSpoken(null)}
          >
            <motion.div
              initial={{ scale: 0.3, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: "spring", damping: 14 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="text-[10rem] drop-shadow-2xl">
                {spoken.image ? (
                  <img
                    src={spoken.image}
                    alt=""
                    className="h-48 w-48 rounded-[2rem] object-cover"
                  />
                ) : (
                  spoken.emoji
                )}
              </div>
              <p className="text-5xl font-black gradient-text">
                {lang === "kk" ? spoken.title_kk : spoken.title_ru}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
