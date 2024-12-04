"use client"
import MaterielNavBar from '@/components/materiel-navbar'

export default function MaterielLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <MaterielNavBar />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
