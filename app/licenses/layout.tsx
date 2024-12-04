"use client"
import LicensesNavBar from '@/components/licenses-navbar'

export default function LicensesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <LicensesNavBar />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
