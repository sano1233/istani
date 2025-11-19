export default function DashboardLoading() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-48 bg-white/10 rounded-lg mb-2"></div>
          <div className="h-6 w-64 bg-white/5 rounded-lg"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="h-4 w-20 bg-white/10 rounded"></div>
                <div className="h-8 w-8 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-8 w-16 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-24 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="bg-white/5 rounded-2xl p-6 animate-pulse">
          <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
