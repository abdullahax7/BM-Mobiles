'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Zap } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  name: string
  description?: string
  sku: string
  realCost: number
  sellingPrice: number
  stock: number
  lowStockThreshold: number
  isLowStock: boolean
  platformNames: string[]
  brandNames: string[]
  familyNames: string[]
  modelNames: string[]
  _score?: number
}

interface SearchResponse {
  hits: SearchResult[]
  total: number
  took: number
  usingElasticsearch?: boolean
}

interface SearchInterfaceProps {
  searchParams: {
    q?: string
    platform?: string
    brand?: string
    family?: string
    model?: string
    lowStock?: string
    minPrice?: string
    maxPrice?: string
    page?: string
  }
}

export function SearchInterface({ searchParams }: SearchInterfaceProps) {
  const router = useRouter()
  const sp = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const performSearch = async (query: string = searchQuery) => {
    setIsLoading(true)
    
    try {
      // Build params from the current URL so quick shortcuts work reliably
      const params = new URLSearchParams(sp.toString())
      if (query.trim()) {
        params.set('q', query.trim())
      } else {
        params.delete('q')
      }

      const response = await fetch(`/api/search?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        console.error('Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Run search whenever URL params change (including quick shortcuts)
    performSearch(sp.get('q') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(sp.toString())
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    } else {
      params.delete('q')
    }
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Search</CardTitle>
          <CardDescription>
            Search parts by name, description, SKU, or compatibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Shortcuts
          </CardTitle>
          <CardDescription>
            Common filter combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery('')
              router.push('/search?lowStock=true')
            }}>
              Low Stock Parts
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery('')
              router.push('/search?platform=android')
            }}>
              Android Parts
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery('')
              router.push('/search?platform=ios')
            }}>
              iOS Parts
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery('')
              router.push('/search?brand=samsung')
            }}>
              Samsung Parts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Search Results
                {results.total > 0 && ` (${results.total})`}
              </CardTitle>
              <div className="flex items-center gap-2">
                {results.usingElasticsearch !== false && (
                  <Badge variant="secondary">
                    <Zap className="mr-1 h-3 w-3" />
                    Elasticsearch
                  </Badge>
                )}
                <Badge variant="outline">
                  {results.took}ms
                </Badge>
              </div>
            </div>
            <CardDescription>
              Found {results.total} parts matching your search
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.hits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No parts found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.hits.map((part) => (
                  <div key={part.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div>
                          <Link
                            href={`/parts/${part.id}`}
                            className="text-lg font-semibold hover:underline"
                          >
                            {part.name}
                          </Link>
                          {part._score && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Score: {part._score.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        
                        {part.description && (
                          <p className="text-sm text-muted-foreground">
                            {part.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">SKU: {part.sku}</Badge>
                          <Badge variant="outline">Stock: {part.stock}</Badge>
                          {part.isLowStock && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>

                        {/* Compatibility */}
                        <div className="flex flex-wrap gap-1">
                          {part.platformNames.map(platform => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                          {part.brandNames.map(brand => (
                            <Badge key={brand} variant="outline" className="text-xs">
                              {brand}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          ${part.sellingPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Cost: ${part.realCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}