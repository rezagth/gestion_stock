'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"; // Importation du composant Button
import { ToastContainer, toast } from 'react-toastify'; // Importation de Toastify
import 'react-toastify/dist/ReactToastify.css'; // Styles de Toastify

type Materiel = {
  id: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  typeMateriel: string;
  dateInstallation: string;
}

type Installation = {
  id: string;
  nom: string;
}

function getCurrentDateFR() {
  const now = new Date();
  return now.toLocaleDateString('fr-CA'); // Format YYYY-MM-DD
}

export default function RemplacementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(null);
  const [materiels, setMateriels] = useState<Materiel[]>([]); // Liste des matériels associés à l'installation
  const [nouveauMateriel, setNouveauMateriel] = useState<Materiel>({
    id: '',
    marque: '',
    modele: '',
    numeroSerie: '',
    typeMateriel: '',
    dateInstallation: getCurrentDateFR()
  });

  // Récupération des installations lors du chargement du composant
  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const res = await fetch('/api/installations');
        if (!res.ok) throw new Error('Erreur lors de la récupération des installations');
        const data = await res.json();
        setInstallations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur lors du chargement des installations:', err);
        setError('Impossible de charger les installations');
        toast.error('Impossible de charger les installations');
      }
    };
    fetchInstallations();
  }, []);

  // Récupération des matériels lorsque l'installation sélectionnée change
  useEffect(() => {
    const fetchMateriels = async () => {
      if (selectedInstallation) {
        try {
          // Fetch les matériels de l'installation sélectionnée
          const res = await fetch(`/api/materiels?installationId=${selectedInstallation}`);
          if (!res.ok) throw new Error('Erreur lors de la récupération des matériels');
          const data = await res.json();
          setMateriels(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Erreur lors du chargement des matériels:', err);
          setError('Impossible de charger les matériels');
          toast.error('Impossible de charger les matériels');
        }
      } else {
        setMateriels([]); // Si aucune installation n'est sélectionnée, réinitialiser la liste des matériels
      }
    };
    fetchMateriels();
  }, [selectedInstallation]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedInstallation) {
      setError('Veuillez sélectionner une installation');
      toast.error('Veuillez sélectionner une installation');
      return;
    }
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const replacementData = {
      installationId: selectedInstallation,
      ancienMaterielId: formData.get('ancienMateriel') as string,
      nouveauMateriel: {
        ...nouveauMateriel,
        dateInstallation: new Date(nouveauMateriel.dateInstallation).toISOString()
      }
    };

    try {
      const response = await fetch('/api/remplacements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replacementData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du remplacement');
      }

      toast.success('Remplacement effectué avec succès');
      router.push('/remplacements');
    } catch (error) {
      console.error('Erreur lors du remplacement:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors du remplacement. Veuillez réessayer.');
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors du remplacement');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des changements dans le nouveau matériel
  const handleNouveauMaterielChange = (field: keyof Materiel, value: string) => {
    setNouveauMateriel(prev => ({ ...prev, [field]: value }));
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Empêche la soumission du formulaire avec "Entrée"
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Nouveau Remplacement</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        
        <div>
          <label htmlFor="installation" className="block text-sm font-medium text-gray-700">Installation</label>
          <select
            id="installation"
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            value={selectedInstallation || ''}
            onChange={(e) => setSelectedInstallation(e.target.value)}
            onKeyDown={handleKeyDown} // Empêche "Entrée"
          >
            <option value="">Sélectionner une installation</option>
            {installations.map((installation) => (
              <option key={installation.id} value={installation.id}>
                {installation.nom}
              </option>
            ))}
          </select>
        </div>

        {selectedInstallation && (
          <div>
            <label htmlFor="ancienMateriel" className="block text-sm font-medium text-gray-700">Matériel à remplacer</label>
            <select
              id="ancienMateriel"
              name="ancienMateriel"
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
              onKeyDown={handleKeyDown} // Empêche "Entrée"
            >
              <option value="">Sélectionner un matériel</option>
              {materiels.length > 0 ? (
                materiels.map((materiel) => (
                  <option key={materiel.id} value={materiel.id}>
                    {materiel.marque} {materiel.modele} ({materiel.numeroSerie})
                  </option>
                ))
              ) : (
                <option value="">Aucun matériel disponible pour cette installation</option>
              )}
            </select>
          </div>
        )}

        {/* Nouveau matériel */}
        <div className="mt-4">
          <label htmlFor="marque" className="block text-sm font-medium text-gray-700">Marque du matériel</label>
          <input
            id="marque"
            type="text"
            value={nouveauMateriel.marque}
            onChange={(e) => handleNouveauMaterielChange('marque', e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
            onKeyDown={handleKeyDown} // Empêche "Entrée"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="modele" className="block text-sm font-medium text-gray-700">Modèle du matériel</label>
          <input
            id="modele"
            type="text"
            value={nouveauMateriel.modele}
            onChange={(e) => handleNouveauMaterielChange('modele', e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
            onKeyDown={handleKeyDown} // Empêche "Entrée"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="numeroSerie" className="block text-sm font-medium text-gray-700">Numéro de série</label>
          <input
            id="numeroSerie"
            type="text"
            value={nouveauMateriel.numeroSerie}
            onChange={(e) => handleNouveauMaterielChange('numeroSerie', e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
            onKeyDown={handleKeyDown} // Empêche "Entrée"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="typeMateriel" className="block text-sm font-medium text-gray-700">Type de matériel</label>
          <input
            id="typeMateriel"
            type="text"
            value={nouveauMateriel.typeMateriel}
            onChange={(e) => handleNouveauMaterielChange('typeMateriel', e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
            onKeyDown={handleKeyDown} // Empêche "Entrée"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="dateInstallation" className="block text-sm font-medium text-gray-700">Date d'installation</label>
          <input
            id="dateInstallation"
            type="date"
            value={nouveauMateriel.dateInstallation}
            onChange={(e) => handleNouveauMaterielChange('dateInstallation', e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            onKeyDown={handleKeyDown} // Empêche "Entrée"
          />
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'En cours...' : 'Effectuer le remplacement'}
          </Button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
