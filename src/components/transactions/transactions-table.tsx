import { db } from '@/lib/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface TransactionsTableProps {
  searchParams: {
    page?: string
    partId?: string
    type?: string
  }
}

export async function TransactionsTable({ searchParams }: TransactionsTableProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Build where clause
  const where: Record<string, unknown> = {}
  if (searchParams.partId) where.partId = searchParams.partId
  if (searchParams.type) where.type = searchParams.type

  const [transactions, totalCount] = await Promise.all([
    db.transaction.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        part: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    }),
    db.transaction.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  const getVariantForType = (type: string) => {
    switch (type) {
      case 'IN': return 'default'
      case 'OUT': return 'destructive'
      case 'ADJUST': return 'secondary'
      default: return 'outline'
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'IN': return '+'
      case 'OUT': return '-'
      case 'ADJUST': return '±'
      default: return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Part</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Time Ago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <Link
                        href={`/parts/${transaction.part.id}`}
                        className="font-medium hover:underline"
                      >
                        {transaction.part.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        SKU: {transaction.part.sku}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getVariantForType(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">
                        {getIconForType(transaction.type)}{transaction.quantity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.reason ? (
                      <span className="text-sm">{transaction.reason}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No reason provided
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} transactions
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link key={pageNum} href={`/transactions?page=${pageNum}`}>
                <Button
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}