export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonList({ count = 4, itemClass = "h-20" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={itemClass} />
      ))}
    </div>
  );
}
