import { db } from '@/lib/db'

export async function ProfitAnalytics() {
  const [
    parts
  ] = await Promise.all([
    db.part.findMany({
      select: {
        realCost: true,
        sellingPrice: true,
        stock: true
      }
    })
  ])

  const totalInvestedCost = parts.reduce((sum, part) => sum + (part.realCost * part.stock), 0)
  const totalPotentialRevenue = parts.reduce((sum, part) => sum + (part.sellingPrice * part.stock), 0)
  const potentialProfit = totalPotentialRevenue - totalInvestedCost
  const profitMargin = totalPotentialRevenue > 0 
    ? ((potentialProfit / totalPotentialRevenue) * 100).toFixed(1)
    : '0'

  const averageMarkup = parts.length > 0
    ? parts.reduce((sum, part) => {
        const markup = part.realCost > 0 ? ((part.sellingPrice - part.realCost) / part.realCost) * 100 : 0
        return sum + markup
      }, 0) / parts.length
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-green-600">PKR {potentialProfit.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Potential Profit</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{profitMargin}%</p>
          <p className="text-xs text-muted-foreground">Profit Margin</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Investment Breakdown</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Invested Cost</span>
            <span className="text-red-600">PKR {totalInvestedCost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Potential Revenue</span>
            <span className="text-green-600">PKR {totalPotentialRevenue.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Avg Markup</span>
            <span className="font-medium">{averageMarkup.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          This analysis assumes all current stock will be sold at listed prices. 
          Actual profits will vary based on sales volume and market conditions.
        </p>
      </div>
    </div>
  )
}