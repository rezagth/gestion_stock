'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface License {
  typeLicense: string;
  description: string;
  createdAt: string; // Date de création de la licence
}

interface Installation {
  id: string;
  nomPoste: string;
  nomUtilisateur: string;
  organisation: string;
  numeroFacture: string;
  dateFacture: string; // Date de facture à formater
  createdAt: string; // Date de création de l'installation
  licenses: License[];
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

export default function InstallationLicenseList() {
  const router = useRouter();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const response = await fetch('/api/licenses');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des installations');
        }
        const data = await response.json();
        setInstallations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        toast.error('Erreur lors de la récupération des installations');
      } finally {
        setLoading(false);
      }
    };

    fetchInstallations();
  }, []);

  const handleCreateLicense = () => {
    router.push('/licenses/nouvelle');
  };

  const filteredInstallations = installations.filter(installation =>
    installation.nomPoste.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.organisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Liste des Installations de Licences</h1>
        <Button onClick={handleCreateLicense} className="bg-blue-500 hover:bg-blue-600 text-white">
          Créer une nouvelle licence
        </Button>
      </div>
      <Input
        type="text"
        placeholder="Rechercher par nom de poste, utilisateur, organisation ou numéro de facture"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstallations.map((installation) => (
          <Card key={installation.id} className="w-full">
            <CardHeader>
              <CardTitle>{installation.nomPoste}</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {installation.organisation}
              </Badge>
            </CardHeader>
            <CardContent>
              <p><strong>Utilisateur:</strong> {installation.nomUtilisateur}</p>
              <p><strong>Facture:</strong> {installation.numeroFacture}</p>
              <p><strong>Date de facture:</strong> {formatDate(installation.dateFacture)}</p> {/* Formatted invoice date */}
              <p><strong>Date de création:</strong> {formatDate(installation.createdAt)}</p> {/* Displaying creation date */}
              <Separator className="my-4" />
              <h3 className="text-lg font-semibold mb-2">Licences</h3>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {installation.licenses.map((license, index) => (
                  <div key={index} className="mb-4">
                    <Badge className="bg-blue-500 text-white">{license.typeLicense}</Badge>
                    <p className="text-sm mt-1">{license.description}</p>
                    {/* Displaying the creation date of the license */}
                    <p className="text-xs text-gray-500">Créé le : {formatDate(license.createdAt)}</p> {/* Assuming createdAt is present */}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
}
