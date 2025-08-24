import { Suspense } from 'react'
import { SalesTable } from '@/components/sales/sales-table'
import { SalesFilters } from '@/components/sales/sales-filters'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    page?: string
    q?: string
    startDate?: string
    endDate?: string
    status?: string
    paymentMethod?: string
    minAmount?: string
    maxAmount?: string
  }>
}

export default function SalesPage({ searchParams }: PageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
          <p className="text-muted-foreground">
            View and manage sales transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/sales/analytics">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/sales/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>

      <SalesFilters />
      
      <Suspense fallback={<div>Loading sales...</div>}>
        <SalesTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
