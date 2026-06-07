export function PostSkeleton() {
  return (
    <div className="bg-surface rounded-[20px] overflow-hidden border border-line animate-pulse">
      <div className="flex items-center gap-3 p-3">
        <div className="w-10 h-10 rounded-full bg-surface-3" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-28 bg-surface-3 rounded-full" />
          <div className="h-2.5 w-20 bg-surface-3 rounded-full" />
        </div>
      </div>
      <div className="aspect-[4/3] bg-surface-3" />
      <div className="px-4 pt-3 pb-4 space-y-2">
        <div className="h-3 w-16 bg-surface-3 rounded-full" />
        <div className="h-2.5 w-48 bg-surface-3 rounded-full" />
      </div>
    </div>
  );
}
