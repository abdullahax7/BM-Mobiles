"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeletePartButtonProps {
  id: string
  onDeleted?: () => void
}

export function DeletePartButton({ id, onDeleted }: DeletePartButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (loading) return
    const ok = window.confirm("Delete this part? This cannot be undone.")
    if (!ok) return
    try {
      setLoading(true)
      const res = await fetch(`/api/parts/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const errorMessage = body.details ? `${body.error}: ${body.details}` : (body.error || `Failed to delete part ${id}`)
        throw new Error(errorMessage)
      }
      onDeleted?.()
      router.refresh()
    } catch (err) {
      console.error('Delete part error:', err)
      const message = (err as Error).message
      if (message.includes('sale(s)') || message.includes('transaction')) {
        alert(`Cannot delete part: ${message}\n\nParts with sales or transaction history cannot be deleted to maintain data integrity.`)
      } else {
        alert(`Failed to delete part: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading} aria-label="Delete part">
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
