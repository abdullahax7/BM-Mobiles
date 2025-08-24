'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Activity } from 'lucide-react'
import Link from 'next/link'

interface Analytics {
  summary: {
    revenue: number
    revenueChange: number
    salesCount: number
    salesCountChange: number
    profit: number
    profitMargin: number
    averageSaleValue: number
    itemsSold: number
  }
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  dailySales: Array<{
    date: string
    count: number
    revenue: number
  }>
}

export default function SalesAnalyticsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/sales/analytics?period=${period}`)
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
        </div>
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center py-8">Failed to load analytics</div>
      </div>
    )
  }

  const formatCurrency = (value: number) => `PKR ${value.toFixed(2)}`
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground">
            Track your sales performance and trends
          </p>
        </div>
        <Link href="/sales">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
          </Button>
        </Link>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Button
          variant={period === 'day' ? 'default' : 'outline'}
          onClick={() => setPeriod('day')}
        >
          Today
        </Button>
        <Button
          variant={period === 'week' ? 'default' : 'outline'}
          onClick={() => setPeriod('week')}
        >
          This Week
        </Button>
        <Button
          variant={period === 'month' ? 'default' : 'outline'}
          onClick={() => setPeriod('month')}
        >
          This Month
        </Button>
        <Button
          variant={period === 'year' ? 'default' : 'outline'}
          onClick={() => setPeriod('year')}
        >
          This Year
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.summary.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={analytics.summary.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(analytics.summary.revenueChange)}
              </span>
              {' '}from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Count</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.salesCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className={analytics.summary.salesCountChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(analytics.summary.salesCountChange)}
              </span>
              {' '}from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.summary.profit)}</div>
            <p className="text-xs text-muted-foreground">
              Margin: {analytics.summary.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.summary.averageSaleValue)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.itemsSold} items sold
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <div>
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.quantity} sold
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Sales Chart (simplified) */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.dailySales.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm">{day.date}</div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{day.count} sales</span>
                    <span className="text-sm font-medium">{formatCurrency(day.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
