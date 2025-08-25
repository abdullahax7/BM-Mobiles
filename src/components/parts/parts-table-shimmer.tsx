import { TableShimmer } from "@/components/ui/table-shimmer"

export function PartsTableShimmer() {
  return (
    <div className="space-y-4">
      <TableShimmer columns={8} rows={7} />
      
      {/* Pagination shimmer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-8 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}