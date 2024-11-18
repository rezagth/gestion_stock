'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Installation, Materiel } from '@prisma/client';

interface EditInstallationFormProps {
  installation: Installation & { materiels: Materiel[] };
}

export default function EditInstallationForm({ installation }: EditInstallationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(installation);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleMaterielChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      materiels: prev.materiels.map((m, i) => i === index ? { ...m, [name]: value } : m)
    }));
  }, []);

  const addMateriel = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      materiels: [...prev.materiels, {
        id: `new-${Date.now()}`,
        marque: '',
        modele: '',
        numeroSerie: '',
        typeMateriel: '',
        dateInstallation: new Date().toISOString(),
        installationId: installation.id
      }]
    }));
  }, [installation.id]);

  const removeMateriel = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      materiels: prev.materiels.filter((_, i) => i !== index)
    }));
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nom) newErrors.nom = "Le nom est requis";
    if (!formData.client) newErrors.client = "Le client est requis";
    if (!formData.boutique) newErrors.boutique = "La boutique est requise";
    
    formData.materiels.forEach((materiel, index) => {
      ['marque', 'modele', 'numeroSerie', 'typeMateriel', 'dateInstallation'].forEach(field => {
        if (!materiel[field]) newErrors[`materiel_${index}_${field}`] = `Le ${field} est requis`;
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/installations/${installation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          materiels: formData.materiels.map(m => ({
            ...m,
            dateInstallation: new Date(m.dateInstallation).toISOString()
          }))
        }),
      });

      if (response.ok) {
        router.push('/installations/');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrors({ submit: error.message });
    }
  };

  const inputClass = "w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";
  const sectionClass = "bg-white shadow-lg rounded-xl p-6 mb-8 space-y-6";
  const buttonClass = "w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  const errorClass = "mt-2 text-sm text-red-600";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-12">
      <div className={sectionClass}>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Informations de l'installations</h2>
        {['nom', 'client', 'boutique', 'organisation'].map(field => (
          <div key={field} className="mb-5">
            <label htmlFor={field} className={labelClass}>{capitalizeFirstLetter(field)}</label>
            <input
              type="text"
              id={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className={inputClass}
              aria-describedby={`${field}-error`}
            />
            {errors[field] && <p id={`${field}-error`} className={errorClass}>{errors[field]}</p>}
          </div>
        ))}
      </div>

      <div className={sectionClass}>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Informations de facturation</h2>
        {['numeroFacture'].map(field => (
          <div key={field} className="mb-5">
            <label htmlFor={field} className={labelClass}>{capitalizeFirstLetter(field)}</label>
            <input
              type="text"
              id={field}
              name={field}
              value={formData[field] || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        ))}
        <div className="mb-5">
          <label htmlFor="dateFacture" className={labelClass}>Date de facture</label>
          <input
            type="date"
            id="dateFacture"
            name="dateFacture"
            value={formData.dateFacture ? new Date(formData.dateFacture).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div className="mb-5">
          <label htmlFor="status" className={labelClass}>Statut</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Matériels</h2>
        {formData.materiels.map((materiel, index) => (
          <div key={materiel.id} className="border border-gray-200 p-5 mb-6 rounded-lg shadow-md">
            {['marque', 'modele', 'numeroSerie', 'typeMateriel'].map(field => (
              <div key={field} className="mb-4">
                <label htmlFor={`${field}-${index}`} className={labelClass}>{capitalizeFirstLetter(field)}</label>
                <input
                  type="text"
                  id={`${field}-${index}`}
                  name={field}
                  value={materiel[field]}
                  onChange={(e) => handleMaterielChange(index, e)}
                  className={inputClass}
                  aria-describedby={`materiel_${index}_${field}-error`}
                />
                {errors[`materiel_${index}_${field}`] && (
                  <p id={`materiel_${index}_${field}-error`} className={errorClass}>
                    {errors[`materiel_${index}_${field}`]}
                  </p>
                )}
              </div>
            ))}
            <div className="mb-4">
              <label htmlFor={`dateInstallation-${index}`} className={labelClass}>Date d'installation</label>
              <input
                type="date"
                id={`dateInstallation-${index}`}
                name="dateInstallation"
                value={new Date(materiel.dateInstallation).toISOString().split('T')[0]}
                onChange={(e) => handleMaterielChange(index, e)}
                className={inputClass}
              />
              {errors[`materiel_${index}_dateInstallation`] && (
                <p className={errorClass}>{errors[`materiel_${index}_dateInstallation`]}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeMateriel(index)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              Supprimer ce matériel
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMateriel}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
        >
          Ajouter un matériel
        </button>
      </div>

      {errors.submit && <p className="text-red-600 text-center">{errors.submit}</p>}

      <button type="submit" className={buttonClass}>
        Mettre à jour l'installation
      </button>
    </form>
  );
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
