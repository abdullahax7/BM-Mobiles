import { POSInterface } from '@/components/sales/pos-interface'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewSalePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Point of Sale</h2>
          <p className="text-muted-foreground">
            Create a new sale transaction
          </p>
        </div>
        <Link href="/sales">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
          </Button>
        </Link>
      </div>

      <POSInterface />
    </div>
  )
}
