import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

export async function RecentTransactions() {
  const transactions = await db.transaction.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10,
    include: {
      part: {
        select: {
          name: true,
          sku: true
        }
      }
    }
  })

  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        No recent transactions
      </div>
    )
  }

  const getVariantForType = (type: string) => {
    switch (type) {
      case 'IN': return 'default'
      case 'OUT': return 'destructive'  
      case 'ADJUST': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {transaction.part.name}
            </p>
            <p className="text-xs text-muted-foreground">
              SKU: {transaction.part.sku}
            </p>
            {transaction.reason && (
              <p className="text-xs text-muted-foreground">
                {transaction.reason}
              </p>
            )}
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={getVariantForType(transaction.type)}>
                {transaction.type}
              </Badge>
              <span className="text-sm font-medium">
                {transaction.type === 'OUT' ? '-' : '+'}
                {transaction.quantity}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}