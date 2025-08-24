import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context
  const resolvedParams = await params
  
  try {
    // Get the sale with items to restore stock
    const sale = await db.sale.findUnique({
      where: { id: resolvedParams.id },
      include: {
        items: true
      }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      )
    }

    // Delete sale and restore stock in a transaction
    await db.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of sale.items) {
        await tx.part.update({
          where: { id: item.partId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }

      // Delete associated transactions
      await tx.transaction.deleteMany({
        where: { saleId: resolvedParams.id }
      })

      // Delete the sale (this will cascade delete sale items)
      await tx.sale.delete({
        where: { id: resolvedParams.id }
      })
    })

    return NextResponse.json({ message: 'Sale deleted successfully' })
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json(
      { error: 'Failed to delete sale' },
      { status: 500 }
    )
  }
}
