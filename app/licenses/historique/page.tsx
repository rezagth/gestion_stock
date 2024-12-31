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
      <div className="container mx-auto py-6 dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-slate-700/20">
          <History className="icon icon-muted w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Aucune licence sélectionnée
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
            Veuillez sélectionner une licence dans la liste pour afficher son historique.
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/licenses')}
            className="btn-secondary flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <History className="icon icon-primary" />
            Retourner à la liste des licences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 dark:bg-slate-900">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Historique des modifications
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-slate-700/20 px-3 py-2">
              <Search className="icon icon-muted text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher dans l'historique..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none focus:ring-0 w-64 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchTerm("")}
                  className="h-4 w-4 p-0 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
                >
                  <X className="icon icon-muted" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <RefreshCw className={`icon ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Actualiser</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Badge className="status-badge status-info bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            Installation #{installationId}
          </Badge>
          <Badge className="status-badge status-success bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            {filteredRemplacements.length} modification{filteredRemplacements.length !== 1 ? 's' : ''}
          </Badge>
          {searchTerm && (
            <Badge className="status-badge status-warning bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              <Filter className="icon icon-muted w-3 h-3 mr-1" />
              Filtré sur: {searchTerm}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredRemplacements.length === 0 ? (
          <Card className="card-hover text-center py-12 bg-white dark:bg-slate-800">
            <AlertCircle className="icon icon-muted w-12 h-12 mx-auto mb-4 text-gray-500 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              {searchTerm 
                ? "Aucune modification ne correspond à votre recherche."
                : "Aucune modification trouvée pour cette installation."}
            </p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 dark:text-blue-400"
              >
                Effacer la recherche
              </Button>
            )}
          </Card>
        ) : (
          filteredRemplacements.map((remplacement) => (
            <Card key={remplacement.id} className="bg-white dark:bg-slate-800 hover:shadow-lg dark:hover:shadow-slate-700/20 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <Badge className={`px-3 py-1 rounded-full font-medium ${
                    remplacement.license.status === 'ACTIVE' 
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}>
                    {remplacement.license.typeLicense}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="icon icon-muted w-4 h-4" />
                  {formatDate(remplacement.dateRemplacement)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Monitor className="icon icon-muted w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Poste</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-600 dark:text-gray-300">{remplacement.ancienNomPoste}</span>
                          <ArrowRight className="icon icon-muted w-4 h-4 text-gray-400" />
                          <span className={`text-gray-900 dark:text-gray-100 font-medium ${remplacement.nouveauNomPoste && 'bg-green-100 dark:bg-green-900/40 px-2.5 py-1 rounded-full text-sm border border-green-200 dark:border-green-800'}`}>{remplacement.nouveauNomPoste}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="icon icon-muted w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Utilisateur</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-600 dark:text-gray-300">{remplacement.ancienNomUtilisateur}</span>
                          <ArrowRight className="icon icon-muted w-4 h-4 text-gray-400" />
                          <span className={`text-gray-900 dark:text-gray-100 font-medium ${remplacement.nouveauNomUtilisateur && 'bg-green-100 dark:bg-green-900/40 px-2.5 py-1 rounded-full text-sm border border-green-200 dark:border-green-800'}`}>{remplacement.nouveauNomUtilisateur}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-start gap-3">
                      <Building2 className="icon icon-muted w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Organisation</p>
                        <p className="text-gray-600 dark:text-gray-300">{remplacement.installation.organisation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="icon icon-muted w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Facture</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {remplacement.installation.numeroFacture} 
                          {remplacement.installation.dateFacture && (
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              ({new Date(remplacement.installation.dateFacture).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="icon icon-muted w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Motif du remplacement</p>
                        <p className="text-gray-600 dark:text-gray-300">{remplacement.motif}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
