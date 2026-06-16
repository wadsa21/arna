export function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-text-primary hover:border-white/25
                    placeholder:text-text-secondary/60 outline-none transition-all
                    focus:border-white/70 focus:ring-4 focus:ring-white/10 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_12px_36px_-24px_rgba(255,255,255,0.5)] ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </span>
      )}
      <textarea
        rows={3}
        className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-text-primary hover:border-white/25
                    placeholder:text-text-secondary/60 outline-none transition-all resize-none
                    focus:border-white/70 focus:ring-4 focus:ring-white/10 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_12px_36px_-24px_rgba(255,255,255,0.5)] ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </span>
      )}
      <select
        className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-text-primary hover:border-white/25
                    outline-none transition-all focus:border-white/70 focus:ring-4 focus:ring-white/10 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_12px_36px_-24px_rgba(255,255,255,0.5)] ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
