import './globals.css';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
import MaterielNavBar from '@/components/materiel-navbar';
import LicensesNavBar from '@/components/licenses-navbar';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gestion des installations',
  description: 'Application de gestion d\'installation matériel et de licence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <NavBar />
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}