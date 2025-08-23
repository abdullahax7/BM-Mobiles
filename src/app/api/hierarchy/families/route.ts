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

const CreateFamilySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required')
})

const UpdateFamilySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateFamilySchema.parse(body)

    const family = await db.family.create({
      data: {
        name: data.name,
        slug: generateSlug(data.name),
        brandId: data.brandId
      },
      include: {
        brand: {
          include: {
            platform: true
          }
        }
      }
    })

    return NextResponse.json(family, { status: 201 })
  } catch (error) {
    console.error('Error creating family:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const data = UpdateFamilySchema.parse(body)

    const existing = await db.family.findUnique({ where: { id: data.id } })
    if (!existing) return NextResponse.json({ error: 'Family not found' }, { status: 404 })

    const updated = await db.family.update({
      where: { id: data.id },
      data: { name: data.name, slug: generateSlug(data.name) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating family:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update family' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const existing = await db.family.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Family not found' }, { status: 404 })

    await db.family.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting family:', error)
    return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 })
  }
}
