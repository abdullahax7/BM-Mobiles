import { Suspense } from 'react'
import { PartsTable } from '@/components/parts/parts-table'
import { PartsFilters } from '@/components/parts/parts-filters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: {
    q?: string
    page?: string
    platform?: string
    brand?: string
    family?: string
    model?: string
    lowStock?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default function PartsPage({ searchParams }: PageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parts</h2>
          <p className="text-muted-foreground">
            Manage your repair parts inventory
          </p>
        </div>
        <Link href="/parts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Part
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<div>Loading filters...</div>}>
          <PartsFilters />
        </Suspense>
        
        <Suspense fallback={<div>Loading parts...</div>}>
          <PartsTable searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}