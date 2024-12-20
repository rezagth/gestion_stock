"use client"
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
          <Card key={index} className="p-6 bg-white border rounded-lg shadow-lg">
            <Skeleton className="h-6 mb-4" />
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-4 mb-2" />
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
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Liste des Matériels</h1>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher par marque, modèle, numéro de série ou type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {sortedMateriels.length === 0 ? (
        <Card className="text-gray-500 text-center text-lg bg-white p-8 rounded-lg shadow">Aucun matériel trouvé.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-y-8">
          {sortedMateriels.map((materiel) => (
            <Link key={materiel.id} href={`/materiels/${materiel.id}`} passHref>
              <Card className={`border-l-4 p-6 rounded-lg shadow-lg transition duration-300 hover:bg-gray-100 hover:border-blue-600`}>
                <div className="flex items-center mb-4">
                  {getStatusIcon(materiel.status, materiel.typeMateriel)}
                  <h2 className="text-xl font-semibold text-card-foreground">{materiel.marque} {materiel.modele}</h2>
                </div>
                <p><span className="font-medium">Type :</span> {materiel.typeMateriel}</p>
                <p className="flex items-center"><FaBarcode className="mr-2" /> <span className="font-medium">Numéro de série :</span> {materiel.numeroSerie}</p>
                <p className="flex items-center"><FaCalendarAlt className="mr-2" /> <span className="font-medium">Installé le :</span> {formatDateFr(materiel.dateInstallation)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}