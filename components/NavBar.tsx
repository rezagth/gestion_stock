"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Monitor, Key, Settings, Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NavBar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { 
      href: '/installations', 
      label: 'Matériel', 
      icon: <Monitor className="w-5 h-5" />,
      description: 'Gestion du parc informatique'
    },
    { 
      href: '/licenses', 
      label: 'Licences', 
      icon: <Key className="w-5 h-5" />,
      description: 'Gestion des licences logicielles'
    },
  
  ]

  if (pathname === '/') return null

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-xl hover:text-blue-100 transition-colors">
              Gestion des installations
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {menuItems.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                    }
                    px-3 py-2 rounded-md text-sm font-medium
                    transition-colors duration-200
                    flex items-center gap-2
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-3 pt-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname?.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                      }
                      block px-3 py-2 rounded-md text-base font-medium
                      transition-colors duration-200
                      flex items-center gap-2
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <div>
                      <div>{item.label}</div>
                      <div className="text-sm opacity-75">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}