import { Suspense } from 'react'
import { db } from '@/lib/db'
import { POSInterface } from '@/components/pos/pos-interface'

export default async function POSPage() {
  // Fetch all parts for the POS system
  const parts = await db.part.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      sellingPrice: true,
      stock: true,
      lowStockThreshold: true
    },
    orderBy: { name: 'asc' },
    where: {
      stock: {
        gt: 0 // Only show parts with stock available
      }
    }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Point of Sale</h2>
          <p className="text-muted-foreground">
            Select components, calculate total, and process sales
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading POS interface...</div>}>
        <POSInterface parts={parts} />
      </Suspense>
    </div>
  )
}