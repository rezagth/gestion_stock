import './globals.css';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
import MaterielNavBar from '@/components/materiel-navbar';
import LicensesNavBar from '@/components/licenses-navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gestion Stock',
  description: 'Application de gestion de stock',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <NavBar />
          <main>
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}