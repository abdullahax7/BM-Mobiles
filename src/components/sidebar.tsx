'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  Package,
  Layers,
  BarChart3,
  ShoppingCart,
  Settings,
  ExternalLink
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    name: 'Parts',
    href: '/parts',
    icon: Package,
  },
  {
    name: 'Hierarchy',
    href: '/hierarchy',
    icon: Layers,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">
         BM Mobile Phone & Repairing Center 
        </h1>
      </div>
      
      <nav className="px-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <a 
          href="https://abdullahax.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Made by Abdullahax.com
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
