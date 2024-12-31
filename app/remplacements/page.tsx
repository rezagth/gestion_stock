"use client"
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FaPlus, FaTools, FaBoxOpen, FaCalendarAlt, FaBarcode } from 'react-icons/fa';
import { Card, CardContent } from "@/components/ui/card"; // Importation du composant Card de Shadcn
import { Input } from "@/components/ui/input"; // Importation du composant Input de Shadcn
import { ToastContainer, toast } from 'react-toastify'; // Importation de Toastify
import 'react-toastify/dist/ReactToastify.css'; // Styles de Toastify
import { CustomSkeleton } from "@/components/ui/custom-skeleton";
import { Skeleton } from '@/components/ui/skeleton';

interface Remplacement {
  id: string;
  dateRemplacement: string;
  installation: {
    id: number;
    nom: string;
    dateCreation: string;
    organisation: string;
  } | null;
  ancienMateriel: {
    id: string;
    marque: string;
    modele: string;
    numeroSerie: string;
    typeMateriel: string;
    dateInstallation: string;
  } | null;
  nouveauMateriel: {
    id: string;
    marque: string;
    modele: string;
    numeroSerie: string;
    typeMateriel: string;
    dateInstallation: string;
  } | null;
}

const Remplacements = () => {
  const [remplacements, setRemplacements] = useState<Remplacement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRemplacements();
  }, []);

  const fetchRemplacements = async () => {
    try {
      const response = await fetch('/api/remplacements');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des remplacements');
      }
      const data = await response.json();
      setRemplacements(data.remplacements);
      toast.success('Remplacements chargés avec succès !');
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error("Erreur lors du chargement des remplacements");
      setIsLoading(false);
    }
  };

  const filteredAndSortedRemplacements = useMemo(() => {
    return remplacements.filter(remplacement =>
      remplacement.installation?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remplacement.ancienMateriel?.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remplacement.nouveauMateriel?.marque.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [remplacements, searchTerm]);

  const formatDateFR = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) return (
    <div className="container py-10 mx-auto">
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-6 mb-4" />
                <Skeleton className="h-4 mb-2" />
                <Skeleton className="h-4 mb-2" />
                <Skeleton className="h-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );

  if (error) return (
    <div className="mt-10 text-xl text-center text-red-500">{error}</div>
  );

  return (
    <div className="px-4 pb-12 mx-auto mt-10 max-w-7xl">
      <ToastContainer />
      <div className="flex flex-col items-center justify-between mb-8 sm:flex-row dark:hover:text-white" >
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:mb-0">Liste des Remplacements</h1>
        <Link 
          href="/remplacements/nouveau" 
          className="flex items-center gap-2 px-6 py-2 text-gray-800 transition-all duration-300 ease-in-out bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 hover:shadow-md dark:bg-slate-800 dark:text-blue-700 dark:hover:bg-slate-950 dark:hover:text-white"
        >
          <FaPlus className="text-gray-600 dark:text-blue-700 " /> Nouveau Remplacement
        </Link>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher par nom d'installation ou marque de matériel"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 transition duration-200 ease-in-out border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>

      {filteredAndSortedRemplacements.length === 0 ? (
        <Card className="p-8 text-lg text-center text-gray-500 bg-white rounded-lg shadow">Aucun remplacement trouvé.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-y-8">
          {filteredAndSortedRemplacements.map((remplacement) => (
            <Card key={remplacement.id} className="p-6 transition-all duration-300 ease-in-out border-l-4 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-800/50">
              {/* Affichage des informations de l'installation */}
              <div className="mb-4">
                <h3 className="mb-2 font-semibold text-blue-600 mbtext-lg">Installation n°{remplacement.installation?.id} </h3>
                <p><strong>Nom:</strong> {remplacement.installation?.nom || 'N/A'}</p>
                <p><strong>Organisation:</strong> {remplacement.installation?.organisation || 'N/A'}</p>
                <p><strong>Date de création:</strong> {formatDateFR(remplacement.installation?.dateCreation || '')}</p>
              </div>

              {/* Affichage des informations sur les matériels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                {/* Ancien Matériel */}
                <div className="p-4 transition-all duration-300 ease-in-out rounded-lg shadow-sm bg-red-50/50 dark:bg-red-900/10 hover:shadow-md dark:hover:bg-red-900/45">
                  <h3 className="flex items-center font-semibold text-red-600"> 
                    <FaTools className="mr-2" /> Ancien Matériel
                  </h3>
                  {remplacement.ancienMateriel ? (
                    <>
                      <p><strong>Marque/Modèle:</strong> {remplacement.ancienMateriel.marque} {remplacement.ancienMateriel.modele}</p>
                      <p className="flex items-center"><FaBarcode className="mr-1" /><strong>N° Série:</strong> {remplacement.ancienMateriel.numeroSerie}</p>
                      <p className="flex items-center"><FaCalendarAlt className="mr-1" /><strong>Installé le:</strong> {formatDateFR(remplacement.ancienMateriel.dateInstallation)}</p>
                    </>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>

                {/* Nouveau Matériel */}
                <div className="p-4 transition-all duration-300 ease-in-out rounded-lg shadow-sm bg-green-50/50 dark:bg-green-900/10 hover:shadow-md dark:hover:bg-green-950">
                  <h3 className="flex items-center font-semibold text-green-600">
                    <FaBoxOpen className="mr-2" /> Nouveau Matériel
                  </h3>
                  {remplacement.nouveauMateriel ? (
                    <>
                      <p><strong>Marque/Modèle:</strong> {remplacement.nouveauMateriel.marque} {remplacement.nouveauMateriel.modele}</p>
                      <p className="flex items-center"><FaBarcode className="mr-1" /><strong>N° Série: </strong> {remplacement.nouveauMateriel.numeroSerie}</p>
                      <p className="flex items-center"><FaCalendarAlt className="mr-1" /><strong>Installé le: </strong> {formatDateFR(remplacement.nouveauMateriel.dateInstallation)}</p>
                    </>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Remplacements;