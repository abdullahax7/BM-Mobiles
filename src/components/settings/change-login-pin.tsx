"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Key } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ChangeLoginPin() {
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'New PIN and confirmation do not match' })
      return
    }

    if (newPin.length < 3 || newPin.length > 6) {
      setMessage({ type: 'error', text: 'PIN must be between 3-6 digits' })
      return
    }

    if (!/^\d+$/.test(newPin)) {
      setMessage({ type: 'error', text: 'PIN must contain only numbers' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPin,
          pin: newPin
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update PIN')
      }

      setMessage({ type: 'success', text: data.message })
      setCurrentPin("")
      setNewPin("")
      setConfirmPin("")
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update PIN' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Change Login PIN
        </CardTitle>
        <CardDescription>
          Update your login PIN to secure access to the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPin">Current PIN</Label>
            <Input
              id="currentPin"
              type="password"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="Enter current PIN"
              maxLength={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPin">New PIN</Label>
            <Input
              id="newPin"
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter new PIN (3-6 digits)"
              maxLength={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm New PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm new PIN"
              maxLength={6}
              required
            />
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Update PIN'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}