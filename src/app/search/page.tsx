import { Suspense } from 'react'
import { SearchInterface } from '@/components/search/search-interface'

interface PageProps {
  searchParams: Promise<{
    q?: string
    platform?: string
    brand?: string
    family?: string
    model?: string
    lowStock?: string
    minPrice?: string
    maxPrice?: string
    page?: string
  }>
}

export default function SearchPage({ searchParams }: PageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Search</h2>
          <p className="text-muted-foreground">
            Advanced search with filters and shortcuts
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading search...</div>}>
        <SearchInterface searchParams={searchParams} />
      </Suspense>
    </div>
  )
}