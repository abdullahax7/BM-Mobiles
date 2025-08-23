import { db } from './db'
import { 
  createPartsIndex, 
  indexPart, 
  deletePart,
  IndexedPart,
  isElasticsearchHealthy 
} from './elasticsearch'

export async function indexAllParts() {
  try {
    console.log('Starting full parts indexing...')
    
    // Check if Elasticsearch is available
    const isHealthy = await isElasticsearchHealthy()
    if (!isHealthy) {
      console.warn('Elasticsearch is not available, skipping indexing')
      return { success: false, message: 'Elasticsearch not available' }
    }

    // Create the index
    await createPartsIndex()
    
    // Fetch all parts with their relationships
    const parts = await db.part.findMany({
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

    console.log(`Found ${parts.length} parts to index`)

    let indexed = 0
    let errors = 0

    // Index each part
    for (const part of parts) {
      try {
        const indexedPart = transformPartForIndexing(part)
        await indexPart(indexedPart)
        indexed++
        
        if (indexed % 10 === 0) {
          console.log(`Indexed ${indexed}/${parts.length} parts`)
        }
      } catch (error) {
        console.error(`Error indexing part ${part.id}:`, error)
        errors++
      }
    }

    console.log(`Indexing complete: ${indexed} indexed, ${errors} errors`)
    return { 
      success: true, 
      message: `Successfully indexed ${indexed} parts${errors > 0 ? ` (${errors} errors)` : ''}`
    }
  } catch (error) {
    console.error('Error during full indexing:', error)
    return { success: false, message: 'Indexing failed' }
  }
}

export async function indexSinglePart(partId: string) {
  try {
    const isHealthy = await isElasticsearchHealthy()
    if (!isHealthy) {
      console.warn('Elasticsearch is not available, skipping indexing')
      return
    }

    const part = await db.part.findUnique({
      where: { id: partId },
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

    if (!part) {
      throw new Error('Part not found')
    }

    const indexedPart = transformPartForIndexing(part)
    await indexPart(indexedPart)
    console.log(`Indexed part ${partId}`)
  } catch (error) {
    console.error(`Error indexing part ${partId}:`, error)
    throw error
  }
}

export async function removeSinglePartFromIndex(partId: string) {
  try {
    const isHealthy = await isElasticsearchHealthy()
    if (!isHealthy) {
      console.warn('Elasticsearch is not available, skipping deletion')
      return
    }

    await deletePart(partId)
    console.log(`Removed part ${partId} from index`)
  } catch (error) {
    console.error(`Error removing part ${partId} from index:`, error)
    throw error
  }
}

interface PartWithRelations {
  id: string
  name: string
  description?: string | null
  sku: string
  realCost: number
  sellingPrice: number
  stock: number
  lowStockThreshold: number
  createdAt: Date
  updatedAt: Date
  models: Array<{
    modelId: string
    model: {
      id: string
      slug: string
      name: string
      family: {
        id: string
        slug: string
        name: string
        brand: {
          id: string
          slug: string
          name: string
          platform: {
            id: string
            slug: string
            name: string
          }
        }
      }
    }
  }>
}

function transformPartForIndexing(part: PartWithRelations): IndexedPart {
  const platformSlugs = [...new Set(part.models.map((m) => m.model.family.brand.platform.slug))]
  const brandSlugs = [...new Set(part.models.map((m) => m.model.family.brand.slug))]
  const familySlugs = [...new Set(part.models.map((m) => m.model.family.slug))]
  const modelSlugs = [...new Set(part.models.map((m) => m.model.slug))]

  const platformNames = [...new Set(part.models.map((m) => m.model.family.brand.platform.name))]
  const brandNames = [...new Set(part.models.map((m) => m.model.family.brand.name))]
  const familyNames = [...new Set(part.models.map((m) => m.model.family.name))]
  const modelNames = [...new Set(part.models.map((m) => m.model.name))]

  return {
    id: part.id,
    name: part.name,
    description: part.description ?? undefined,
    sku: part.sku,
    realCost: part.realCost,
    sellingPrice: part.sellingPrice,
    stock: part.stock,
    lowStockThreshold: part.lowStockThreshold,
    isLowStock: part.stock <= part.lowStockThreshold,
    platformSlugs,
    brandSlugs,
    familySlugs,
    modelSlugs,
    platformNames,
    brandNames,
    familyNames,
    modelNames,
    createdAt: part.createdAt.toISOString(),
    updatedAt: part.updatedAt.toISOString()
  }
}

// Webhook helpers for real-time indexing
export async function handlePartCreate(partId: string) {
  try {
    await indexSinglePart(partId)
  } catch (error) {
    console.error('Error in handlePartCreate webhook:', error)
  }
}

export async function handlePartUpdate(partId: string) {
  try {
    await indexSinglePart(partId)
  } catch (error) {
    console.error('Error in handlePartUpdate webhook:', error)
  }
}

export async function handlePartDelete(partId: string) {
  try {
    await removeSinglePartFromIndex(partId)
  } catch (error) {
    console.error('Error in handlePartDelete webhook:', error)
  }
}