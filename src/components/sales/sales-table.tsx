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
import { Eye, Printer } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DeleteSaleButton } from './delete-sale-button'
import { db } from '@/lib/db'

interface SalesTableProps {
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

export async function SalesTable({ searchParams }: SalesTableProps) {
  const resolvedSearchParams = await searchParams
  
  // Parse search parameters
  const page = parseInt(resolvedSearchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit
  
  // Build where clause for database query
  const where: any = {}
  
  // Text search across customer fields, sale ID, and parts
  if (resolvedSearchParams.q) {
    const q = resolvedSearchParams.q
    where.OR = [
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q, mode: 'insensitive' } },
      { customerEmail: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
      { id: { contains: q, mode: 'insensitive' } },
      { 
        items: {
          some: {
            part: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } }
              ]
            }
          }
        }
      }
    ]
  }
  
  // Date range filter
  if (resolvedSearchParams.startDate || resolvedSearchParams.endDate) {
    where.createdAt = {}
    if (resolvedSearchParams.startDate) {
      where.createdAt.gte = new Date(resolvedSearchParams.startDate)
    }
    if (resolvedSearchParams.endDate) {
      const endDateObj = new Date(resolvedSearchParams.endDate)
      endDateObj.setHours(23, 59, 59, 999)
      where.createdAt.lte = endDateObj
    }
  }

  // Status filter
  if (resolvedSearchParams.status) {
    where.status = resolvedSearchParams.status
  }

  // Payment method filter
  if (resolvedSearchParams.paymentMethod) {
    where.paymentMethod = resolvedSearchParams.paymentMethod
  }

  // Amount range filter
  if (resolvedSearchParams.minAmount || resolvedSearchParams.maxAmount) {
    where.finalAmount = {}
    if (resolvedSearchParams.minAmount) {
      where.finalAmount.gte = parseFloat(resolvedSearchParams.minAmount)
    }
    if (resolvedSearchParams.maxAmount) {
      where.finalAmount.lte = parseFloat(resolvedSearchParams.maxAmount)
    }
  }

  // Fetch data directly from database
  const [sales, totalCount] = await Promise.all([
    db.sale.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    }),
    db.sale.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>
      case 'REFUNDED':
        return <Badge variant="destructive">Refunded</Badge>
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Badge variant="outline">Cash</Badge>
      case 'CARD':
        return <Badge variant="outline">Card</Badge>
      case 'ONLINE':
        return <Badge variant="outline">Online</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No sales found.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono">
                    #{sale.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div>
                      {sale.customerName || 'Walk-in Customer'}
                      {sale.customerPhone && (
                        <div className="text-sm text-muted-foreground">
                          {sale.customerPhone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {sale._count.items} {sale._count.items === 1 ? 'item' : 'items'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">PKR {sale.finalAmount.toFixed(2)}</div>
                      {sale.discount > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="line-through">PKR {sale.totalAmount.toFixed(2)}</span>
                          <span className="text-red-600 ml-1">-PKR {sale.discount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodBadge(sale.paymentMethod)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(sale.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/sales/${sale.id}`}>
                        <Button variant="ghost" size="sm" title="View details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/sales/${sale.id}`}>
                        <Button variant="ghost" size="sm" title="Print receipt">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteSaleButton id={sale.id} />
                    </div>
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
            Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} sales
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const linkParams = new URLSearchParams(Object.entries(resolvedSearchParams).filter(([, value]) => value != null) as [string, string][])
              linkParams.set('page', pageNum.toString())
              return (
                <Link key={pageNum} href={`/sales?${linkParams.toString()}`}>
                  <Button
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
