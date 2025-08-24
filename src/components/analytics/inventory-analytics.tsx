import { db } from '@/lib/db'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export async function InventoryAnalytics() {
  const [
    totalParts,
    lowStockParts,
    outOfStockParts,
    totalValue,
    averageStockLevel
  ] = await Promise.all([
    db.part.count(),
    db.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*) as count FROM Part WHERE stock <= lowStockThreshold`.then((result) => Number(result[0]?.count ?? 0)),
    db.part.count({ where: { stock: 0 } }),
    db.part.aggregate({
      _sum: {
        sellingPrice: true
      }
    }),
    db.part.aggregate({
      _avg: {
        stock: true
      }
    })
  ])

  const healthScore = Math.max(0, 100 - (lowStockParts / totalParts) * 100 - (outOfStockParts / totalParts) * 50)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Inventory Health</span>
          <span className="text-sm text-muted-foreground">{Math.round(healthScore)}%</span>
        </div>
        <Progress value={healthScore} className="w-full" />
        {healthScore < 70 && (
          <p className="text-xs text-destructive">
            Action needed: {lowStockParts} parts are low stock, {outOfStockParts} are out of stock
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-bold">{totalParts}</p>
          <p className="text-xs text-muted-foreground">Total Parts</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">PKR {(totalValue._sum.sellingPrice || 0).toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{Math.round(averageStockLevel._avg.stock || 0)}</p>
          <p className="text-xs text-muted-foreground">Avg Stock</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={outOfStockParts > 0 ? "destructive" : "secondary"}>
              {outOfStockParts}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
      </div>
    </div>
  )
}