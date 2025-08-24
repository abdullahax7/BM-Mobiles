'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, Filter, Calendar } from 'lucide-react'

export function SalesFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    } else {
      params.delete('q')
    }
    params.delete('page') // Reset to first page
    router.push(`/sales?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    router.push(`/sales?${params.toString()}`)
  }

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page
    router.push(`/sales?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    router.push('/sales')
  }

  // Get current filter values
  const currentStatus = searchParams.get('status')
  const currentPaymentMethod = searchParams.get('paymentMethod')
  const currentStartDate = searchParams.get('startDate')
  const currentEndDate = searchParams.get('endDate')
  const currentMinAmount = searchParams.get('minAmount')
  const currentMaxAmount = searchParams.get('maxAmount')
  const currentQuery = searchParams.get('q')

  // Check if any filters are active
  const hasActiveFilters = !!(currentQuery || currentStatus || currentPaymentMethod || 
    currentStartDate || currentEndDate || currentMinAmount || currentMaxAmount)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search & Filters
        </CardTitle>
        <CardDescription>
          Search sales by customer name, phone, email, sale ID, or part names/SKU
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by customer name, phone, email, sale ID, part name/SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={currentStatus || 'all'}
              onValueChange={(value) => updateFilter('status', value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select
              value={currentPaymentMethod || 'all'}
              onValueChange={(value) => updateFilter('paymentMethod', value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Start Date
            </label>
            <Input
              type="date"
              value={currentStartDate || ''}
              onChange={(e) => updateFilter('startDate', e.target.value || null)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              End Date
            </label>
            <Input
              type="date"
              value={currentEndDate || ''}
              onChange={(e) => updateFilter('endDate', e.target.value || null)}
            />
          </div>
        </div>

        {/* Amount Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Amount (PKR)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={currentMinAmount || ''}
              onChange={(e) => updateFilter('minAmount', e.target.value || null)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Amount (PKR)</label>
            <Input
              type="number"
              placeholder="999999.99"
              value={currentMaxAmount || ''}
              onChange={(e) => updateFilter('maxAmount', e.target.value || null)}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            {currentQuery && (
              <Badge variant="secondary">
                Search: {currentQuery}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => updateFilter('q', null)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {currentStatus && (
              <Badge variant="secondary">
                Status: {currentStatus}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => updateFilter('status', null)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {currentPaymentMethod && (
              <Badge variant="secondary">
                Payment: {currentPaymentMethod}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => updateFilter('paymentMethod', null)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {(currentStartDate || currentEndDate) && (
              <Badge variant="secondary">
                Date: {currentStartDate || '...'} to {currentEndDate || '...'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => {
                    updateFilter('startDate', null)
                    updateFilter('endDate', null)
                  }}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {(currentMinAmount || currentMaxAmount) && (
              <Badge variant="secondary">
                Amount: PKR {currentMinAmount || '0'} - {currentMaxAmount || '∞'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => {
                    updateFilter('minAmount', null)
                    updateFilter('maxAmount', null)
                  }}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="ml-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}