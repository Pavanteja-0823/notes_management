/**
 * Loading skeleton components for better perceived performance
 */

function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
    />
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      {/* Title */}
      <SkeletonBlock className="h-4 w-3/4" />
      {/* Content lines */}
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
        <SkeletonBlock className="h-3 w-4/6" />
      </div>
      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <SkeletonBlock className="h-5 w-12 rounded-md" />
        <SkeletonBlock className="h-5 w-16 rounded-md" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
        <SkeletonBlock className="h-3 w-16" />
        <div className="flex gap-1">
          <SkeletonBlock className="h-6 w-6 rounded-lg" />
          <SkeletonBlock className="h-6 w-6 rounded-lg" />
          <SkeletonBlock className="h-6 w-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton({ viewMode = 'grid' }) {
  const skeletons =
    viewMode === 'grid'
      ? Array.from({ length: 8 })
      : Array.from({ length: 4 });

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'flex flex-col gap-3'
      }
    >
      {skeletons.map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock className="w-5 h-5 rounded-lg" />
          <SkeletonBlock className="h-4 flex-1" />
        </div>
      ))}
      <div className="pt-3">
        <SkeletonBlock className="h-px w-full" />
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="w-4 h-4 rounded-lg" />
            <SkeletonBlock className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <SkeletonBlock className="w-10 h-10 rounded-xl" />
            <div>
              <SkeletonBlock className="h-5 w-40 mb-1" />
              <SkeletonBlock className="h-3 w-56" />
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-10 w-full rounded-lg" />
            <SkeletonBlock className="h-10 w-full rounded-lg" />
            <SkeletonBlock className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
