'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from "@/components/ui/skeleton";

interface Materiel {
  typeMateriel: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  dateInstallation: string;
}

interface FormData {
  nom: string;
  organisation: string;
  client: string;
  boutique: string;
  numeroFacture: string;
  dateFacture: string;
  materiels: Materiel[];
}

const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString('fr-FR');
};

const initialMateriel: Materiel = {
  typeMateriel: '',
  marque: '',
  modele: '',
  numeroSerie: '',
  dateInstallation: getCurrentDate()
};

export default function CreateInstallation() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    organisation: '',
    client: '',
    boutique: '',
    numeroFacture: '',
    dateFacture: '',
    materiels: [{ ...initialMateriel }]
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.startsWith('materiel-') && index !== undefined) {
        const field = name.split('-')[1] as keyof Materiel;
        const newMateriels = [...prev.materiels];
        newMateriels[index] = { ...newMateriels[index], [field]: value };
        return { ...prev, materiels: newMateriels };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const addMateriel = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      materiels: [...prev.materiels, { ...initialMateriel, dateInstallation: getCurrentDate() }]
    }));
  }, []);

  const removeMateriel = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      materiels: prev.materiels.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Une erreur est survenue');
      }
      toast.success('Installation créée avec succès!');
      router.push('/installations');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100">Créer une nouvelle installation</h1>
        {error && (
          <div className="p-4 mb-6 border-l-4 border-red-400 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-500" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 mb-4 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'installation</label>
              <input id="nom" type="text" name="nom" value={formData.nom} onChange={handleChange} onKeyDown={handleKeyDown} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400" />
            </div>
            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organisation</label>
              <input id="organisation" type="text" name="organisation" value={formData.organisation} onChange={handleChange} onKeyDown={handleKeyDown} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400" />
            </div>
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
              <input id="client" type="text" name="client" value={formData.client} onChange={handleChange} onKeyDown={handleKeyDown} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400" />
            </div>
            <div>
              <label htmlFor="boutique" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Boutique</label>
              <input id="boutique" type="text" name="boutique" value={formData.boutique} onChange={handleChange} onKeyDown={handleKeyDown} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400" />
            </div>
            <div>
              <label htmlFor="numeroFacture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de facture</label>
              <input id="numeroFacture" type="text" name="numeroFacture" value={formData.numeroFacture} onChange={handleChange} onKeyDown={handleKeyDown} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400" />
            </div>
            <div>
              <label htmlFor="dateFacture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de facture</label>
              <input id="dateFacture" type="date" name="dateFacture" value={formData.dateFacture} onChange={handleChange} onKeyDown={handleKeyDown} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400" />
            </div>
          </div>
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">Matériels</h2>
            {formData.materiels.map((materiel, index) => (
              <Card key={index} className="p-6 mb-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Matériel {index + 1}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(materiel).map(([key, value]) => (
                    key !== 'dateInstallation' && (
                      <div key={key}>
                        <label htmlFor={`materiel-${key}-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key === 'typeMateriel' ? 'Type de matériel' : key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <input
                          id={`materiel-${key}-${index}`}
                          type="text"
                          name={`materiel-${key}`}
                          value={value}
                          onChange={(e) => handleChange(e, index)}
                          onKeyDown={handleKeyDown}
                          required
                          className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                        />
                      </div>
                    )
                  ))}
                </div>
                {formData.materiels.length > 1 && (
                  <Button variant="destructive" onClick={() => removeMateriel(index)} className="mt-4">
                    Supprimer ce matériel
                  </Button>
                )}
              </Card>
            ))}
            <Button variant="outline" onClick={addMateriel} className="mt-4">
              Ajouter un matériel
            </Button>
          </div>
          <div className="flex justify-end space-x-4">
            
            <Button
            type="button"
            onClick={() => router.push('/installations')}
            className="py-4 text-white transition-colors bg-gray-500 rounded-lg px-9 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading} 
              className="py-4 text-white transition-colors bg-gray-500 rounded-lg px-9 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700">
              {loading ? 'Création en cours...' : 'Créer l\'installation'}
            </Button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
