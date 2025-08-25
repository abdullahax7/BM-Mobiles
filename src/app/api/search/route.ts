import { NextRequest, NextResponse } from 'next/server'
import { searchParts, isElasticsearchHealthy, SearchFilters } from '@/lib/elasticsearch'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const platform = searchParams.get('platform')
    const brand = searchParams.get('brand')
    const family = searchParams.get('family')
    const model = searchParams.get('model')
    const lowStockOnly = searchParams.get('lowStock') === 'true'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const from = parseInt(searchParams.get('from') || '0')
    const size = parseInt(searchParams.get('size') || '20')

    // Build filters
    const filters: SearchFilters = {}
    if (platform) filters.platformSlugs = [platform]
    if (brand) filters.brandSlugs = [brand]
    if (family) filters.familySlugs = [family]
    if (model) filters.modelSlugs = [model]
    if (lowStockOnly) filters.lowStockOnly = true
    if (minPrice) filters.minPrice = parseFloat(minPrice)
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice)

    // Try Elasticsearch first
    const isESHealthy = await isElasticsearchHealthy()
    
    if (isESHealthy) {
      try {
        const esResults = await searchParts(query, filters, from, size)
        
        return NextResponse.json({
          hits: esResults.hits,
          total: esResults.total,
          took: esResults.took,
          usingElasticsearch: true
        })
      } catch (esError) {
        console.warn('Elasticsearch search failed, falling back to database:', esError)
      }
    }

    // Fallback to database search
    const dbResults = await searchWithDatabase(query, filters, from, size)
    
    return NextResponse.json({
      hits: dbResults.hits,
      total: dbResults.total,
      took: dbResults.took,
      usingElasticsearch: false
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function searchWithDatabase(
  query: string,
  filters: SearchFilters,
  from: number = 0,
  size: number = 20
) {
  const startTime = Date.now()
  
  // Build where clause for database search with proper Prisma typing
  const where: Prisma.PartWhereInput = {}
  
  if (query.trim()) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { sku: { contains: query, mode: 'insensitive' } }
    ]
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceFilter: { gte?: number; lte?: number } = {}
    if (filters.minPrice !== undefined) priceFilter.gte = filters.minPrice
    if (filters.maxPrice !== undefined) priceFilter.lte = filters.maxPrice
    ;(where as Record<string, unknown>).sellingPrice = priceFilter
  }

  // Handle hierarchy filters through relations
  if (filters.platformSlugs?.length || filters.brandSlugs?.length || 
      filters.familySlugs?.length || filters.modelSlugs?.length) {
    where.models = {
      some: {
        model: {
          ...(filters.modelSlugs?.length && { slug: { in: filters.modelSlugs } }),
          family: {
            ...(filters.familySlugs?.length && { slug: { in: filters.familySlugs } }),
            brand: {
              ...(filters.brandSlugs?.length && { slug: { in: filters.brandSlugs } }),
              platform: {
                ...(filters.platformSlugs?.length && { slug: { in: filters.platformSlugs } })
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
      skip: from,
      take: size,
      orderBy: query.trim() ? [{ name: 'asc' }] : [{ updatedAt: 'desc' }],
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
    }),
    db.part.count({ where })
  ])

  // Apply low stock filter if needed (post-query due to SQLite limitations)
  let filteredParts = parts
  if (filters.lowStockOnly) {
    filteredParts = parts.filter(part => part.stock <= part.lowStockThreshold)
  }

  // Transform to match Elasticsearch format
  const hits = filteredParts.map(part => ({
    id: part.id,
    name: part.name,
    description: part.description,
    sku: part.sku,
    realCost: part.realCost,
    sellingPrice: part.sellingPrice,
    stock: part.stock,
    lowStockThreshold: part.lowStockThreshold,
    isLowStock: part.stock <= part.lowStockThreshold,
    platformNames: [...new Set(part.models.map(m => m.model.family.brand.platform.name))],
    brandNames: [...new Set(part.models.map(m => m.model.family.brand.name))],
    familyNames: [...new Set(part.models.map(m => m.model.family.name))],
    modelNames: [...new Set(part.models.map(m => m.model.name))]
  }))

  const took = Date.now() - startTime

  return {
    hits,
    total: filters.lowStockOnly ? filteredParts.length : totalCount,
    took
  }
}