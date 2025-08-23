import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'

export async function TransactionAnalytics() {
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    weeklyTransactions,
    monthlyTransactions,
    weeklyIn,
    weeklyOut,
    totalTransactions
  ] = await Promise.all([
    db.transaction.count({
      where: {
        createdAt: { gte: last7Days }
      }
    }),
    db.transaction.count({
      where: {
        createdAt: { gte: last30Days }
      }
    }),
    db.transaction.count({
      where: {
        type: 'IN',
        createdAt: { gte: last7Days }
      }
    }),
    db.transaction.count({
      where: {
        type: 'OUT',
        createdAt: { gte: last7Days }
      }
    }),
    db.transaction.count()
  ])

  const weeklyGrowth = totalTransactions > 0 
    ? ((weeklyTransactions / totalTransactions) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-bold">{weeklyTransactions}</p>
          <p className="text-xs text-muted-foreground">This Week</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{monthlyTransactions}</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="default">{weeklyIn}</Badge>
            <Badge variant="destructive">{weeklyOut}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">IN / OUT (7d)</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{weeklyGrowth}%</p>
          <p className="text-xs text-muted-foreground">Weekly Activity</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Activity Breakdown</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Stock Additions</span>
            <span className="text-green-600">{weeklyIn}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Stock Removals</span>
            <span className="text-red-600">{weeklyOut}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Net Change</span>
            <span className={weeklyIn >= weeklyOut ? 'text-green-600' : 'text-red-600'}>
              {weeklyIn >= weeklyOut ? '+' : ''}{weeklyIn - weeklyOut}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}