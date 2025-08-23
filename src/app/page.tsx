import { Suspense } from 'react'
import { DashboardStats } from '@/components/dashboard/stats'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest inventory movements
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<div>Loading transactions...</div>}>
              <RecentTransactions />
            </Suspense>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
            <CardDescription>
              Parts running low on inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading alerts...</div>}>
              <LowStockAlert />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
