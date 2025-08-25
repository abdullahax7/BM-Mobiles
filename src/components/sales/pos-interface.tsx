'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt, Loader2 } from 'lucide-react'
import { z } from 'zod'

interface Part {
  id: string
  name: string
  sku: string
  sellingPrice: number
  stock: number
  description?: string
}

interface CartItem {
  part: Part
  quantity: number
  unitPrice: number
  totalPrice: number
}

export function POSInterface() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Part[]>([])
  const [searching, setSearching] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ONLINE' | 'OTHER'>('CASH')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  // Search for parts
  useEffect(() => {
    const searchParts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setSearching(true)
      try {
        const response = await fetch(`/api/parts?q=${encodeURIComponent(searchQuery)}&limit=10`)
        const data = await response.json()
        setSearchResults(data.parts || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }

    const debounce = setTimeout(searchParts, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Add item to cart
  const addToCart = (part: Part) => {
    // Check if part has zero stock
    if (part.stock <= 0) {
      alert(`Cannot add "${part.name}" - Out of stock!`)
      return
    }

    const existingItem = cart.find(item => item.part.id === part.id)
    
    if (existingItem) {
      // Check if adding one more would exceed stock
      if (existingItem.quantity + 1 > part.stock) {
        alert(`Cannot add more "${part.name}" - Only ${part.stock} units available in stock`)
        return
      }
      updateQuantity(part.id, existingItem.quantity + 1)
    } else {
      setCart([...cart, {
        part,
        quantity: 1,
        unitPrice: part.sellingPrice,
        totalPrice: part.sellingPrice
      }])
    }
    
    setSearchQuery('')
    setSearchResults([])
  }

  // Update quantity
  const updateQuantity = (partId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(partId)
      return
    }

    setCart(cart.map(item => {
      if (item.part.id === partId) {
        const part = item.part
        if (newQuantity > part.stock) {
          alert(`Only ${part.stock} units available in stock`)
          return item
        }
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        }
      }
      return item
    }))
  }

  // Remove from cart
  const removeFromCart = (partId: string) => {
    setCart(cart.filter(item => item.part.id !== partId))
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const finalAmount = subtotal - discount

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    if (finalAmount < 0) {
      alert('Discount cannot be greater than total amount')
      return
    }

    // Final stock validation before processing
    for (const item of cart) {
      if (item.quantity > item.part.stock) {
        alert(`Insufficient stock for "${item.part.name}". Available: ${item.part.stock}, In cart: ${item.quantity}`)
        return
      }
    }

    setProcessing(true)
    try {
      const saleData = {
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        paymentMethod,
        discount,
        notes: notes || undefined,
        items: cart.map(item => ({
          partId: item.part.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process sale')
      }

      const sale = await response.json()
      
      // Clear cart and form
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
      setDiscount(0)
      setNotes('')
      
      // Show success and redirect
      alert(`Sale completed! ID: ${sale.id.slice(-8)}`)
      router.push('/sales')
      router.refresh()
    } catch (error) {
      console.error('Sale error:', error)
      alert((error as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Product Search and Cart */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
            <CardDescription>Search for parts to add to the sale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Search Results */}
            {searching && (
              <div className="mt-2 p-4 text-center text-muted-foreground">
                Searching...
              </div>
            )}
            
            {!searching && searchResults.length > 0 && (
              <div className="mt-2 space-y-2">
                {searchResults.map(part => (
                  <div
                    key={part.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                      part.stock <= 0 
                        ? 'bg-red-50 border-red-200 opacity-75' 
                        : part.stock <= 5 
                        ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => addToCart(part)}
                  >
                    <div>
                      <div className="font-medium">
                        {part.name}
                        {part.stock <= 0 && (
                          <Badge variant="destructive" className="ml-2">Out of Stock</Badge>
                        )}
                        {part.stock > 0 && part.stock <= 5 && (
                          <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-700">Low Stock</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {part.sku} | Stock: {part.stock} | Price: PKR {part.sellingPrice.toFixed(2)}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      disabled={part.stock <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Cart is empty. Add items to begin.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.part.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.part.name}</div>
                      <div className="text-sm text-muted-foreground">
                        PKR {item.unitPrice.toFixed(2)} x {item.quantity} = PKR {item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.part.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="1"
                        max={item.part.stock}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.part.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Customer & Payment */}
      <div className="space-y-4">
        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Optional customer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                min="0"
                max={subtotal}
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">PKR {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span className="text-red-600">-PKR {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>PKR {finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={processSale}
              disabled={processing || cart.length === 0}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Receipt className="mr-2 h-4 w-4" />
              Process Sale
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
