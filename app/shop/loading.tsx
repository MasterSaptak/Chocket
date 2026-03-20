export default function Loading() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="w-full md:w-1/2">
            <div className="h-12 bg-muted rounded-xl w-3/4 mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded-lg w-full animate-pulse"></div>
            <div className="h-6 bg-muted rounded-lg w-5/6 mt-2 animate-pulse"></div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="h-10 w-24 bg-muted rounded-full animate-pulse"></div>
            <div className="h-10 w-28 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Categories Pills Skeleton */}
        <div className="flex gap-3 mb-8 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted rounded-full shrink-0 animate-pulse"></div>
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-[2rem] p-4 border border-border shadow-sm">
              <div className="aspect-square rounded-2xl bg-muted mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-1/4 bg-muted rounded animate-pulse"></div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-1/3 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
