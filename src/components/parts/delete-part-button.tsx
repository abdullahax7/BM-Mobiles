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
        throw new Error(body.error || `Failed to delete part ${id}`)
      }
      onDeleted?.()
      router.refresh()
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
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
