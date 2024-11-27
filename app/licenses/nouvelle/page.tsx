'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface License {
  typeLicense: string;
  description: string;
}

interface FormData {
  nomPoste: string;
  nomUtilisateur: string; // Added user name field
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
    nomUtilisateur: '', // Initialize user name
    organisation: 'American Vintage',
    numeroFacture: '',
    dateFacture: getCurrentDate(),
    licenses: [{ ...initialLicense }]
  });

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Créer une nouvelle installation de licence</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nomPoste" className="block text-sm font-medium text-gray-700">Nom du poste</label>
              <input
                id="nomPoste"
                type="text"
                name="nomPoste"
                value={formData.nomPoste}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="nomUtilisateur" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <input
                id="nomUtilisateur"
                type="text"
                name="nomUtilisateur" // User name field
                value={formData.nomUtilisateur}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-gray-700">Organisation</label>
              <input
                id="organisation"
                type="text"
                name="organisation"
                value={formData.organisation}
                readOnly // Set as read-only with fixed value
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="numeroFacture" className="block text-sm font-medium text-gray-700">Numéro de facture</label>
              <input
                id="numeroFacture"
                type="text"
                name="numeroFacture"
                value={formData.numeroFacture}
                onChange={handleChange}
                required
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
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Licenses Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Licences</h2>
            {formData.licenses.map((license, index) => (
              <Card key={index} className="p-6 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Licence {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`license-typeLicense-${index}`} className="block text-sm font-medium text-gray-700">Type de licence</label>
                    <select
                      id={`license-typeLicense-${index}`}
                      name={`license-typeLicense`}
                      value={license.typeLicense}
                      onChange={(e) => handleChange(e, index)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sélectionnez le Type de Licence</option>
                      <option value="STARMAG3">STARMAG3</option>
                      <option value="STARGEST">STARGEST</option>
                      <option value="PREPATAB_WINDOWS">PREPATAB WINDOWS</option>
                      <option value="PREPATAB_ANDROID">PREPATAB ANDROID</option>
                      <option value="PREPATAB_RETAIL_ANDROID">PREPATAB RETAIL ANDROID</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`license-description-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      id={`license-description-${index}`}
                      type="text"
                      name={`license-description`}
                      value={license.description}
                      onChange={(e) => handleChange(e, index)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Remove License Button */}
                {formData.licenses.length > 1 && (
                  <Button variant="destructive" onClick={() => removeLicense(index)} className="mt-4">
                    Supprimer cette licence
                  </Button>
                )}
              </Card>
            ))}
            {/* Add License Button */}
            <Button variant="outline" onClick={addLicense} className="mt-4">
              Ajouter une licence
            </Button>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button type="submit" disabled={loading} className="w-full py-2 px-4">
              {loading ? 'Création en cours...' : 'Créer l\'installation et les licences'}
            </Button>
          </div>
        </form>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}
