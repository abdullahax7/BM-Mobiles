import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const CreateTransactionSchema = z.object({
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number().int(),
  reason: z.string().optional(),
  partId: z.string().min(1, 'Part ID is required')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const partId = searchParams.get('partId')
    const type = searchParams.get('type')
    
    const offset = (page - 1) * limit
    
    // Build where clause
    const where: Record<string, unknown> = {}
    if (partId) where.partId = partId
    if (type) where.type = type

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

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateTransactionSchema.parse(body)

    // Get current part to validate stock levels
    const part = await db.part.findUnique({
      where: { id: data.partId }
    })

    if (!part) {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      )
    }

    // Calculate new stock level
    let newStock = part.stock
    switch (data.type) {
      case 'IN':
        newStock += Math.abs(data.quantity)
        break
      case 'OUT':
        newStock -= Math.abs(data.quantity)
        break
      case 'ADJUST':
        newStock += data.quantity // Can be positive or negative
        break
    }

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        { error: `Cannot reduce stock below zero. Current stock: ${part.stock}, requested change: ${data.quantity}` },
        { status: 400 }
      )
    }

    // Create transaction and update stock in a transaction
    const [transaction] = await db.$transaction([
      db.transaction.create({
        data: {
          type: data.type,
          quantity: Math.abs(data.quantity),
          reason: data.reason,
          partId: data.partId
        },
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
      db.part.update({
        where: { id: data.partId },
        data: { stock: newStock }
      })
    ])

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}