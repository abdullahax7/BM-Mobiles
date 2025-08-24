import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear, subDays, subWeeks, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // day, week, month, year
    
    const now = new Date()
    let startDate: Date
    let endDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case 'day':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        previousStartDate = startOfDay(subDays(now, 1))
        previousEndDate = endOfDay(subDays(now, 1))
        break
      case 'week':
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        previousStartDate = startOfWeek(subWeeks(now, 1))
        previousEndDate = endOfWeek(subWeeks(now, 1))
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        previousStartDate = startOfMonth(subMonths(now, 1))
        previousEndDate = endOfMonth(subMonths(now, 1))
        break
      case 'year':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        previousStartDate = startOfYear(subMonths(now, 12))
        previousEndDate = endOfYear(subMonths(now, 12))
        break
      default:
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        previousStartDate = startOfWeek(subWeeks(now, 1))
        previousEndDate = endOfWeek(subWeeks(now, 1))
    }

    // Get current period sales
    const currentSales = await db.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            part: true
          }
        }
      }
    })

    // Get previous period sales for comparison
    const previousSales = await db.sale.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
        },
        status: 'COMPLETED'
      }
    })

    // Calculate metrics
    const currentRevenue = currentSales.reduce((sum, sale) => sum + sale.finalAmount, 0)
    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.finalAmount, 0)
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 100

    const currentCount = currentSales.length
    const previousCount = previousSales.length
    const countChange = previousCount > 0 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : 100

    // Calculate profit (revenue - cost)
    let currentProfit = 0
    let itemsSold = 0
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}

    currentSales.forEach(sale => {
      sale.items.forEach(item => {
        const profit = item.totalPrice - (item.part.realCost * item.quantity)
        currentProfit += profit
        itemsSold += item.quantity

        // Track product sales
        if (!productSales[item.partId]) {
          productSales[item.partId] = {
            name: item.part.name,
            quantity: 0,
            revenue: 0
          }
        }
        productSales[item.partId].quantity += item.quantity
        productSales[item.partId].revenue += item.totalPrice
      })
    })

    // Get top selling products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Calculate average sale value
    const averageSaleValue = currentCount > 0 ? currentRevenue / currentCount : 0

    // Get daily sales for chart
    const dailySales = await db.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count,
        SUM(finalAmount) as revenue
      FROM Sale
      WHERE createdAt >= ${startDate}
        AND createdAt <= ${endDate}
        AND status = 'COMPLETED'
      GROUP BY DATE(createdAt)
      ORDER BY date
    ` as { date: string; count: bigint; revenue: number }[]

    return NextResponse.json({
      summary: {
        revenue: currentRevenue,
        revenueChange,
        salesCount: currentCount,
        salesCountChange: countChange,
        profit: currentProfit,
        profitMargin: currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0,
        averageSaleValue,
        itemsSold
      },
      topProducts,
      dailySales: dailySales.map(day => ({
        date: day.date,
        count: Number(day.count),
        revenue: day.revenue
      })),
      period: {
        current: { start: startDate, end: endDate },
        previous: { start: previousStartDate, end: previousEndDate }
      }
    })
  } catch (error) {
    console.error('Error fetching sales analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
