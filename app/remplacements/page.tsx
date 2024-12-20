"use client"
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FaPlus, FaTools, FaBoxOpen, FaCalendarAlt, FaBarcode } from 'react-icons/fa';
import { Card } from "@/components/ui/card"; // Importation du composant Card de Shadcn
import { Input } from "@/components/ui/input"; // Importation du composant Input de Shadcn
import { ToastContainer, toast } from 'react-toastify'; // Importation de Toastify
import 'react-toastify/dist/ReactToastify.css'; // Styles de Toastify

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
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <div className="grid grid-cols-1 gap-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6 bg-white border rounded-lg shadow-lg">
            <div className="h-6 mb-4 bg-gray-200 animate-pulse" />
            <div className="h-4 mb-2 bg-gray-200 animate-pulse" />
            <div className="h-4 mb-2 bg-gray-200 animate-pulse" />
            <div className="h-4 mb-2 bg-gray-200 animate-pulse" />
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Liste des Remplacements</h1>
        <Link 
          href="/remplacements/nouveau" 
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-300 shadow-md text-center w-full sm:w-auto flex items-center"
        >
          <FaPlus className="inline mr-2" /> Nouveau Remplacement
        </Link>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher par nom d'installation ou marque de matériel"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-blue-500 shadow-sm transition duration-200 ease-in-out"
        />
      </div>

      {filteredAndSortedRemplacements.length === 0 ? (
        <Card className="text-gray-500 text-center text-lg bg-white p-8 rounded-lg shadow">Aucun remplacement trouvé.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-y-8">
          {filteredAndSortedRemplacements.map((remplacement) => (
            <Card key={remplacement.id} className={`p-6 border-l-4 rounded-lg shadow-lg transition duration-300 hover:bg-gray-100 hover:border-blue-600`}>
              {/* Affichage des informations de l'installation */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-600">Installation</h3>
                <p><strong>Nom:</strong> {remplacement.installation?.nom || 'N/A'}</p>
                <p><strong>Organisation:</strong> {remplacement.installation?.organisation || 'N/A'}</p>
                <p><strong>Date de création:</strong> {formatDateFR(remplacement.installation?.dateCreation || '')}</p>
              </div>

              {/* Affichage des informations sur les matériels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                {/* Ancien Matériel */}
                <div className="bg-red-50 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-red-600 flex items-center">
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
                <div className="bg-green-50 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-green-600 flex items-center">
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