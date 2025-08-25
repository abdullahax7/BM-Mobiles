import { Skeleton } from "@/components/ui/shimmer"
import { Card, CardContent } from "@/components/ui/card"

export function PartsFiltersShimmer() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search shimmer */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Platform shimmer */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Brand shimmer */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Additional filters shimmer */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}