export default function Loading() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        
        {/* Breadcrumbs Skeleton */}
        <div className="h-4 w-48 bg-muted rounded animate-pulse mb-8"></div>

        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          
          {/* Image Gallery Skeleton */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-square rounded-[2rem] bg-muted animate-pulse"></div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-24 aspect-square rounded-xl bg-muted shrink-0 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
              </div>
            </div>

            <div className="h-12 w-3/4 bg-muted rounded-xl animate-pulse mb-4"></div>
            <div className="h-12 w-1/2 bg-muted rounded-xl animate-pulse mb-6"></div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            </div>

            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-border">
              <div className="h-10 w-32 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-6 w-20 bg-muted rounded animate-pulse mb-1"></div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Add to Cart Actions Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="w-full sm:w-32 h-14 bg-muted rounded-full animate-pulse"></div>
              <div className="flex-1 h-14 bg-muted rounded-full animate-pulse"></div>
            </div>

            {/* Features Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
