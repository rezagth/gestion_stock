'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Installation, Materiel } from '@prisma/client';
import { FaSpinner } from 'react-icons/fa'; // React icon for spinner
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton loader component
import { toast } from 'react-toastify'; // Toastify notification

import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface EditInstallationFormProps {
  installation: Installation & { materiels: Materiel[] };
}

export default function EditInstallationForm({ installation }: EditInstallationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(installation);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Errors object
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [selectedMateriel, setSelectedMateriel] = useState<Materiel | null>(null); // Selected material for deletion
  
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

  const removeMateriel = useCallback(async () => {
    if (selectedMateriel === null) return;

    const materiel = selectedMateriel;

    // Si c'est un nouveau matériel (pas encore en base de données), on le supprime juste localement
    if (materiel.id.startsWith('new-')) {
      setFormData(prev => ({
        ...prev,
        materiels: prev.materiels.filter((m) => m.id !== materiel.id)
      }));
      setSelectedMateriel(null);
      return;
    }

    // Sinon, on supprime le matériel de la base de données
    try {
      const response = await fetch(`/api/materiels/${materiel.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression du matériel');
      }

      // Si la suppression a réussi, on met à jour l'état local
      setFormData(prev => ({
        ...prev,
        materiels: prev.materiels.filter((m) => m.id !== materiel.id)
      }));

      toast.success('Matériel supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du matériel');
    } finally {
      setSelectedMateriel(null);
    }
  }, [formData.materiels, selectedMateriel]);

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

    setIsSubmitting(true); // Set loading state to true

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
        toast.success('Installation mise à jour avec succès!');
        router.push('/installations/');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue');
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false); // Reset loading state after submission
    }
  };

  const inputClass = "w-full border border-gray-300 p-4 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200";
  const sectionClass = "bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 mb-8 space-y-8";
  const buttonClass = "w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600";
  const errorClass = "mt-2 text-sm text-red-600";
  const skeletonClass = "w-full h-10 rounded-lg bg-gray-200 animate-pulse";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-12">
      <div className={sectionClass}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Informations de l'installations</h2>
        {['nom', 'client', 'boutique', 'organisation'].map(field => (
          <div key={field} className="mb-6">
            <label htmlFor={field} className={labelClass}>{capitalizeFirstLetter(field)}</label>
            {isSubmitting ? (
              <Skeleton className={skeletonClass} />
            ) : (
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className={`${inputClass} dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                aria-describedby={`${field}-error`}
              />
            )}
            {errors[field] && <p id={`${field}-error`} className={errorClass}>{errors[field]}</p>}
          </div>
        ))}
      </div>
      <div className={sectionClass}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Informations de facturation</h2>
        {['numeroFacture'].map(field => (
          <div key={field} className="mb-6">
            <label htmlFor={field} className={labelClass}>{capitalizeFirstLetter(field)}</label>
            {isSubmitting ? (
              <Skeleton className="w-full h-10 dark:bg-slate-700" />
            ) : (
              <Input
                type="text"
                id={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                className="w-full dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700"
              />
            )}
          </div>
        ))}
        <div className="mb-6">
          <label htmlFor="dateFacture" className={labelClass}>Date de facture</label>
          {isSubmitting ? (
            <Skeleton className="w-full h-10 dark:bg-slate-700" />
          ) : (
            <Input
              type="date"
              id="dateFacture"
              name="dateFacture"
              value={formData.dateFacture ? new Date(formData.dateFacture).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700"
            />
          )}
        </div>
        {/* <div className="mb-6">
          <label htmlFor="status" className={labelClass}>Statut</label>
          {isSubmitting ? (
            <Skeleton className="w-full h-10 dark:bg-slate-700" />
          ) : (
            <Select onValueChange={(value) => handleChange({ target: { name: 'status', value } } as any)}>
              <SelectTrigger className="w-full dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700">
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800">
                <SelectItem value="ACTIVE" className="dark:text-gray-100">Active</SelectItem>
                <SelectItem value="INACTIVE" className="dark:text-gray-100">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div> */}
      </div>
      <div className={sectionClass}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Matériels</h2>
        {formData.materiels.map((materiel, index) => (
          <div key={materiel.id} className="border border-gray-200 dark:border-gray-700 p-6 mb-6 rounded-lg shadow-lg bg-white dark:bg-gray-900 dark:">
            {['marque', 'modele', 'numeroSerie', 'typeMateriel'].map(field => (
              <div key={field} className="mb-6">
                <label htmlFor={`${field}-${index}`} className={labelClass}>{capitalizeFirstLetter(field)}</label>
                {isSubmitting ? (
                  <Skeleton className={skeletonClass} />
                ) : (
                  <input
                    type="text"
                    id={`${field}-${index}`}
                    name={field}
                    value={materiel[field]}
                    onChange={(e) => handleMaterielChange(index, e)}
                    className={`${inputClass} dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    aria-describedby={`materiel_${index}_${field}-error`}
                  />
                )}
                {errors[`materiel_${index}_${field}`] && (
                  <p id={`materiel_${index}_${field}-error`} className={errorClass}>
                    {errors[`materiel_${index}_${field}`]}
                  </p>
                )}
              </div>
            ))}
            <div className="mb-6">
              <label htmlFor={`dateInstallation-${index}`} className={labelClass}>Date Installation</label>
              {isSubmitting ? (
                <Skeleton className={skeletonClass} />
              ) : (
                <input
                  type="date"
                  id={`dateInstallation-${index}`}
                  name="dateInstallation"
                  value={materiel.dateInstallation ? new Date(materiel.dateInstallation).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleMaterielChange(index, e)}
                  className={`${inputClass} dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                />
              )}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  onClick={(  ) => setSelectedMateriel(materiel)}
                  variant={"destructive"}
                >
                  Supprimer le matériel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Êtes-vous sûr ?</DialogTitle>
                <DialogDescription>
                  Vous êtes sur le point de supprimer ce matériel. Cette action est irréversible.
                </DialogDescription>
                <DialogFooter>
                  <DialogClose asChild>
                    <button type="button" className="mr-4">Annuler</button>
                  </DialogClose>
                  <button
                    type="button"
                    onClick={removeMateriel}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
                  >
                    Confirmer
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
        <button
          type="button"
          onClick={addMateriel}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition ease-in-out duration-200 dark:bg-green-500 dark:hover:bg-green-600"
        >
          Ajouter un matériel
        </button>
      </div>

      <div className="flex justify-between mb-5">
        <button
          type="button"
          onClick={() => router.back()} // Use the router to go back
          className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition ease-in-out duration-200 dark:bg-gray-500 dark:hover:bg-gray-600"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClass}
        >
          {isSubmitting ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            'Enregistrer'
          )}
        </button>
      </div>
    </form>
  );
}

// Helper function to capitalize the first letter of each word
const capitalizeFirstLetter = (str: string) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};
