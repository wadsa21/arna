const COMMON_EMOJIS = [
  "☀️", "🌙", "🪥", "🥣", "🍎", "🍲", "🥤", "💧", "🧩", "📚",
  "✏️", "🎨", "🎵", "🧸", "⚽", "🚲", "🌳", "🏠", "🚽", "🛁",
  "😴", "😄", "😢", "😨", "😡", "🤗", "👏", "💤", "🦖", "⭐",
  "🚗", "✈️", "🎮", "🧼", "🦷", "👕", "🐶", "🐱", "🌈", "🎈",
];

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto rounded-2xl border border-white/10 bg-surface2/40 p-3">
      {COMMON_EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-all tap-shrink ${
            value === e
              ? "bg-gradient-brand scale-110 shadow-neon-primary"
              : "hover:bg-white/10"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
