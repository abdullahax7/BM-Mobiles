'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PartFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  realCost: z.string().min(1, 'Real cost is required').transform(val => parseFloat(val)),
  sellingPrice: z.string().min(1, 'Selling price is required').transform(val => parseFloat(val)),
  stock: z.string().min(0, 'Stock must be non-negative').transform(val => parseInt(val, 10)),
  lowStockThreshold: z.string().min(0, 'Low stock threshold must be non-negative').transform(val => parseInt(val, 10)),
  modelIds: z.array(z.string()).optional()
})

type PartFormValues = z.infer<typeof PartFormSchema>

interface Model {
  id: string
  name: string
  family: {
    name: string
    brand: {
      name: string
      platform: {
        name: string
      }
    }
  }
}

interface Part {
  id: string
  name: string
  description?: string
  sku: string
  realCost: number
  sellingPrice: number
  stock: number
  lowStockThreshold: number
  models: Array<{
    modelId: string
    model: Model
  }>
}

interface PartFormProps {
  part?: Part
  models: Model[]
}

export function PartForm({ part, models }: PartFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEditing = !!part

  const form = useForm<PartFormValues>({
    resolver: zodResolver(PartFormSchema),
    defaultValues: {
      name: part?.name || '',
      description: part?.description || '',
      sku: part?.sku || '',
      realCost: part?.realCost?.toString() || '0',
      sellingPrice: part?.sellingPrice?.toString() || '0',
      stock: part?.stock?.toString() || '0',
      lowStockThreshold: part?.lowStockThreshold?.toString() || '10',
      modelIds: part?.models?.map(m => m.modelId) || []
    }
  })

  async function onSubmit(data: PartFormValues) {
    setIsSubmitting(true)
    
    try {
      const url = isEditing ? `/api/parts/${part.id}` : '/api/parts'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save part')
      }

      await response.json()
      router.push('/parts')
      router.refresh()
    } catch (error) {
      console.error('Error saving part:', error)
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group models by platform > brand > family
  const groupedModels = models.reduce((acc, model) => {
    const platformName = model.family.brand.platform.name
    const brandName = model.family.brand.name
    const familyName = model.family.name

    if (!acc[platformName]) acc[platformName] = {}
    if (!acc[platformName][brandName]) acc[platformName][brandName] = {}
    if (!acc[platformName][brandName][familyName]) acc[platformName][brandName][familyName] = []

    acc[platformName][brandName][familyName].push(model)
    return acc
  }, {} as Record<string, Record<string, Record<string, Model[]>>>)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core part details and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="LCD Screen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="LCD-SCREEN-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this part
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="High-quality LCD replacement screen..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="realCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Real Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="45.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="89.99" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="25" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="5" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Alert when stock falls below this number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compatible Models</CardTitle>
                <CardDescription>
                  Select which device models this part is compatible with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="modelIds"
                  render={() => (
                    <FormItem>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {Object.entries(groupedModels).map(([platform, brands]) => (
                          <div key={platform} className="space-y-3">
                            <h4 className="font-medium text-sm">{platform}</h4>
                            {Object.entries(brands).map(([brand, families]) => (
                              <div key={`${platform}-${brand}`} className="ml-4 space-y-2">
                                <h5 className="font-medium text-sm text-muted-foreground">{brand}</h5>
                                {Object.entries(families).map(([family, models]) => (
                                  <div key={`${platform}-${brand}-${family}`} className="ml-4 space-y-2">
                                    <h6 className="text-sm text-muted-foreground">{family}</h6>
                                    <div className="ml-4 space-y-2">
                                      {models.map((model) => (
                                        <FormField
                                          key={model.id}
                                          control={form.control}
                                          name="modelIds"
                                          render={({ field }) => {
                                            return (
                                              <FormItem
                                                key={model.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                              >
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(model.id)}
                                                    onCheckedChange={(checked) => {
                                                      const currentValue = field.value || []
                                                      if (checked) {
                                                        field.onChange([...currentValue, model.id])
                                                      } else {
                                                        field.onChange(
                                                          currentValue.filter((value) => value !== model.id)
                                                        )
                                                      }
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">
                                                  {model.name}
                                                </FormLabel>
                                              </FormItem>
                                            )
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/parts">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Part' : 'Create Part'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}