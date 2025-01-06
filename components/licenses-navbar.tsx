"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Key, History, RefreshCcw } from 'lucide-react'

export default function LicensesNavBar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/licenses', label: 'Liste des Licences', icon: <Key className="w-4 h-4" /> },
    { href: '/licenses/historique', label: 'Historique', icon: <History className="w-4 h-4" /> },
    { href: '/licenses/remplacements', label: 'Remplacements', icon: <RefreshCcw className="w-4 h-4" /> },
  ]

  const isLicensesSection = pathname?.startsWith('/licenses')

  if (!isLicensesSection) return null

  return (
    <nav className="
     flex items-center top-20 left-0 right-0 z-50 w-full shadow-sm bg-gradient-to-r from-white to-blue-600 text-blue-600 dark:from-slate-900 dark:to-slate-700 text-center mt-0">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-16">
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
                      ? 'border-b-2 border-white text-blue-600'
                      : 'border-transparent text-blue-50 hover:text-white'
                    } 
                    inline-flex items-center px-3 pt-1 text-sm font-medium
                    transition-colors duration-200 gap-2 hover:bg-blue-500/20 dark:hover:bg-slate-800
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
