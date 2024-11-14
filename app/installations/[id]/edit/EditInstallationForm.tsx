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

  // Handle basic form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle changes for materiels
  const handleMaterielChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      materiels: prev.materiels.map((m, i) => i === index ? { ...m, [name]: value } : m)
    }));
  }, []);

  // Validate form data
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom) newErrors.nom = "Le nom est requis";
    if (!formData.client) newErrors.client = "Le client est requis";
    if (!formData.boutique) newErrors.boutique = "La boutique est requise";

    formData.materiels.forEach((materiel, index) => {
      if (!materiel.marque) newErrors[`materiel_${index}_marque`] = "La marque est requise";
      if (!materiel.modele) newErrors[`materiel_${index}_modele`] = "Le modèle est requis";
      if (!materiel.numeroSerie) newErrors[`materiel_${index}_numeroSerie`] = "Le numéro de série est requis";
      if (!materiel.typeMateriel) newErrors[`materiel_${index}_typeMateriel`] = "Le type de matériel est requis";
      if (!materiel.dateInstallation) newErrors[`materiel_${index}_dateInstallation`] = "La date d'installation est requise";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/installations/${installation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push(`/installations/`);
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

  // Common input class for form fields
  const inputClass = "w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div>
        <label htmlFor="nom" className="block font-medium">Nom</label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className={inputClass}
          aria-describedby="nom-error"
        />
        {errors.nom && <p id="nom-error" className="text-red-500 text-sm">{errors.nom}</p>}
      </div>

      <div>
        <label htmlFor="client" className="block font-medium">Client</label>
        <input
          type="text"
          id="client"
          name="client"
          value={formData.client}
          onChange={handleChange}
          className={inputClass}
          aria-describedby="client-error"
        />
        {errors.client && <p id="client-error" className="text-red-500 text-sm">{errors.client}</p>}
      </div>

      <div>
        <label htmlFor="boutique" className="block font-medium">Boutique</label>
        <input
          type="text"
          id="boutique"
          name="boutique"
          value={formData.boutique}
          onChange={handleChange}
          className={inputClass}
          aria-describedby="boutique-error"
        />
        {errors.boutique && <p id="boutique-error" className="text-red-500 text-sm">{errors.boutique}</p>}
      </div>

      {/* Optional Fields Section */}
      <div>
        <label htmlFor="organisation" className="block font-medium">Organisation</label>
        <input
          type="text"
          id="organisation"
          name="organisation"
          value={formData.organisation || ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="numeroFacture" className="block font-medium">Numéro de facture</label>
        <input
          type="text"
          id="numeroFacture"
          name="numeroFacture"
          value={formData.numeroFacture || ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="dateFacture" className="block font-medium">Date de facture</label>
        <input
          type="date"
          id="dateFacture"
          name="dateFacture"
          value={formData.dateFacture ? new Date(formData.dateFacture).toISOString().split('T')[0] : ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="status" className="block font-medium">Statut</label>
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

      {/* Materiel Section */}
      <h2 className="text-xl font-semibold mt-6">Matériels</h2>
      {formData.materiels.map((materiel, index) => (
        <div key={materiel.id} className="border p-4 mb-4 rounded">
          {/* Materiel Details */}
          {['marque', 'modele', 'numeroSerie', 'typeMateriel'].map((field, idx) => (
            <div key={idx}>
              <label htmlFor={`${field}-${index}`} className="block font-medium">{capitalizeFirstLetter(field)}</label>
              <input
                type="text"
                id={`${field}-${index}`}
                name={field}
                value={materiel[field]}
                onChange={(e) => handleMaterielChange(index, e)}
                className={inputClass}
                aria-describedby={`materiel_${index}_${field}-error`}
              />
              {errors[`materiel_${index}_${field}`] && <p id={`materiel_${index}_${field}-error`} className="text-red-500 text-sm">{errors[`materiel_${index}_${field}`]}</p>}
            </div>
          ))}

          {/* Date Installation */}
          <div>
            <label htmlFor={`dateInstallation-${index}`} className="block font-medium">Date d'installation</label>
            <input
              type="date"
              id={`dateInstallation-${index}`}
              name="dateInstallation"
              value={new Date(materiel.dateInstallation).toISOString().split('T')[0]}
              onChange={(e) => handleMaterielChange(index, e)}
              className={inputClass}
            />
            {errors[`materiel_${index}_dateInstallation`] && <p className="text-red-500 text-sm">{errors[`materiel_${index}_dateInstallation`]}</p>}
          </div>
        </div>
      ))}

      {errors.submit && <p className="text-red-500 text-center">{errors.submit}</p>}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        Mettre à jour
      </button>
    </form>
  );
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
