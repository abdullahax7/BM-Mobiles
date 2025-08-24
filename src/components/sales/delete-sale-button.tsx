'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteSaleButtonProps {
  id: string
}

export function DeleteSaleButton({ id }: DeleteSaleButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (loading) return
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this sale? This will restore the stock quantities but cannot be undone.'
    )
    
    if (!confirmed) return

    try {
      setLoading(true)
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sale')
      }

      router.refresh()
      alert('Sale deleted successfully')
    } catch (error) {
      console.error('Error deleting sale:', error)
      alert((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete} 
      disabled={loading}
      title="Delete sale"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
