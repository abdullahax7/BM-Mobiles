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

const CreateModelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  familyId: z.string().min(1, 'Family is required')
})

const UpdateModelSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateModelSchema.parse(body)

    const model = await db.model.create({
      data: {
        name: data.name,
        slug: generateSlug(data.name),
        familyId: data.familyId
      },
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
    })

    return NextResponse.json(model, { status: 201 })
  } catch (error) {
    console.error('Error creating model:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const data = UpdateModelSchema.parse(body)

    const existing = await db.model.findUnique({ where: { id: data.id } })
    if (!existing) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    const updated = await db.model.update({
      where: { id: data.id },
      data: { name: data.name, slug: generateSlug(data.name) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating model:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const existing = await db.model.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    await db.model.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
  }
}
