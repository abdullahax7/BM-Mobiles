import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const CreateBrandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  platformId: z.string().min(1, 'Platform is required')
})

const UpdateBrandSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platformId = searchParams.get('platformId')

    const where = platformId ? { platformId } : {}

    const brands = await db.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        platform: true,
        families: {
          include: {
            models: true
          }
        }
      }
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateBrandSchema.parse(body)

    const brand = await db.brand.create({
      data: {
        name: data.name,
        slug: generateSlug(data.name),
        platformId: data.platformId
      },
      include: {
        platform: true
      }
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    
    if (error instanceof z.ZodError) {
      const details = error.issues
      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const data = UpdateBrandSchema.parse(body)

    const existing = await db.brand.findUnique({ where: { id: data.id } })
    if (!existing) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const updated = await db.brand.update({
      where: { id: data.id },
      data: { name: data.name, slug: generateSlug(data.name) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating brand:', error)
    if (error instanceof z.ZodError) {
      const details = error.issues
      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const existing = await db.brand.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    await db.brand.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
