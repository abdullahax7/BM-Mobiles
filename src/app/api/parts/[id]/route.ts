import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const UpdatePartSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  realCost: z.number().min(0, 'Real cost must be non-negative').optional(),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative').optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative').optional(),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold must be non-negative').optional(),
  modelIds: z.array(z.string()).optional()
})

type PartUpdateData = Partial<{ name: string; description?: string; sku: string; realCost: number; sellingPrice: number; stock: number; lowStockThreshold: number }>

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context
  const resolvedParams = await params
  try {
    const part = await db.part.findUnique({
      where: { id: resolvedParams.id },
      include: {
        models: {
          include: {
            model: {
              include: {
                family: {
                  include: {
                    brand: {
                      include: {
                        platform: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    })

    if (!part) {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(part)
  } catch (error) {
    console.error('Error fetching part:', error)
    return NextResponse.json(
      { error: 'Failed to fetch part' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context
  const resolvedParams = await params
  try {
    const body = await request.json()
    const data = UpdatePartSchema.parse(body)

    // Check if part exists
    const existingPart = await db.part.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingPart) {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      )
    }

  // Update part
    const updateData: PartUpdateData = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.sku !== undefined) updateData.sku = data.sku
    if (data.realCost !== undefined) updateData.realCost = data.realCost
    if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.lowStockThreshold !== undefined) updateData.lowStockThreshold = data.lowStockThreshold

    await db.part.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    // Update model relationships if provided
    if (data.modelIds !== undefined) {
      // Delete existing relationships
      await db.partModel.deleteMany({
        where: { partId: resolvedParams.id }
      })

      // Create new relationships
      if (data.modelIds.length > 0) {
        await db.partModel.createMany({
          data: data.modelIds.map(modelId => ({
            partId: resolvedParams.id,
            modelId
          }))
        })
      }
    }

    // Fetch the updated part with relationships
    const updatedPart = await db.part.findUnique({
      where: { id: resolvedParams.id },
      include: {
        models: {
          include: {
            model: {
              include: {
                family: {
                  include: {
                    brand: {
                      include: {
                        platform: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedPart)
  } catch (error) {
    console.error('Error updating part:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update part' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context
  const resolvedParams = await params
  try {
    // Check if part exists with sales relationships
    const existingPart = await db.part.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            saleItems: true
          }
        }
      }
    })

    if (!existingPart) {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      )
    }

    // Check if part has been sold or has transaction history
    if (existingPart._count.saleItems > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete part', 
          details: `This part has been used in ${existingPart._count.saleItems} sale(s). Parts with sales history cannot be deleted to maintain data integrity.` 
        },
        { status: 400 }
      )
    }


    // Delete the part (relationships will be deleted due to cascade)
    await db.part.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Part deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting part:', error)
    
    // Handle Prisma foreign key constraint error
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Cannot delete part',
          details: 'This part is being used in sales records and cannot be deleted.'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete part' },
      { status: 500 }
    )
  }
}
