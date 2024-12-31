"use client"
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomSkeleton } from "@/components/ui/custom-skeleton";
import { FaPlus, FaTools, FaBoxOpen, FaCalendarAlt, FaBarcode } from 'react-icons/fa';

// Définition du type Materiel basé sur votre schéma Prisma
type Materiel = {
  id: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  typeMateriel: string;
  dateInstallation: string;
  status: 'INSTALLE' | 'REMPLACE' | 'EN_REPARATION';
  remplacementsSuivants?: Array<{
    dateRemplacement: string;
    nouveauMateriel: {
      marque: string;
      modele: string;
    };
  }>;
};

export default function SuiviMaterielPage() {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installationId, setInstallationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMateriels = async () => {
      const queryParams = installationId ? `?installationId=${installationId}` : '';
      try {
        const response = await fetch(`/api/materiels${queryParams}`);
        if (!response.ok) {
          throw new Error('Échec de la récupération des matériels');
        }
        const data = await response.json();
        setMateriels(data);
      } catch (err) {
        setError("Erreur lors du chargement des matériels");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMateriels();
  }, [installationId]);

  const filteredMateriels = useMemo(() => {
    return materiels.filter(materiel =>
      materiel.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.typeMateriel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materiels, searchTerm]);

  const sortedMateriels = useMemo(() => {
    return filteredMateriels.sort((a, b) => new Date(b.dateInstallation).getTime() - new Date(a.dateInstallation).getTime());
  }, [filteredMateriels]);

  if (isLoading) return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <div className="grid grid-cols-1 gap-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
            <CustomSkeleton className="h-6 mb-4" />
            <CustomSkeleton className="h-4 mb-2" />
            <CustomSkeleton className="h-4 mb-2" />
            <CustomSkeleton className="h-4 mb-2" />
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
  );

  const formatDateFr = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string, typeMateriel: string) => {
    if (status === 'REMPLACE') {
      return <FaTools className="text-xl mr-2 text-orange-600" />;
    } else if (typeMateriel === 'outil') {
      return <FaTools className="text-xl mr-2 text-blue-600" />;
    } else {
      return <FaBoxOpen className="text-xl mr-2 text-green-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Liste des Matériels</h1>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher par marque, modèle, numéro de série ou type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      {sortedMateriels.length === 0 ? (
        <Card className="text-gray-500 dark:text-gray-400 text-center text-lg bg-white dark:bg-gray-800 p-8 rounded-lg shadow dark:shadow-gray-700">Aucun matériel trouvé.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-y-8">
          {sortedMateriels.map((materiel) => (
            <Link key={materiel.id} href={`/materiels/${materiel.id}`} passHref>
              <Card className={`border-l-4 p-6 rounded-lg shadow-lg transition duration-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-600 dark:border-gray-700`}>
                <div className="flex items-center mb-4">
                  {getStatusIcon(materiel.status, materiel.typeMateriel)}
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{materiel.marque} {materiel.modele}</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium text-gray-900 dark:text-gray-100">Type :</span> {materiel.typeMateriel}</p>
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <FaBarcode className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Numéro de série :</span> {materiel.numeroSerie}
                </p>
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <FaCalendarAlt className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Installé le :</span> {formatDateFr(materiel.dateInstallation)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}