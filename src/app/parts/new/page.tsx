import { PartForm } from '@/components/parts/part-form'
import { db } from '@/lib/db'

export default async function NewPartPage() {
  // Fetch all models for the dropdown
  const models = await db.model.findMany({
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Part</h2>
          <p className="text-muted-foreground">
            Create a new part for your inventory
          </p>
        </div>
      </div>

      <PartForm models={models} />
    </div>
  )
}