"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Clock, ArrowRight, Building2, User, Monitor, FileText, 
  CalendarDays, History, Search, RefreshCw, AlertCircle, Filter,
  X, MessageSquare 
} from "lucide-react";
import { toast } from "react-toastify";

interface Remplacement {
  id: string;
  licenseId: string;
  dateRemplacement: string;
  ancienNomPoste: string;
  nouveauNomPoste: string;
  ancienNomUtilisateur: string;
  nouveauNomUtilisateur: string;
  motif: string;
  license: {
    typeLicense: string;
    status: string;
  };
  installation: {
    organisation: string;
    numeroFacture: string;
    dateFacture: string;
  };
}

export default function HistoriquePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <HistoriqueContent />
    </Suspense>
  );
}

function HistoriqueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const installationId = searchParams.get("installationId");
  const [searchTerm, setSearchTerm] = useState("");
  const [remplacements, setRemplacements] = useState<Remplacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour charger les données
  const loadData = async (showToast = false) => {
    if (!installationId) return;

    try {
      setRefreshing(true);
      const response = await fetch(`/api/licenses/historique?installationId=${installationId}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const data = await response.json();
      setRemplacements(data);

      if (showToast) {
        toast.success("Historique actualisé avec succès");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la récupération de l'historique");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [installationId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les remplacements
  const filteredRemplacements = useMemo(() => {
    if (!searchTerm) return remplacements;
    
    const searchLower = searchTerm.toLowerCase();
    return remplacements.filter(r => 
      r.ancienNomPoste?.toLowerCase().includes(searchLower) ||
      r.nouveauNomPoste?.toLowerCase().includes(searchLower) ||
      r.ancienNomUtilisateur?.toLowerCase().includes(searchLower) ||
      r.nouveauNomUtilisateur?.toLowerCase().includes(searchLower) ||
      r.motif?.toLowerCase().includes(searchLower) ||
      r.license.typeLicense.toLowerCase().includes(searchLower)
    );
  }, [remplacements, searchTerm]);

  if (!installationId) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <History className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune licence sélectionnée
          </h2>
          <p className="text-gray-500 text-center mb-4">
            Veuillez sélectionner une licence dans la liste pour afficher son historique.
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/licenses')}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            Retourner à la liste des licences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Historique des modifications
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher dans l'historique..."
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
              size="icon"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="bg-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Badge variant="outline" className="bg-white">
            Installation #{installationId}
          </Badge>
          <Badge variant="outline" className="bg-white">
            {filteredRemplacements.length} modification{filteredRemplacements.length !== 1 ? 's' : ''}
          </Badge>
          {searchTerm && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              <Filter className="w-3 h-3 mr-1" />
              Filtré sur: {searchTerm}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredRemplacements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {searchTerm 
                ? "Aucune modification ne correspond à votre recherche."
                : "Aucune modification trouvée pour cette installation."}
            </p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Effacer la recherche
              </Button>
            )}
          </div>
        ) : (
          filteredRemplacements.map((remplacement) => (
            <Card 
              key={remplacement.id} 
              className="w-full hover:shadow-md transition-shadow bg-white border-gray-200"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        {remplacement.license.typeLicense}
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(remplacement.dateRemplacement)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Changements effectués */}
                  <div className="space-y-4">
                    {remplacement.ancienNomPoste !== remplacement.nouveauNomPoste && (
                      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Monitor className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-700">Changement de Poste</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 bg-white px-2 py-1 rounded">
                            {remplacement.ancienNomPoste}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            {remplacement.nouveauNomPoste}
                          </span>
                        </div>
                      </div>
                    )}

                    {remplacement.ancienNomUtilisateur !== remplacement.nouveauNomUtilisateur && (
                      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-700">Changement d'Utilisateur</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 bg-white px-2 py-1 rounded">
                            {remplacement.ancienNomUtilisateur}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            {remplacement.nouveauNomUtilisateur}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informations complémentaires */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Organisation:</span>
                      <span className="bg-white px-2 py-1 rounded">
                        {remplacement.installation.organisation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">N° Facture:</span>
                      <span className="bg-white px-2 py-1 rounded">
                        {remplacement.installation.numeroFacture}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Date Facture:</span>
                      <span className="bg-white px-2 py-1 rounded">
                        {formatDate(remplacement.installation.dateFacture)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section motif */}
                {remplacement.motif && remplacement.motif.trim() !== "" && (
                  <>
                    <Separator className="my-4" />
                    <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        Motif du remplacement:
                      </span>
                      <p className="mt-2 text-gray-600">
                        {remplacement.motif}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
