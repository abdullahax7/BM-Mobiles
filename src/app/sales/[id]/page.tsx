import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { PrintButton } from '@/components/sales/print-button'

interface SalePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SalePage({ params }: SalePageProps) {
  const resolvedParams = await params
  
  const sale = await db.sale.findUnique({
    where: { id: resolvedParams.id },
    include: {
      items: {
        include: {
          part: true
        }
      }
    }
  })

  if (!sale) {
    notFound()
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sale Details</h2>
          <p className="text-muted-foreground">
            Sale #{sale.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link href="/sales">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sales
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sale Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(sale.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <Badge variant="outline">{sale.paymentMethod}</Badge>
            </div>
            {sale.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1 text-sm">{sale.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{sale.customerName || 'Walk-in Customer'}</span>
            </div>
            {sale.customerPhone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
            {sale.customerEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{sale.customerEmail}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sale.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.part.name}</div>
                  <div className="text-sm text-muted-foreground">
                    SKU: {item.part.sku} | Quantity: {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">PKR {item.totalPrice.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    PKR {item.unitPrice.toFixed(2)} × {item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>PKR {sale.totalAmount.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span className="text-red-600">-PKR {sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>PKR {sale.finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt for printing (hidden on screen) */}
      <div className="hidden print:block">
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold">Mobile Repair Shop</h1>
        </div>
        <div className="mb-3 text-sm">
          <p>Sale #{sale.id.slice(-8).toUpperCase()}</p>
          <p>Date: {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}</p>
          <p>Customer: {sale.customerName || 'Walk-in Customer'}</p>
          {sale.customerPhone && <p>Phone: {sale.customerPhone}</p>}
        </div>
        <div className="border-t border-b py-2 mb-2">
          {sale.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.part.name} x{item.quantity}</span>
              <span>PKR {item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="text-sm">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>PKR {sale.finalAmount.toFixed(2)}</span>
          </div>
          <p className="mt-1">Payment: {sale.paymentMethod}</p>
        </div>
        <div className="text-center mt-3 text-sm">
          <p>Thank you!</p>
        </div>
      </div>
    </div>
  )
}
