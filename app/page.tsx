'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  History, 
  Activity,
  PlusCircle, 
  BarChart3, 
  Clock,
  Package,
  Key,
  Users,
  Settings,
  ArrowRight,
  Ticket,
  Box,
  Repeat
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Installation {
  id: number;
  nomPoste: string;
  nomUtilisateur: string;
  organisation: string;
  createdAt: string;
  isLicense: boolean;
  numeroFacture: string | null;
  dateFacture: string | null;
  materiel: {
    marque: string;
    modele: string;
    type: string;
    numeroSerie: string;
  } | null;
}

interface Remplacement {
  id: number;
  ancienNomPoste: string;
  nouveauNomPoste: string;
  dateRemplacement: string;
  motif: string;
  type: 'materiel' | 'license';
  organisation: string;
  nouveauNomUtilisateur: string | null;
  ancienNomUtilisateur: string | null;
  materiel: {
    marque: string;
    modele: string;
    type: string;
    numeroSerie: string;
  } | null;
}

interface Remplacement_License {
  id: number;
  dateRemplacement: string;
  ancienNomPoste: string;
  nouveauNomPoste: string;
  ancienNomUtilisateur: string;
  nouveauNomUtilisateur: string;
  motif: string;
  license: {
    id: number;
    typeLicense: string;
    status: string;
    description: string;
    createdAt: string;
  };
  installation: {
    id: number;
    nomPoste: string;
    nomUtilisateur: string;
    organisation: string;
    numeroFacture: string | null;
    dateFacture: string | null;
    createdAt: string;
  };
}

interface License {
  id: number;
  nomPoste: string;
  nomUtilisateur: string;
  organisation: string;
  createdAt: string;
  typeLicense: string;
}

export default function HomePage() {
  const [totals, setTotals] = useState({ 
    installations: {
      materiel: 0,
      license: 0,
      total: 0
    },
    remplacements: { 
      materiel: 0,
      license: 0,
      total: 0
    }, 
    materiels: 0,
    licenses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer toutes les données nécessaires
        const [
          installationsRes, 
          remplacementsRes, 
          materielsRes, 
          licensesRes, 
          licensesInstallationsRes,
          licenseRemplacementsRes
        ] = await Promise.all([
          fetch('/api/installations'),
          fetch('/api/remplacements'),
          fetch('/api/materiels'),
          fetch('/api/licenses'),
          fetch('/api/licenses'),
          fetch('/api/licenses/remplacements')
        ]);

        if (!licenseRemplacementsRes.ok) {
          throw new Error('Erreur lors de la récupération des remplacements de licences');
        }

        const [
          installations, 
          remplacements, 
          materiels, 
          licenses, 
          licensesInstallations,
          licenseReplacements
        ] = await Promise.all([
          installationsRes.json(),
          remplacementsRes.json(),
          materielsRes.json(),
          licensesRes.json(),
          licensesInstallationsRes.json(),
          licenseRemplacementsRes.json()
        ]);

        // Séparer les installations par type
        const materielInstallations = installations.filter(i => !i.isLicense);
        const licenseInstallations = licensesInstallations;

        // Séparer les remplacements par type
        const materielReplacements = remplacements.remplacements ? 
          remplacements.remplacements.filter(r => !r.isLicense) : [];

        // S'assurer que licenseReplacements est un tableau
        const licenseReplacementsData = Array.isArray(licenseReplacements) ? licenseReplacements : [];

        setTotals({
          installations: {
            materiel: materielInstallations.length,
            license: licenseInstallations.length,
            total: materielInstallations.length + licenseInstallations.length
          },
          remplacements: {
            materiel: materielReplacements.length,
            license: licenseReplacementsData.length,
            total: materielReplacements.length + licenseReplacementsData.length
          },
          materiels: materiels.length,
          licenses: licenses.length,
        });

      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: <Monitor className="w-8 h-8 text-blue-500" />,
      title: "Gestion du Matériel",
      description: "Créer facilement et visualiser des installations et des remplacements de matériel (même pour Daniel)"
    },
    {
      icon: <Key className="w-8 h-8 text-green-500" />,
      title: "Gestion des Licences AMV",
      description: "Créer facilement et visualiser des installations et des remplacements de licences AMV (même pour Daniel)"
    },
    {
      icon: <History className="w-8 h-8 text-purple-500" />,
      title: "historique des remplacements",
      description: "Accédez à l'historique des remplacements de license et des matériels et des modifications"
    },
    {
      icon: <Repeat className="w-8 h-8 text-orange-500" />,
      title: "Gestion des remplacements",
      description: "Gérez les remplacements sur toute les installations matériels et licences AMV"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Gestion d'installation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Plateforme centralisée pour la gestion des installations matériel et licences AMV
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
          <Link href="/installations/" className="w-full">
            <Button 
              className="w-full h-16 text-lg gap-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
            >
              <Box className="w-6 h-6" />
              Liste des installations matériels
            </Button>
          </Link>
          <Link href="/licenses/" className="w-full">
            <Button 
              className="w-full h-16 text-lg gap-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
            >
              <Box className="w-6 h-6" />
              Liste des installations licences
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:bg-slate-800 dark:hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="pt-6">
                <div className="rounded-full w-16 h-16 flex items-center justify-center bg-gray-50 dark:bg-slate-700 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Matériel Statistics */}
          <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:bg-slate-800 dark:hover:bg-slate-700/50 transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Monitor className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Statistiques Matériel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total installations</span>
                  <Badge variant="secondary" className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                    {totals.installations.materiel}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total matériels</span>
                  <Badge variant="secondary" className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30">
                    {totals.materiels}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total remplacements</span>
                  <Badge variant="secondary" className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30">
                    {totals.remplacements.materiel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Licenses Statistics */}
          <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:bg-slate-800 dark:hover:bg-slate-700/50 transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Key className="w-5 h-5 text-green-500 dark:text-green-400" />
                Statistiques Licences AMV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total installations</span>
                  <Badge variant="secondary" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                    {totals.installations.license}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total licences</span>
                  <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30">
                    {totals.licenses}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total remplacements</span>
                  <Badge variant="secondary" className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30">
                    {totals.remplacements.license}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}