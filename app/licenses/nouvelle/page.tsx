'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface License {
  typeLicense: string;
  description: string;
}

interface FormData {
  nomPoste: string;
  nomUtilisateur: string;
  organisation: string;
  numeroFacture: string;
  dateFacture: string;
  licenses: License[];
}

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const initialLicense: License = {
  typeLicense: '',
  description: ''
};

export default function CreateInstallationLicense() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nomPoste: '',
    nomUtilisateur: '',
    organisation: 'American Vintage',
    numeroFacture: '',
    dateFacture: getCurrentDate(),
    licenses: [{ ...initialLicense }]
  });

  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.startsWith('license-') && index !== undefined) {
        const field = name.split('-')[1] as keyof License;
        const newLicenses = [...prev.licenses];
        newLicenses[index] = { ...newLicenses[index], [field]: value };
        return { ...prev, licenses: newLicenses };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const addLicense = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      licenses: [...prev.licenses, { ...initialLicense }]
    }));
  }, []);

  const removeLicense = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Une erreur est survenue');
      }
      toast.success('Installation et licences créées avec succès!');
      router.push('/licenses');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-8">Créer une nouvelle installation de licence</h1>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nomPoste" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du poste</label>
              <input
                id="nomPoste"
                type="text"
                name="nomPoste"
                value={formData.nomPoste}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
            <div>
              <label htmlFor="nomUtilisateur" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom d'utilisateur</label>
              <input
                id="nomUtilisateur"
                type="text"
                name="nomUtilisateur"
                value={formData.nomUtilisateur}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organisation</label>
              <input
                id="organisation"
                type="text"
                name="organisation"
                value={formData.organisation}
                readOnly
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-300"
              />
            </div>
            <div>
              <label htmlFor="numeroFacture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de facture</label>
              <input
                id="numeroFacture"
                type="text"
                name="numeroFacture"
                value={formData.numeroFacture}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
            <div>
              <label htmlFor="dateFacture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de facture</label>
              <input
                id="dateFacture"
                type="date"
                name="dateFacture"
                value={formData.dateFacture}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Licences</h2>
            {formData.licenses.map((license, index) => (
              <Card key={index} className="p-6 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Licence {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`license-typeLicense-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de licence</label>
                    <select
                      id={`license-typeLicense-${index}`}
                      name={`license-typeLicense`}
                      value={license.typeLicense}
                      onChange={(e) => handleChange(e, index)}
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                    >
                      <option value="">Sélectionnez le Type de Licence</option>
                      <option value="STARMAG3">STARMAG3</option>
                      <option value="STARGEST">STARGEST</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`license-description-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input
                      id={`license-description-${index}`}
                      type="text"
                      name={`license-description`}
                      value={license.description}
                      onChange={(e) => handleChange(e, index)}
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                  </div>
                </div>
                {formData.licenses.length > 1 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => removeLicense(index)} 
                    className="mt-4"
                  >
                    Supprimer cette licence
                  </Button>
                )}
              </Card>
            ))}
            <Button 
              variant="outline" 
              onClick={addLicense} 
              className="mt-4"
            >
              Ajouter une licence
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

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Confirmer la création</DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Êtes-vous sûr de vouloir créer cette installation avec {formData.licenses.length} licence(s) ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="mr-2">
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Création...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
