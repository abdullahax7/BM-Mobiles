'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'

export function PartsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    } else {
      params.delete('q')
    }
    params.delete('page') // Reset to first page when searching
    router.push(`/parts?${params.toString()}`)
  }

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page') // Reset to first page when filtering
    router.push(`/parts?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/parts')
    setSearchQuery('')
  }

  const activeFilters = Array.from(searchParams.entries()).filter(
    ([key, value]) => key !== 'page' && key !== 'q' && value
  )

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts by name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={searchParams.get('lowStock') === 'true' ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('lowStock', 'true')}
        >
          <Filter className="mr-2 h-4 w-4" />
          Low Stock
        </Button>

        {activeFilters.length > 0 && (
          <>
            <div className="flex items-center gap-1 flex-wrap">
              {activeFilters.map(([key, value]) => (
                <Badge key={`${key}-${value}`} variant="secondary">
                  {key}: {value}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter(key, value)}
                  />
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </>
        )}
      </div>
    </div>
  )
}