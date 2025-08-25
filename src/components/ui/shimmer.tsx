import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string
  children?: React.ReactNode
}

export function Shimmer({ className, children }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    >
      {children}
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-muted via-muted/30 to-muted bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  )
}