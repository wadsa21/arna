export function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-2xl border border-white/10 bg-surface2/50 px-4 py-3 text-text-primary hover:border-white/20
                    placeholder:text-text-secondary/60 outline-none transition-all
                    focus:border-primary/70 focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_8px_24px_-12px_rgba(99,102,241,0.5)] ${className}`}
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
        className={`w-full rounded-2xl border border-white/10 bg-surface2/50 px-4 py-3 text-text-primary hover:border-white/20
                    placeholder:text-text-secondary/60 outline-none transition-all resize-none
                    focus:border-primary/70 focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_8px_24px_-12px_rgba(99,102,241,0.5)] ${className}`}
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
        className={`w-full rounded-2xl border border-white/10 bg-surface2/50 px-4 py-3 text-text-primary hover:border-white/20
                    outline-none transition-all focus:border-primary/70 focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_8px_24px_-12px_rgba(99,102,241,0.5)] ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
