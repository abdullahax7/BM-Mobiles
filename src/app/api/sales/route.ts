import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const CreateSaleSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE', 'OTHER']),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(z.object({
    partId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive()
  })).min(1, 'At least one item is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateSaleSchema.parse(body)

    // Calculate totals
    const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const finalAmount = totalAmount - (data.discount || 0)

    // Validate stock availability
    for (const item of data.items) {
      const part = await db.part.findUnique({
        where: { id: item.partId }
      })

      if (!part) {
        return NextResponse.json(
          { error: `Part not found: ${item.partId}` },
          { status: 404 }
        )
      }

      if (part.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${part.name}. Available: ${part.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        )
      }
    }

    // Create sale with items and update inventory in a transaction
    const sale = await db.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          totalAmount,
          discount: data.discount || 0,
          finalAmount,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          items: {
            create: data.items.map(item => ({
              partId: item.partId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice
            }))
          }
        },
        include: {
          items: {
            include: {
              part: true
            }
          }
        }
      })

      // Update inventory and create transactions for each item
      for (const item of data.items) {
        // Decrease stock
        await tx.part.update({
          where: { id: item.partId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })

        // Create transaction record
        await tx.transaction.create({
          data: {
            type: 'SALE',
            quantity: item.quantity,
            reason: `Sale #${newSale.id.slice(-8)}`,
            partId: item.partId,
            saleId: newSale.id
          }
        })
      }

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const q = searchParams.get('q') // Search query
    const paymentMethod = searchParams.get('paymentMethod')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    
    const offset = (page - 1) * limit
    
    // Build where clause
    const where: Record<string, unknown> = {}
    
    // Text search across customer fields, sale ID, and parts
    if (q) {
      where.OR = [
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { customerEmail: { contains: q } },
        { notes: { contains: q } },
        { id: { contains: q } },
        { 
          items: {
            some: {
              part: {
                OR: [
                  { name: { contains: q } },
                  { sku: { contains: q } },
                  { description: { contains: q } }
                ]
              }
            }
          }
        }
      ]
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as any).gte = new Date(startDate)
      }
      if (endDate) {
        const endDateObj = new Date(endDate)
        endDateObj.setHours(23, 59, 59, 999)
        ;(where.createdAt as any).lte = endDateObj
      }
    }

    if (status) {
      where.status = status
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      where.finalAmount = {}
      if (minAmount) {
        (where.finalAmount as any).gte = parseFloat(minAmount)
      }
      if (maxAmount) {
        (where.finalAmount as any).lte = parseFloat(maxAmount)
      }
    }

    const [sales, totalCount] = await Promise.all([
      db.sale.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              part: true
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        }
      }),
      db.sale.count({ where })
    ])

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}
