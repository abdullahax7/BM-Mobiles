import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export async function RecentSales() {
  const sales = await db.sale.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10,
    include: {
      items: {
        include: {
          part: {
            select: {
              name: true,
              sku: true
            }
          }
        }
      }
    }
  })

  if (sales.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        No recent sales
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>
      case 'REFUNDED':
        return <Badge variant="destructive">Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <Link href={`/sales/${sale.id}`} key={sale.id}>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {sale.customerName || 'Walk-in Customer'}
              </p>
              <p className="text-xs text-muted-foreground">
                Sale #{sale.id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                {getStatusBadge(sale.status)}
              </div>
              <p className="text-sm font-medium">
                PKR {sale.finalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
