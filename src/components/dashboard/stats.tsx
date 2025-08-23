import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'

export async function DashboardStats() {
  const [
    totalParts,
    lowStockCount,
    totalValue,
    recentTransactions
  ] = await Promise.all([
    db.part.count(),
    db.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*) as count FROM Part WHERE stock <= lowStockThreshold`.then((result) => Number(result[0]?.count ?? 0)),
    db.part.aggregate({
      _sum: {
        sellingPrice: true
      }
    }),
    db.transaction.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const stats = [
    {
      title: 'Total Parts',
      value: totalParts,
      icon: Package,
      description: 'Active parts in inventory'
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      icon: AlertTriangle,
      description: 'Parts requiring attention',
      variant: lowStockCount > 0 ? 'destructive' : 'default'
    },
    {
      title: 'Inventory Value',
      value: `$${(totalValue._sum.sellingPrice || 0).toFixed(2)}`,
      icon: DollarSign,
      description: 'Total estimated value'
    },
    {
      title: 'Weekly Transactions',
      value: recentTransactions,
      icon: TrendingUp,
      description: 'Last 7 days activity'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}