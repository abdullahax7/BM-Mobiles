"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

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

interface PartModel {
  modelId: string
  model: Model
}

interface ExpandableModelsProps {
  models: PartModel[]
  maxVisible?: number
}

export function ExpandableModels({ models, maxVisible = 3 }: ExpandableModelsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (models.length === 0) {
    return <span className="text-muted-foreground text-sm">No models</span>
  }

  const visibleModels = isExpanded ? models : models.slice(0, maxVisible)
  const hasMore = models.length > maxVisible

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleModels.map((partModel) => (
        <Badge key={partModel.modelId} variant="secondary" className="text-xs">
          {partModel.model.name}
        </Badge>
      ))}
      
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="h-3 w-3 ml-1" />
            </>
          ) : (
            <>
              +{models.length - maxVisible} more
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}