'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Clock, History, RefreshCw, Search, X, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import 'react-toastify/dist/ReactToastify.css';

interface License {
  id: number;
  typeLicense: string;
  status: string;
  description: string;
  createdAt: string;
}

interface Installation {
  id: number;
  nomPoste: string;
  nomUtilisateur: string;
  organisation: string;
  numeroFacture: string;
  dateFacture: string;
  createdAt: string;
  licenses: License[];
}

function getStatusText(status: string) {
  switch (status) {
    case 'INSTALLEE':
      return 'Installée';
    case 'REMPLACEE':
      return 'Remplacée';
    case 'INACTIVE':
      return 'Inactive';
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'INSTALLEE':
      return 'bg-white border border-blue-200 text-blue-600 backdrop-blur-sm';
    case 'REMPLACEE':
      return 'bg-orange-500 text-white';
    case 'INACTIVE':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export default function LicensesPage() {
  const router = useRouter();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState<{ id: string; type: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInstallations = async () => {
    try {
      const response = await fetch('/api/licenses');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      setInstallations(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des installations');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallations();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchInstallations();
    setIsRefreshing(false);
    toast.success('Données rafraîchies');
  };

  const handleNewInstallation = () => {
    router.push('/licenses/nouvelle');
  };

  const handleReplace = (licenseId: string, licenseType: string) => {
    setSelectedLicense({ id: licenseId, type: licenseType });
    setIsDialogOpen(true);
  };

  const confirmReplace = () => {
    if (selectedLicense) {
      router.push(`/licenses/remplacements?id=${selectedLicense.id}`);
    }
    setIsDialogOpen(false);
  };

  const filteredInstallations = installations.filter(installation =>
    installation.nomPoste.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.id.toString().includes(searchTerm) ||
    installation.organisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-4">
            {/* En-tête avec titre et date */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" /> {/* Titre de l'installation */}
                <div className="flex space-x-2">
                  <Skeleton className="h-4 w-32" /> {/* Organisation */}
                  <Skeleton className="h-4 w-24" /> {/* Numéro de facture */}
                </div>
              </div>
              <Skeleton className="h-4 w-36" /> {/* Date */}
            </div>

            {/* Liste des licences */}
            <div className="space-y-4 mt-4">
              {[1, 2].map((j) => (
                <div key={j} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-32" /> {/* Type de licence */}
                        <Skeleton className="h-5 w-20" /> {/* Badge status */}
                      </div>
                      <Skeleton className="h-4 w-64" /> {/* Description */}
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" /> {/* Icône */}
                        <Skeleton className="h-4 w-36" /> {/* Date de création */}
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" /> {/* Bouton action */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Licences</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher une licence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none focus:ring-0 w-64"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm("")}
                className="h-4 w-4 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white px-3 py-2 h-10 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Actualiser</span>
          </Button>
          <Button onClick={handleNewInstallation} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle Installation de licence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredInstallations.map((installation) => (
          <Card key={installation.id} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">
                    Installation N°{installation.id}
                  </CardTitle>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Poste</p>
                      <p>{installation.nomPoste}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Utilisateur</p>
                      <p>{installation.nomUtilisateur}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Organisation</p>
                      <Badge variant="secondary">{installation.organisation}</Badge>
                    </div>
                    <div>
                      <p className="font-semibold">N° Facture</p>
                      <p>{installation.numeroFacture}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Date Facture</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p>{new Date(installation.dateFacture).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/licenses/historique?installationId=${installation.id}`)}
                    className="hover:bg-blue-50 transition-colors duration-300 flex items-center"
                  >
                    <History className="w-4 h-4 mr-1 text-blue-600" />
                    Historique
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installation.licenses.map((license) => (
                  <div key={license.id} className="bg-white shadow-md p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg text-gray-800">{license.typeLicense}</h3>
                          <Badge className={`${getStatusColor(license.status)} px-3 py-1`}>
                            {getStatusText(license.status)}
                          </Badge>
                          {(license.status === "INSTALLEE" || license.status === "REMPLACEE") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReplace(license.id.toString(), license.typeLicense)}
                              className="hover:bg-orange-50 transition-colors duration-300 flex items-center ml-2"
                            >
                              <RefreshCw className="w-4 h-4 mr-1 text-orange-600" />
                              Remplacer
                            </Button>
                          )}
                        </div>
                        {license.description && (
                          <p className="text-gray-600 text-sm mb-2">{license.description}</p>
                        )}
                      </div>
                      <div className="flex items-center text-gray-900 text-sm font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {new Date(license.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le remplacement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir remplacer la licence {selectedLicense?.type} ?
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmReplace}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}
