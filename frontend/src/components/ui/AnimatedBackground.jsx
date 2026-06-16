/** Премиальный анимированный фон: парящие цветные орбы + лёгкая сетка. */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Тонкая перспективная сетка */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
        }}
      />

      {/* Цветные орбы */}
      <div className="blob bg-primary w-[44rem] h-[44rem] -top-48 -left-40 animate-blob" />
      <div
        className="blob bg-accent1 w-[34rem] h-[34rem] top-1/4 -right-44 animate-blob"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="blob bg-secondary w-[40rem] h-[40rem] -bottom-48 left-1/4 animate-blob"
        style={{ animationDelay: "6s" }}
      />
      <div
        className="blob bg-accent2 w-[26rem] h-[26rem] top-1/3 left-1/2 animate-blob opacity-30"
        style={{ animationDelay: "9s" }}
      />

      {/* Виньетка для фокуса на контенте */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent 60%, rgba(8,8,18,0.6) 100%)",
        }}
      />
    </div>
  );
}
