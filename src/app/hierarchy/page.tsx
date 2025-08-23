import { HierarchyManager } from '@/components/hierarchy/hierarchy-manager'
import { db } from '@/lib/db'

export default async function HierarchyPage() {
  const platforms = await db.platform.findMany({
    orderBy: { name: 'asc' },
    include: {
      brands: {
        orderBy: { name: 'asc' },
        include: {
          families: {
            orderBy: { name: 'asc' },
            include: {
              models: {
                orderBy: { name: 'asc' }
              }
            }
          }
        }
      }
    }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hierarchy Management</h2>
          <p className="text-muted-foreground">
            Manage platforms, brands, families, and models
          </p>
        </div>
      </div>

      <HierarchyManager initialPlatforms={platforms} />
    </div>
  )
}