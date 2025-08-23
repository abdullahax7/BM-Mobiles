import { NextRequest, NextResponse } from 'next/server'
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const part = await db.part.findUnique({
      where: { id: params.id },
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = UpdatePartSchema.parse(body)

    // Check if part exists
    const existingPart = await db.part.findUnique({
      where: { id: params.id }
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
      where: { id: params.id },
      data: updateData
    })

    // Update model relationships if provided
    if (data.modelIds !== undefined) {
      // Delete existing relationships
      await db.partModel.deleteMany({
        where: { partId: params.id }
      })

      // Create new relationships
      if (data.modelIds.length > 0) {
        await db.partModel.createMany({
          data: data.modelIds.map(modelId => ({
            partId: params.id,
            modelId
          }))
        })
      }
    }

    // Fetch the updated part with relationships
    const updatedPart = await db.part.findUnique({
      where: { id: params.id },
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if part exists
    const existingPart = await db.part.findUnique({
      where: { id: params.id }
    })

    if (!existingPart) {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      )
    }

    // Delete the part (relationships will be deleted due to cascade)
    await db.part.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Part deleted successfully' })
  } catch (error) {
    console.error('Error deleting part:', error)
    return NextResponse.json(
      { error: 'Failed to delete part' },
      { status: 500 }
    )
  }
}