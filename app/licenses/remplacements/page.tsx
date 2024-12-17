// app/licenses/remplacements/page.tsx
'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";

interface License {
  id: string;
  typeLicense: string;
  description: string;
  status: string;
  installation: {
    id: number;
    nomPoste: string;
    nomUtilisateur: string;
    organisation: string;
    numeroFacture: string;
  };
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'INSTALLEE':
      return 'Installée';
    case 'REMPLEE':
      return 'Remplacée';
    default:
      return 'Inconnue';
  }
};

export default function RemplacementPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <RemplacementContent />
    </Suspense>
  );
}

function RemplacementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [licenses, setLicenses] = useState<License[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<string>(initialId || '');
  const [selectedLicenseInfo, setSelectedLicenseInfo] = useState<License | null>(null);
  const [loading, setLoading] = useState(false);
  const [changePoste, setChangePoste] = useState(false);
  const [changeUtilisateur, setChangeUtilisateur] = useState(false);
  const [nouveauNomPoste, setNouveauNomPoste] = useState('');
  const [nouveauNomUtilisateur, setNouveauNomUtilisateur] = useState('');
  const [motif, setMotif] = useState('');
  const [remplacementHistory, setRemplacementHistory] = useState<any[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await fetch("/api/licenses");
        if (!response.ok) throw new Error("Erreur lors de la récupération des licences");
        const data = await response.json();
        const allLicenses = data.flatMap((install: any) =>
          install.licenses.map((license: any) => ({
            ...license,
            installation: {
              id: install.id,
              nomPoste: install.nomPoste,
              nomUtilisateur: install.nomUtilisateur,
              organisation: install.organisation,
              numeroFacture: install.numeroFacture,
            },
          }))
        );
        setLicenses(allLicenses);

        // Si on a un ID initial, on sélectionne automatiquement la licence
        if (initialId) {
          const license = allLicenses.find((l: { id: string; }) => l.id === initialId);
          if (license) {
            setSelectedLicenseInfo(license);
            fetchLicenseHistory(initialId);
          }
        }
      } catch (error) {
        toast.error("Erreur lors de la récupération des licences");
        console.error(error);
      }
    };
    fetchLicenses();
  }, [initialId]);

  const fetchLicenseHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/licenses/${id}/historique`);
      if (!response.ok) throw new Error("Erreur lors de la récupération de l'historique");
      const data = await response.json();
      setRemplacementHistory(data.remplacements);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
    }
  };

  useEffect(() => {
    if (selectedLicense) {
      const license = licenses.find(l => l.id === selectedLicense);
      setSelectedLicenseInfo(license || null);
      if (license) {
        setNouveauNomPoste(license.installation.nomPoste);
        setNouveauNomUtilisateur(license.installation.nomUtilisateur);
        fetchLicenseHistory(license.id);
      }
    } else {
      setSelectedLicenseInfo(null);
      setRemplacementHistory([]);
    }
  }, [selectedLicense, licenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) {
      toast.error("Veuillez sélectionner une licence");
      return;
    }

    if (!changePoste && !changeUtilisateur) {
      toast.error("Veuillez sélectionner au moins un type de changement");
      return;
    }

    if (changePoste && !nouveauNomPoste) {
      toast.error("Veuillez entrer le nouveau nom de poste");
      return;
    }

    if (changeUtilisateur && !nouveauNomUtilisateur) {
      toast.error("Veuillez entrer le nouveau nom d'utilisateur");
      return;
    }

    const data = {
      licenseId: selectedLicense,
      changePoste,
      changeUtilisateur,
      nouveauNomPoste,
      nouveauNomUtilisateur,
      motif,
    };

    setFormData(data);
    setIsConfirmDialogOpen(true);
  };

  const confirmReplacement = async () => {
    if (!formData) return;
    
    try {
      setLoading(true);
      const response = await fetch("/api/licenses/remplacements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur lors du remplacement");

      const result = await response.json();

      if (result.success) {
        toast.success("Remplacement effectué avec succès");
        router.push(`/licenses/historique?installationId=${result.installation.id}`);
      } else {
        throw new Error(result.error || "Erreur lors du remplacement");
      }
    } catch (error) {
      toast.error("Erreur lors du remplacement");
      console.error(error);
    } finally {
      setLoading(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Remplacement de Licence
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Sélection de la licence</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedLicense}
              onValueChange={setSelectedLicense}
            >
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder="Sélectionner une licence à remplacer" />
              </SelectTrigger>
              <SelectContent>
                {licenses.map((license) => (
                  <SelectItem key={license.id} value={license.id}>
                    {license.typeLicense} - {license.installation.nomPoste} 
                    {license.status !== 'INSTALLEE' && (
                      <Badge variant="secondary" className="ml-2">
                        {getStatusText(license.status)}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedLicenseInfo && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    {selectedLicenseInfo.typeLicense}
                  </Badge>
                  <span className="text-gray-500">•</span>
                  <Badge variant="outline" className="bg-white">
                    {selectedLicenseInfo.installation.organisation}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-700 mb-2">Configuration Actuelle</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Poste:</span>
                          <span className="font-medium bg-white px-2 py-1 rounded">
                            {selectedLicenseInfo.installation.nomPoste}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Utilisateur:</span>
                          <span className="font-medium bg-white px-2 py-1 rounded">
                            {selectedLicenseInfo.installation.nomUtilisateur}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-700 mb-2">Modifications</p>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id="changePoste"
                              checked={changePoste}
                              onCheckedChange={(checked) => setChangePoste(checked as boolean)}
                            />
                            <label htmlFor="changePoste" className="text-sm font-medium text-gray-700">
                              Changer le poste
                            </label>
                          </div>
                          {changePoste && (
                            <Input
                              placeholder="Nouveau nom de poste"
                              value={nouveauNomPoste}
                              onChange={(e) => setNouveauNomPoste(e.target.value)}
                              className="bg-white"
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id="changeUtilisateur"
                              checked={changeUtilisateur}
                              onCheckedChange={(checked) => setChangeUtilisateur(checked as boolean)}
                            />
                            <label htmlFor="changeUtilisateur" className="text-sm font-medium text-gray-700">
                              Changer l'utilisateur
                            </label>
                          </div>
                          {changeUtilisateur && (
                            <Input
                              placeholder="Nouveau nom d'utilisateur"
                              value={nouveauNomUtilisateur}
                              onChange={(e) => setNouveauNomUtilisateur(e.target.value)}
                              className="bg-white"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-700 mb-2">Informations Facture</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">N° Facture:</span>
                          <span className="font-medium bg-white px-2 py-1 rounded">
                            {selectedLicenseInfo.installation.numeroFacture}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-700 mb-2">Motif du remplacement</p>
                      <Textarea
                        placeholder="Décrivez la raison du remplacement..."
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        className="bg-white resize-none h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {remplacementHistory.length > 0 && (
              <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    Historique des remplacements
                    <Badge variant="secondary" className="ml-2">
                      {remplacementHistory.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full">
                    <div className="space-y-4">
                      {remplacementHistory.map((remplacement, index) => (
                        <div 
                          key={index} 
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-white">
                              {new Date(remplacement.dateRemplacement).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {remplacement.ancienNomPoste !== remplacement.nouveauNomPoste && (
                              <div>
                                <p className="text-gray-600 mb-1">Changement de poste:</p>
                                <div className="flex items-center gap-2">
                                  <span className="bg-white px-2 py-1 rounded">
                                    {remplacement.ancienNomPoste}
                                  </span>
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                                    {remplacement.nouveauNomPoste}
                                  </span>
                                </div>
                              </div>
                            )}
                            {remplacement.ancienNomUtilisateur !== remplacement.nouveauNomUtilisateur && (
                              <div>
                                <p className="text-gray-600 mb-1">Changement d'utilisateur:</p>
                                <div className="flex items-center gap-2">
                                  <span className="bg-white px-2 py-1 rounded">
                                    {remplacement.ancienNomUtilisateur}
                                  </span>
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                                    {remplacement.nouveauNomUtilisateur}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          {remplacement.motif && (
                            <div className="mt-2 text-sm text-gray-600">
                              <p className="font-medium text-gray-700">Motif:</p>
                              <p className="mt-1 bg-white p-2 rounded">
                                {remplacement.motif}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 ${
                loading || !selectedLicense || (!changePoste && !changeUtilisateur)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={loading || !selectedLicense || (!changePoste && !changeUtilisateur)}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Remplacement en cours...
                </div>
              ) : (
                "Effectuer le remplacement"
              )}
            </Button>
          </form>
        )}

        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer le remplacement</DialogTitle>
              <DialogDescription>
                <div className="mt-4 space-y-4">
                  {changePoste && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Nouveau poste</p>
                      <p className="mt-1 text-sm bg-white px-2 py-1 rounded">
                        {nouveauNomPoste}
                      </p>
                    </div>
                  )}
                  {changeUtilisateur && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Nouvel utilisateur</p>
                      <p className="mt-1 text-sm bg-white px-2 py-1 rounded">
                        {nouveauNomUtilisateur}
                      </p>
                    </div>
                  )}
                  {motif && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Motif du remplacement</p>
                      <p className="mt-1 text-sm bg-white px-2 py-1 rounded">
                        {motif}
                      </p>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={confirmReplacement}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </div>
                ) : (
                  "Confirmer"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}