/** Декоративные blob-частицы на фоне (CSS-анимация). */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="blob bg-primary w-[40rem] h-[40rem] -top-40 -left-40 animate-blob" />
      <div
        className="blob bg-accent1 w-[32rem] h-[32rem] top-1/3 -right-40 animate-blob"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="blob bg-secondary w-[36rem] h-[36rem] -bottom-40 left-1/4 animate-blob"
        style={{ animationDelay: "6s" }}
      />
    </div>
  );
}
