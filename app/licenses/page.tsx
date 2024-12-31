'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Clock, History, RefreshCw, Search, X, Plus, Edit } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { CustomSkeleton } from "@/components/ui/custom-skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from 'next/link';

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
        <Card key={i} className="p-6 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
          <div className="space-y-4">
            {/* En-tête avec titre et date */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CustomSkeleton className="h-6 mb-4" /> {/* Titre de l'installation */}
                <div className="flex space-x-2">
                  <CustomSkeleton className="h-4 mb-2" /> {/* Organisation */}
                  <CustomSkeleton className="h-4 mb-2" /> {/* Numéro de facture */}
                </div>
              </div>
              <CustomSkeleton className="h-4 mb-2" /> {/* Date */}
            </div>

            {/* Liste des licences */}
            <div className="space-y-4 mt-4">
              {[1, 2].map((j) => (
                <div key={j} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CustomSkeleton className="h-5 w-32" /> {/* Type de licence */}
                        <CustomSkeleton className="h-5 w-20" /> {/* Badge status */}
                      </div>
                      <CustomSkeleton className="h-4 w-64" /> {/* Description */}
                      <div className="flex items-center gap-2">
                        <CustomSkeleton className="h-4 w-4" /> {/* Icône */}
                        <CustomSkeleton className="h-4 w-36" /> {/* Date de création */}
                      </div>
                    </div>
                    <CustomSkeleton className="h-8 w-24" /> {/* Bouton action */}
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
      <div className="container mx-auto py-6 dark:bg-slate-900">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 dark:bg-slate-900">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Gestion des Licences</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-slate-700/20 px-3 py-2">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une licence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none focus:ring-0 w-64 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm("")}
                className="h-4 w-4 p-0 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4 dark:text-gray-400" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 px-3 py-2 h-10 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Actualiser</span>
          </Button>
          <Button onClick={handleNewInstallation} className="gap-2 dark:bg-blue-600 dark:hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Nouvelle Installation de licence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredInstallations.map((installation) => (
          <Card key={installation.id} className="w-full dark:bg-slate-800 dark:border-slate-700 dark:shadow-lg dark:shadow-slate-700/10">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2 dark:text-white">
                    Installation N°{installation.id}
                  </CardTitle>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold dark:text-gray-300">Poste</p>
                      <p className="dark:text-white">{installation.nomPoste}</p>
                    </div>
                    <div>
                      <p className="font-semibold dark:text-gray-300">Utilisateur</p>
                      <p className="dark:text-white">{installation.nomUtilisateur}</p>
                    </div>
                    <div>
                      <p className="font-semibold dark:text-gray-300">Organisation</p>
                      <Badge variant="secondary" className="hover:bg-blue-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
                        {installation.organisation}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-semibold dark:text-gray-300">N° Facture</p>
                      <p className="dark:text-white">{installation.numeroFacture}</p>
                    </div>
                    <div>
                      <p className="font-semibold dark:text-gray-300">Date Facture</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <p className="dark:text-white">{new Date(installation.dateFacture).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    <Link href={`/licenses/historique?installationId=${installation.id}`}>
                      <History className="w-4 h-4 mr-2" />
                      Historique
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/licenses/edition?installationId=${installation.id}`)}
                    className="hover:bg-blue-50 dark:hover:bg-slate-700 dark:text-white dark:border-slate-600 transition-colors duration-300 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                    Edition
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-gray-100">{installation.nomPoste}</h3>
                    <div className="flex space-x-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{installation.organisation}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{installation.numeroFacture}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(installation.dateFacture).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {installation.licenses.map((license) => (
                    <div 
                      key={license.id} 
                      className="p-4 rounded-lg border dark:border-blue-500/30 bg-white dark:bg-gray-800/80 hover:dark:bg-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium dark:text-gray-200">{license.typeLicense}</span>
                            <Badge 
                              variant="outline" 
                              className={
                                license.status === 'INSTALLEE' 
                                  ? "bg-green-100 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 border-green-200 dark:border-green-500/30" 
                                  : license.status === 'REMPLACEE' 
                                    ? "bg-orange-100 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/40 border-orange-200 dark:border-orange-500/30"
                                    : "bg-red-100 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 border-red-200 dark:border-red-500/30"
                              }
                            >
                              {getStatusText(license.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{license.description}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Créée le {new Date(license.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        {(license.status === "INSTALLEE" || license.status === "REMPLACEE") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReplace(license.id.toString(), license.typeLicense)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow-md flex items-center gap-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600"
                          >
                            <RefreshCw className="w-4 h-4 mr-1 text-orange-600 dark:text-orange-400" />
                            Remplacer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dark:bg-slate-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Confirmer le remplacement</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Êtes-vous sûr de vouloir remplacer la licence {selectedLicense?.type} ?
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
              Annuler
            </Button>
            <Button
              onClick={confirmReplace}
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow-md flex items-center gap-2"
            >
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer theme="dark" />
    </div>
  );
}
