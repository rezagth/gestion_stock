"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Monitor, RefreshCcw, Activity } from 'lucide-react'

export default function MaterielNavBar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/installations', label: 'Installations', icon: <Monitor className="w-4 h-4" /> },
    { href: '/remplacements', label: 'Remplacements', icon: <RefreshCcw className="w-4 h-4" /> },
    { href: '/suivi', label: 'Suivi', icon: <Activity className="w-4 h-4" /> },
  ]

  const isMaterielSection = pathname?.startsWith('/installations') || 
                           pathname?.startsWith('/remplacements') || 
                           pathname?.startsWith('/suivi')

  if (!isMaterielSection) return null

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-12">
          <div className="hidden sm:flex sm:space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    ${isActive
                      ? 'border-b-2 border-white text-white'
                      : 'border-transparent text-blue-50 hover:text-white'
                    } 
                    inline-flex items-center px-3 pt-1 text-sm font-medium
                    transition-colors duration-200 gap-2 hover:bg-blue-500/20
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div className="sm:hidden">
        <div className="flex flex-row justify-around px-2 pt-2 pb-3 space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  ${isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-50 hover:bg-blue-500/20 hover:text-white'
                  }
                  flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium
                `}
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
