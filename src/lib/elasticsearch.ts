import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
})

export interface IndexedPart {
  id: string
  name: string
  description?: string
  sku: string
  realCost: number
  sellingPrice: number
  stock: number
  lowStockThreshold: number
  isLowStock: boolean
  platformSlugs: string[]
  brandSlugs: string[]
  familySlugs: string[]
  modelSlugs: string[]
  platformNames: string[]
  brandNames: string[]
  familyNames: string[]
  modelNames: string[]
  createdAt: string
  updatedAt: string
}

export const PARTS_INDEX = 'parts'

export async function createPartsIndex() {
  try {
    const exists = await client.indices.exists({ index: PARTS_INDEX })
    
    if (!exists) {
      await client.indices.create({
        index: PARTS_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              sku: { type: 'keyword' },
              realCost: { type: 'float' },
              sellingPrice: { type: 'float' },
              stock: { type: 'integer' },
              lowStockThreshold: { type: 'integer' },
              isLowStock: { type: 'boolean' },
              platformSlugs: { type: 'keyword' },
              brandSlugs: { type: 'keyword' },
              familySlugs: { type: 'keyword' },
              modelSlugs: { type: 'keyword' },
              platformNames: { type: 'text', analyzer: 'standard' },
              brandNames: { type: 'text', analyzer: 'standard' },
              familyNames: { type: 'text', analyzer: 'standard' },
              modelNames: { type: 'text', analyzer: 'standard' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Error creating parts index:', error)
  }
}

export async function indexPart(part: IndexedPart) {
  try {
    await client.index({
      index: PARTS_INDEX,
      id: part.id,
      body: part
    })
    
    await client.indices.refresh({ index: PARTS_INDEX })
  } catch (error) {
    console.error('Error indexing part:', error)
    throw error
  }
}

export async function deletePart(partId: string) {
  try {
    await client.delete({
      index: PARTS_INDEX,
      id: partId
    })
    
    await client.indices.refresh({ index: PARTS_INDEX })
  } catch (error) {
    console.error('Error deleting part from index:', error)
    throw error
  }
}

export interface SearchFilters {
  platformSlugs?: string[]
  brandSlugs?: string[]
  familySlugs?: string[]
  modelSlugs?: string[]
  lowStockOnly?: boolean
  minPrice?: number
  maxPrice?: number
}

type ESRawHit = { _source: IndexedPart; _score?: number }

export async function searchParts(
  query: string = '',
  filters: SearchFilters = {},
  from: number = 0,
  size: number = 20
) {
  try {
    const mustQueries: unknown[] = []
    const filterQueries: unknown[] = []

    if (query.trim()) {
      mustQueries.push({
        multi_match: {
          query: query,
          fields: ['name^3', 'description^2', 'sku^2', 'platformNames', 'brandNames', 'familyNames', 'modelNames'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      })
    }

    if (filters.platformSlugs?.length) {
      filterQueries.push({ terms: { platformSlugs: filters.platformSlugs } })
    }
    
    if (filters.brandSlugs?.length) {
      filterQueries.push({ terms: { brandSlugs: filters.brandSlugs } })
    }
    
    if (filters.familySlugs?.length) {
      filterQueries.push({ terms: { familySlugs: filters.familySlugs } })
    }
    
    if (filters.modelSlugs?.length) {
      filterQueries.push({ terms: { modelSlugs: filters.modelSlugs } })
    }

    if (filters.lowStockOnly) {
      filterQueries.push({ term: { isLowStock: true } })
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceRange: Record<string, number> = {}
      if (filters.minPrice !== undefined) priceRange.gte = filters.minPrice
      if (filters.maxPrice !== undefined) priceRange.lte = filters.maxPrice
      filterQueries.push({ range: { sellingPrice: priceRange } })
    }

    const searchBody: Record<string, unknown> = {
      from,
      size,
      query: {
        bool: {
          must: mustQueries.length ? mustQueries : [{ match_all: {} }],
          filter: filterQueries
        }
      },
      sort: query.trim() ? ['_score', { updatedAt: { order: 'desc' } }] : [{ updatedAt: { order: 'desc' } }]
    }

    const response = await client.search({
      index: PARTS_INDEX,
      body: searchBody
    })

    const body = (response as unknown as { body: { hits: { hits: ESRawHit[]; total: { value: number } }; took: number } }).body

    return {
      hits: body.hits.hits.map((hit) => ({
        ...hit._source,
        _score: hit._score
      })),
      total: body.hits.total.value,
      took: body.took
    }
  } catch (error) {
    console.error('Elasticsearch search error:', error)
    throw error
  }
}

export async function isElasticsearchHealthy(): Promise<boolean> {
  try {
    const health = await client.cluster.health()
    return health.body.status !== 'red'
  } catch {
    return false
  }
}

export { client as elasticsearchClient }