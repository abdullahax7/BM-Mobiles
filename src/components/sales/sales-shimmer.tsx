import { TableShimmer } from "@/components/ui/table-shimmer"
import { Skeleton } from "@/components/ui/shimmer"
import { Card, CardContent } from "@/components/ui/card"

export function SalesTableShimmer() {
  return (
    <div className="space-y-4">
      <TableShimmer columns={7} rows={6} />
      
      {/* Pagination shimmer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SalesFiltersShimmer() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {/* Search shimmer */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Date range shimmers */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Payment method shimmer */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Amount range shimmers */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
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