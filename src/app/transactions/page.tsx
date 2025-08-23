import { Suspense } from 'react'
import { TransactionsTable } from '@/components/transactions/transactions-table'
import { NewTransactionDialog } from '@/components/transactions/new-transaction-dialog'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PageProps {
  searchParams: {
    page?: string
    partId?: string
    type?: string
  }
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  // Fetch all parts for the dropdown
  const parts = await db.part.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            Track all inventory movements and stock changes
          </p>
        </div>
        <NewTransactionDialog parts={parts}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </NewTransactionDialog>
      </div>

      <Suspense fallback={<div>Loading transactions...</div>}>
        <TransactionsTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}