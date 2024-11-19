"use client"
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Materiel } from '@prisma/client';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FaTools, FaBoxOpen } from 'react-icons/fa';

export default function SuiviMaterielPage() {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installationId, setInstallationId] = useState<number | null>(null);  // Installation ID state

  // Fonction pour récupérer les matériels depuis l'API
  useEffect(() => {
    const fetchMateriels = async () => {
      const queryParams = installationId ? `?installationId=${installationId}` : '';  // Ajout de l'ID si disponible
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
  }, [installationId]);  // Dépend de installationId

  // Filtrer les matériels en fonction du terme de recherche
  const filteredMateriels = useMemo(() => {
    return materiels.filter(materiel =>
      materiel.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.typeMateriel?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materiels, searchTerm]);

  // Trier les matériels par date d'installation
  const sortedMateriels = useMemo(() => {
    return filteredMateriels.sort((a, b) => new Date(b.dateInstallation).getTime() - new Date(a.dateInstallation).getTime());
  }, [filteredMateriels]);

  // Afficher un écran de chargement
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

  // Afficher une erreur si la récupération échoue
  if (error) return (
    <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
  );

  // Fonction pour formater la date au format français
  const formatDateFr = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
                  {materiel.typeMateriel === 'outil' ? (
                    <FaTools className="text-xl mr-2 text-blue-600" />
                  ) : (
                    <FaBoxOpen className="text-xl mr-2 text-green-600" />
                  )}
                  <h2 className="text-xl font-semibold text-card-foreground">{materiel.marque} {materiel.modele}</h2>
                </div>
                <p><span className="font-medium">Type :</span> {materiel.typeMateriel}</p>
                <p><span className="font-medium">Numéro de série :</span> {materiel.numeroSerie}</p>
                <p><span className="font-medium">Installé le :</span> {formatDateFr(materiel.dateInstallation)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
