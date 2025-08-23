'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Model {
  id: string
  name: string
  slug: string
}

interface Family {
  id: string
  name: string
  slug: string
  models: Model[]
}

interface Brand {
  id: string
  name: string
  slug: string
  families: Family[]
}

interface Platform {
  id: string
  name: string
  slug: string
  brands: Brand[]
}

interface HierarchyManagerProps {
  initialPlatforms: Platform[]
}

type NewItemType = 'platform' | 'brand' | 'family' | 'model'

export function HierarchyManager({ initialPlatforms }: HierarchyManagerProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [newItemDialog, setNewItemDialog] = useState<{
    isOpen: boolean
    type: 'platform' | 'brand' | 'family' | 'model'
    parentId?: string
  }>({ isOpen: false, type: 'platform' })

  const reloadPlatforms = async () => {
    try {
      const res = await fetch('/api/hierarchy/platforms', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setPlatforms(data)
      }
    } catch (e) {
      console.error('Failed to reload platforms', e)
    }
  }

  const apiBase = (type: NewItemType) =>
    `/api/hierarchy/${
      type === 'platform' ? 'platforms' : type === 'brand' ? 'brands' : type === 'family' ? 'families' : 'models'
    }`

  const handleDelete = async (type: NewItemType, id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this item?')) return
    try {
      const res = await fetch(`${apiBase(type)}?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Delete failed')
      }
      await reloadPlatforms()
    } catch (e) {
      console.error('Delete failed:', e)
      if (typeof window !== 'undefined') alert(`Delete failed: ${String((e as Error).message)}`)
    }
  }

  const handleRename = async (type: NewItemType, id: string, currentName: string) => {
    const newName = typeof window !== 'undefined' ? window.prompt('Enter new name', currentName) : null
    if (!newName || newName.trim() === '' || newName === currentName) return
    try {
      const res = await fetch(apiBase(type), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: newName.trim() }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Rename failed')
      }
      await reloadPlatforms()
    } catch (e) {
      console.error('Rename failed:', e)
      if (typeof window !== 'undefined') alert(`Rename failed: ${String((e as Error).message)}`)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const openNewItemDialog = (type: 'platform' | 'brand' | 'family' | 'model', parentId?: string) => {
    setNewItemDialog({ isOpen: true, type, parentId })
  }

  const closeNewItemDialog = () => {
    setNewItemDialog({ isOpen: false, type: 'platform' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Device Hierarchy</h3>
        <Button onClick={() => openNewItemDialog('platform')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Platform
        </Button>
      </div>

      <div className="space-y-4">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(`platform-${platform.id}`)}
                  >
                    {expandedItems.has(`platform-${platform.id}`) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <CardTitle className="text-base">{platform.name}</CardTitle>
                  <Badge variant="outline">{platform.brands.length} brands</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openNewItemDialog('brand', platform.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Brand
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRename('platform', platform.id, platform.name)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete('platform', platform.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedItems.has(`platform-${platform.id}`) && (
              <CardContent className="pt-0">
                <div className="space-y-3 ml-6">
                  {platform.brands.map((brand) => (
                    <div key={brand.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(`brand-${brand.id}`)}
                          >
                            {expandedItems.has(`brand-${brand.id}`) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="font-medium">{brand.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {brand.families.length} families
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNewItemDialog('family', brand.id)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Family
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRename('brand', brand.id, brand.name)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete('brand', brand.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {expandedItems.has(`brand-${brand.id}`) && (
                        <div className="space-y-2 ml-6">
                          {brand.families.map((family) => (
                            <div key={family.id} className="border rounded p-2 bg-muted/50">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpanded(`family-${family.id}`)}
                                  >
                                    {expandedItems.has(`family-${family.id}`) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <span className="text-sm font-medium">{family.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {family.models.length} models
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openNewItemDialog('model', family.id)}
                                  >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Model
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRename('family', family.id, family.name)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete('family', family.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {expandedItems.has(`family-${family.id}`) && (
                                <div className="ml-6 space-y-1">
                                  {family.models.map((model) => (
                                    <div key={model.id} className="flex items-center justify-between py-1">
                                      <span className="text-sm">{model.name}</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRename('model', model.id, model.name)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDelete('model', model.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  {family.models.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No models yet</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {brand.families.length === 0 && (
                            <p className="text-sm text-muted-foreground">No families yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {platform.brands.length === 0 && (
                    <p className="text-sm text-muted-foreground">No brands yet</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <NewItemDialog
        isOpen={newItemDialog.isOpen}
        onClose={closeNewItemDialog}
        type={newItemDialog.type}
        parentId={newItemDialog.parentId}
        platforms={platforms}
        onItemCreated={async () => {
          await reloadPlatforms()
          closeNewItemDialog()
        }}
      />
    </div>
  )
}

interface NewItemDialogProps {
  isOpen: boolean
  onClose: () => void
  type: NewItemType
  parentId?: string
  platforms: Platform[]
  onItemCreated: (item: unknown, type: NewItemType, parentId?: string) => void
}

function NewItemDialog({ isOpen, onClose, type, parentId, platforms, onItemCreated }: NewItemDialogProps) {
  const [name, setName] = useState('')
  const [selectedParent, setSelectedParent] = useState(parentId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep selected parent in sync when the dialog opens or the parentId changes
  useEffect(() => {
    if (isOpen) {
      setSelectedParent(parentId || '')
    }
  }, [isOpen, parentId, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let url = ''
      const body: Record<string, string> = { name }

      switch (type) {
        case 'platform':
          url = '/api/hierarchy/platforms'
          break
        case 'brand':
          url = '/api/hierarchy/brands'
          body.platformId = selectedParent || parentId || ''
          break
        case 'family':
          url = '/api/hierarchy/families'
          body.brandId = selectedParent || parentId || ''
          break
        case 'model':
          url = '/api/hierarchy/models'
          body.familyId = selectedParent || parentId || ''
          break
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`Failed to create item${text ? `: ${text}` : ''}`)
      }

      const newItem = await response.json()
      onItemCreated(newItem, type, selectedParent)
      setName('')
      setSelectedParent('')
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDialogTitle = () => {
    switch (type) {
      case 'platform': return 'Add New Platform'
      case 'brand': return 'Add New Brand'
      case 'family': return 'Add New Family'
      case 'model': return 'Add New Model'
      default: return 'Add New Item'
    }
  }

  const needsParentSelection = type !== 'platform' && !parentId

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Create a new {type} in the hierarchy
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {needsParentSelection && (
            <div className="space-y-2">
              <Label>
                {type === 'brand' ? 'Platform' : 
                 type === 'family' ? 'Brand' : 'Family'}
              </Label>
              <Select value={selectedParent} onValueChange={setSelectedParent}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${type === 'brand' ? 'platform' : type === 'family' ? 'brand' : 'family'}`} />
                </SelectTrigger>
                <SelectContent>
                  {type === 'brand' && platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                  {type === 'family' && platforms.flatMap(platform => 
                    platform.brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {platform.name} {' > '} {brand.name}
                      </SelectItem>
                    ))
                  )}
                  {type === 'model' && platforms.flatMap(platform =>
                    platform.brands.flatMap(brand =>
                      brand.families.map(family => (
                        <SelectItem key={family.id} value={family.id}>
                          {platform.name} {' > '} {brand.name} {' > '} {family.name}
                        </SelectItem>
                      ))
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} name`}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={
              isSubmitting ||
              !name ||
              (type !== 'platform' && !(selectedParent || parentId))
            }>
              {isSubmitting ? 'Creating...' : `Create ${type}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}