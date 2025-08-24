'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Minus, Trash2, ShoppingCart, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface Part {
  id: string
  name: string
  sku: string
  sellingPrice: number
  stock: number
  lowStockThreshold: number
}

interface CartItem extends Part {
  cartQuantity: number
  subtotal: number
}

interface POSInterfaceProps {
  parts: Part[]
}

export function POSInterface({ parts }: POSInterfaceProps) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter parts based on search term
  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add item to cart
  const addToCart = (part: Part, quantity: number = 1) => {
    if (quantity > part.stock) {
      toast.error(`Only ${part.stock} units available in stock`)
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === part.id)
      if (existingItem) {
        const newQuantity = existingItem.cartQuantity + quantity
        if (newQuantity > part.stock) {
          toast.error(`Only ${part.stock} units available in stock`)
          return prevCart
        }
        return prevCart.map(item =>
          item.id === part.id
            ? {
                ...item,
                cartQuantity: newQuantity,
                subtotal: newQuantity * part.sellingPrice
              }
            : item
        )
      } else {
        return [...prevCart, {
          ...part,
          cartQuantity: quantity,
          subtotal: quantity * part.sellingPrice
        }]
      }
    })
  }

  // Update cart item quantity
  const updateCartQuantity = (partId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(partId)
      return
    }

    const part = parts.find(p => p.id === partId)
    if (!part) return

    if (newQuantity > part.stock) {
      toast.error(`Only ${part.stock} units available in stock`)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === partId
          ? {
              ...item,
              cartQuantity: newQuantity,
              subtotal: newQuantity * item.sellingPrice
            }
          : item
      )
    )
  }

  // Remove item from cart
  const removeFromCart = (partId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== partId))
  }

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0)

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/pos/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            partId: item.id,
            quantity: item.cartQuantity,
            unitPrice: item.sellingPrice,
            totalPrice: item.subtotal
          })),
          totalAmount: total
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process sale')
      }

      toast.success(`Sale completed! Total: PKR ${total.toFixed(2)}`)
      setCart([])
      router.refresh()
    } catch (error) {
      console.error('Error processing sale:', error)
      toast.error('Failed to process sale')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Products
            </CardTitle>
            <CardDescription>
              Select components to add to cart
            </CardDescription>
            <div className="pt-2">
              <Input
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{part.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {part.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{part.stock}</span>
                            {part.stock <= part.lowStockThreshold && (
                              <Badge variant="destructive" className="text-xs">
                                Low
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">
                            PKR {part.sellingPrice.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => addToCart(part)}
                            disabled={part.stock === 0}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cart
              </span>
              {totalItems > 0 && (
                <Badge variant="secondary">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review selected items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Cart is empty
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      PKR {item.sellingPrice.toFixed(2)} each
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}
                        disabled={item.cartQuantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-mono">
                        {item.cartQuantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                        disabled={item.cartQuantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-mono font-medium">
                      PKR {item.subtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Separator />
            <div className="flex justify-between items-center w-full">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold font-mono">
                PKR {total.toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={processSale}
              disabled={cart.length === 0 || isProcessing}
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Process Sale'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}