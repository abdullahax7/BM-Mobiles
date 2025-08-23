import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const CreatePartSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  realCost: z.number().min(0, 'Real cost must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold must be non-negative'),
  modelIds: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const query = searchParams.get('q')
    const platform = searchParams.get('platform')
    const brand = searchParams.get('brand')
    const family = searchParams.get('family')
    const model = searchParams.get('model')
    const lowStockOnly = searchParams.get('lowStock') === 'true'
    
    const offset = (page - 1) * limit
    
    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { sku: { contains: query } }
      ]
    }

    if (platform || brand || family || model) {
      where.models = {
        some: {
          model: {
            ...(model && { slug: model }),
            family: {
              ...(family && { slug: family }),
              brand: {
                ...(brand && { slug: brand }),
                platform: {
                  ...(platform && { slug: platform })
                }
              }
            }
          }
        }
      }
    }

    const [parts, totalCount] = await Promise.all([
      db.part.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { updatedAt: 'desc' },
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
          _count: {
            select: {
              transactions: true
            }
          }
        }
      }),
      db.part.count({ where })
    ])

    // Apply low stock filter if needed
    let filteredParts = parts
    if (lowStockOnly) {
      filteredParts = parts.filter(part => part.stock <= part.lowStockThreshold)
    }

    return NextResponse.json({
      parts: filteredParts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching parts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreatePartSchema.parse(body)

    const part = await db.part.create({
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        realCost: data.realCost,
        sellingPrice: data.sellingPrice,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
      }
    })

    // Create model relationships if provided
    if (data.modelIds && data.modelIds.length > 0) {
      await db.partModel.createMany({
        data: data.modelIds.map(modelId => ({
          partId: part.id,
          modelId
        }))
      })
    }

    // Fetch the complete part with relationships
    const completePart = await db.part.findUnique({
      where: { id: part.id },
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

    return NextResponse.json(completePart, { status: 201 })
  } catch (error) {
    console.error('Error creating part:', error)
    
    if (error instanceof z.ZodError) {
      const details = (error as any).errors ?? (error as any).issues ?? []
      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create part' },
      { status: 500 }
    )
  }
}