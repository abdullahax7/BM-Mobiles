import { notFound } from 'next/navigation'
import { PartForm } from '@/components/parts/part-form'
import { db } from '@/lib/db'

interface PartPageProps {
  params: {
    id: string
  }
}

export default async function PartPage({ params }: PartPageProps) {
  const [part, models] = await Promise.all([
    db.part.findUnique({
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
        }
      }
    }),
    db.model.findMany({
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
      },
      orderBy: [
        { family: { brand: { platform: { name: 'asc' } } } },
        { family: { brand: { name: 'asc' } } },
        { family: { name: 'asc' } },
        { name: 'asc' }
      ]
    })
  ])

  if (!part) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Part</h2>
          <p className="text-muted-foreground">
            Update part information and compatibility
          </p>
        </div>
      </div>

      <PartForm part={part} models={models} />
    </div>
  )
}