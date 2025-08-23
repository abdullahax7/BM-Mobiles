import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export async function LowStockAlert() {
  const allParts = await db.part.findMany({
    orderBy: {
      stock: 'asc'
    },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      lowStockThreshold: true
    }
  })

  const lowStockParts = allParts
    .filter(part => part.stock <= part.lowStockThreshold)
    .slice(0, 10)

  if (lowStockParts.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        All parts are well stocked 
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {lowStockParts.map((part) => (
        <div key={part.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <Link 
              href={`/parts/${part.id}`}
              className="text-sm font-medium hover:underline"
            >
              {part.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              SKU: {part.sku}
            </p>
          </div>
          <Badge 
            variant={part.stock === 0 ? "destructive" : "secondary"}
          >
            {part.stock}/{part.lowStockThreshold}
          </Badge>
        </div>
      ))}
    </div>
  )
}