import { Skeleton } from "./shimmer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CardShimmer() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-8 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  )
}

export function DashboardCardsShimmer() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardShimmer key={i} />
      ))}
    </div>
  )
}