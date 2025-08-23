'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'

const TransactionFormSchema = z.object({
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.string().min(1, 'Quantity is required').transform(val => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num <= 0) {
      throw new Error('Quantity must be a positive number')
    }
    return num
  }),
  reason: z.string().optional(),
  partId: z.string().min(1, 'Please select a part')
})

type TransactionFormValues = z.infer<typeof TransactionFormSchema>

interface Part {
  id: string
  name: string
  sku: string
  stock: number
}

interface NewTransactionDialogProps {
  parts: Part[]
  children: React.ReactNode
}

export function NewTransactionDialog({ parts, children }: NewTransactionDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      type: undefined,
      quantity: '',
      reason: '',
      partId: undefined
    }
  })

  async function onSubmit(data: TransactionFormValues) {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      form.reset()
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating transaction:', error)
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPartId = form.watch('partId')
  const selectedPart = parts.find(p => p.id === selectedPartId)
  const transactionType = form.watch('type')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Record a new inventory transaction
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="partId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a part" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parts.map((part) => (
                        <SelectItem key={part.id} value={part.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{part.name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {part.sku}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground ml-2">
                              Stock: {part.stock}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPart && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm">
                  <strong>Current Stock:</strong> {selectedPart.stock} units
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IN">IN - Add to stock</SelectItem>
                      <SelectItem value="OUT">OUT - Remove from stock</SelectItem>
                      <SelectItem value="ADJUST">ADJUST - Stock adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantity
                    {transactionType === 'ADJUST' && ' (use negative numbers to decrease)'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={transactionType === 'ADJUST' ? undefined : "1"}
                      placeholder={transactionType === 'ADJUST' ? '±10' : '10'}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {transactionType === 'IN' && 'Number of units to add to stock'}
                    {transactionType === 'OUT' && 'Number of units to remove from stock'}
                    {transactionType === 'ADJUST' && 'Stock adjustment (positive to add, negative to remove)'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reason for this transaction..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Transaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}