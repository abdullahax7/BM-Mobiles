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

const CreatePlatformSchema = z.object({
  name: z.string().min(1, 'Name is required')
})

const UpdatePlatformSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required')
})

export async function GET() {
  try {
    const platforms = await db.platform.findMany({
      orderBy: { name: 'asc' },
      include: {
        brands: {
          include: {
            families: {
              include: {
                models: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(platforms)
  } catch (error) {
    console.error('Error fetching platforms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreatePlatformSchema.parse(body)

    const platform = await db.platform.create({
      data: {
        name: data.name,
        slug: generateSlug(data.name)
      }
    })

    return NextResponse.json(platform, { status: 201 })
  } catch (error) {
    console.error('Error creating platform:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create platform' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const data = UpdatePlatformSchema.parse(body)

    // Ensure exists
    const existing = await db.platform.findUnique({ where: { id: data.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 })
    }

    const updated = await db.platform.update({
      where: { id: data.id },
      data: { name: data.name, slug: generateSlug(data.name) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating platform:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update platform' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const existing = await db.platform.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Platform not found' }, { status: 404 })

    await db.platform.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting platform:', error)
    return NextResponse.json({ error: 'Failed to delete platform' }, { status: 500 })
  }
}
