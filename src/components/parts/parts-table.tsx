import { db } from '@/lib/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { DeletePartButton } from '@/components/parts/delete-part-button'

interface PartsTableProps {
  searchParams: {
    q?: string
    page?: string
    platform?: string
    brand?: string
    family?: string
    model?: string
    lowStock?: string
    minPrice?: string
    maxPrice?: string
  }
}

export async function PartsTable({ searchParams }: PartsTableProps) {
  const resolvedSearchParams = await searchParams
  const page = parseInt(resolvedSearchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Build where clause
  const where: Record<string, unknown> = {}
  
  if (resolvedSearchParams.q) {
    where.OR = [
      { name: { contains: resolvedSearchParams.q } },
      { description: { contains: resolvedSearchParams.q } },
      { sku: { contains: resolvedSearchParams.q } }
    ]
  }

  // Note: Low stock filter will be handled post-query due to SQLite limitations

  if (resolvedSearchParams.minPrice || resolvedSearchParams.maxPrice) {
    const priceFilter: { gte?: number; lte?: number } = {}
    if (resolvedSearchParams.minPrice) {
      priceFilter.gte = parseFloat(resolvedSearchParams.minPrice)
    }
    if (resolvedSearchParams.maxPrice) {
      priceFilter.lte = parseFloat(resolvedSearchParams.maxPrice)
    }
    ;(where as Record<string, unknown>).sellingPrice = priceFilter
  }

  // Add model filters through relations
  if (resolvedSearchParams.platform || resolvedSearchParams.brand || resolvedSearchParams.family || resolvedSearchParams.model) {
    where.models = {
      some: {
        model: {
          ...(resolvedSearchParams.model && { slug: resolvedSearchParams.model }),
          family: {
            ...(resolvedSearchParams.family && { slug: resolvedSearchParams.family }),
            brand: {
              ...(resolvedSearchParams.brand && { slug: resolvedSearchParams.brand }),
              platform: {
                ...(resolvedSearchParams.platform && { slug: resolvedSearchParams.platform })
              }
            }
          }
        }
      }
    }
  }

  const [initialParts, totalCount] = await Promise.all([
    db.part.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { updatedAt: 'desc' },
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
        _count: {
          select: {
            transactions: true
          }
        }
      }
    }),
    db.part.count({ where })
  ])

  let parts = initialParts

  // Apply low stock filter if needed
  if (resolvedSearchParams.lowStock === 'true') {
    parts = parts.filter(part => part.stock <= part.lowStockThreshold)
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Compatible Models</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No parts found.
                </TableCell>
              </TableRow>
            ) : (
              parts.map((part) => {
                const isLowStock = part.stock <= part.lowStockThreshold
                const isOutOfStock = part.stock === 0
                
                return (
                  <TableRow key={part.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{part.name}</div>
                        {part.description && (
                          <div className="text-sm text-muted-foreground">
                            {part.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{part.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {part.stock}
                        <span className="text-muted-foreground text-sm">
                          /{part.lowStockThreshold}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>PKR {part.realCost.toFixed(2)}</TableCell>
                    <TableCell>PKR {part.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {part.models.slice(0, 3).map((partModel) => (
                          <Badge key={partModel.modelId} variant="secondary" className="text-xs">
                            {partModel.model.name}
                          </Badge>
                        ))}
                        {part.models.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{part.models.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isOutOfStock
                            ? "destructive"
                            : isLowStock
                            ? "secondary"
                            : "default"
                        }
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : isLowStock
                          ? "Low Stock"
                          : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/parts/${part.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeletePartButton id={part.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} parts
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link key={pageNum} href={`/parts?page=${pageNum}`}>
                <Button
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}