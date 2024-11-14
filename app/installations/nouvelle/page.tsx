'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return now.toISOString().split('T')[0];
};

const initialMateriel: Materiel = {
  typeMateriel: '',
  marque: '',
  modele: '',
  numeroSerie: '',
  dateInstallation: getCurrentDate()
};

function useSuggestions(field: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/suggestions?field=${field}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des suggestions');
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchSuggestions();
  }, [field]);

  return suggestions;
}

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

  const nomSuggestions = useSuggestions('nom');
  const organisationSuggestions = useSuggestions('organisation');
  const clientSuggestions = useSuggestions('client');
  const boutiqueSuggestions = useSuggestions('boutique');
  const typeMaterielSuggestions = useSuggestions('typeMateriel');
  const marqueSuggestions = useSuggestions('marque');

  const handleChange = useCallback((name: string, value: string, index?: number) => {
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

  const AutocompleteInput = ({ name, value, onChange, suggestions, placeholder }: { name: string, value: string, onChange: (name: string, value: string) => void, suggestions: string[], placeholder: string }) => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Rechercher ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  onSelect={() => {
                    onChange(name, suggestion);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === suggestion ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Créer une nouvelle installation</h1>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom de l'installation</label>
              <AutocompleteInput
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                suggestions={nomSuggestions}
                placeholder="Nom de l'installation"
              />
            </div>
            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-gray-700">Organisation</label>
              <AutocompleteInput
                name="organisation"
                value={formData.organisation}
                onChange={handleChange}
                suggestions={organisationSuggestions}
                placeholder="Organisation"
              />
            </div>
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client</label>
              <AutocompleteInput
                name="client"
                value={formData.client}
                onChange={handleChange}
                suggestions={clientSuggestions}
                placeholder="Client"
              />
            </div>
            <div>
              <label htmlFor="boutique" className="block text-sm font-medium text-gray-700">Boutique</label>
              <AutocompleteInput
                name="boutique"
                value={formData.boutique}
                onChange={handleChange}
                suggestions={boutiqueSuggestions}
                placeholder="Boutique"
              />
            </div>
            <div>
              <label htmlFor="numeroFacture" className="block text-sm font-medium text-gray-700">Numéro de facture</label>
              <input
                id="numeroFacture"
                type="text"
                name="numeroFacture"
                value={formData.numeroFacture}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="dateFacture" className="block text-sm font-medium text-gray-700">Date de facture</label>
              <input
                id="dateFacture"
                type="date"
                name="dateFacture"
                value={formData.dateFacture}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Matériels</h2>
            {formData.materiels.map((materiel, index) => (
              <Card key={index} className="p-6 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Matériel {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`materiel-typeMateriel-${index}`} className="block text-sm font-medium text-gray-700">Type de matériel</label>
                    <AutocompleteInput
                      name={`materiel-typeMateriel-${index}`}
                      value={materiel.typeMateriel}
                      onChange={(name, value) => handleChange(name, value, index)}
                      suggestions={typeMaterielSuggestions}
                      placeholder="Type de matériel"
                    />
                  </div>
                  <div>
                    <label htmlFor={`materiel-marque-${index}`} className="block text-sm font-medium text-gray-700">Marque</label>
                    <AutocompleteInput
                      name={`materiel-marque-${index}`}
                      value={materiel.marque}
                      onChange={(name, value) => handleChange(name, value, index)}
                      suggestions={marqueSuggestions}
                      placeholder="Marque"
                    />
                  </div>
                  <div>
                    <label htmlFor={`materiel-modele-${index}`} className="block text-sm font-medium text-gray-700">Modèle</label>
                    <input
                      id={`materiel-modele-${index}`}
                      type="text"
                      name={`materiel-modele-${index}`}
                      value={materiel.modele}
                      onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`materiel-numeroSerie-${index}`} className="block text-sm font-medium text-gray-700">Numéro de série</label>
                    <input
                      id={`materiel-numeroSerie-${index}`}
                      type="text"
                      name={`materiel-numeroSerie-${index}`}
                      value={materiel.numeroSerie}
                      onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
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
          <div className="mt-8">
            <Button type="submit" disabled={loading} className="w-full py-2 px-4">
              {loading ? 'Création en cours...' : 'Créer l\'installation'}
            </Button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}