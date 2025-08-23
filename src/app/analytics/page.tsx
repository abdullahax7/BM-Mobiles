import { Suspense } from 'react'
import { InventoryAnalytics } from '@/components/analytics/inventory-analytics'
import { TransactionAnalytics } from '@/components/analytics/transaction-analytics'
import { ProfitAnalytics } from '@/components/analytics/profit-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Insights and reports for your inventory management
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              Stock levels and inventory health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading inventory analytics...</div>}>
              <InventoryAnalytics />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Trends</CardTitle>
            <CardDescription>
              Stock movement patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading transaction analytics...</div>}>
              <TransactionAnalytics />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profitability</CardTitle>
            <CardDescription>
              Cost analysis and profit margins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading profit analytics...</div>}>
              <ProfitAnalytics />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Parts</CardTitle>
            <CardDescription>
              Most frequently used parts and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading part performance...</div>}>
              <TopPerformingParts />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function TopPerformingParts() {
  // This would be implemented with actual data analysis
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Part performance analytics will be displayed here, showing:
      </p>
      <ul className="text-sm space-y-1 ml-4">
        <li>• Most frequently purchased parts</li>
        <li>• Fastest moving inventory</li>
        <li>• Highest profit margin parts</li>
        <li>• Seasonal trends and patterns</li>
      </ul>
    </div>
  )
}