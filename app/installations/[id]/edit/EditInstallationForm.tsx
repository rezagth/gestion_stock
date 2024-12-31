'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Installation, Materiel } from '@prisma/client';
import { FaSpinner } from 'react-icons/fa';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EditInstallationFormProps {
  installation: Installation & { materiels: Materiel[] };
}

export default function EditInstallationForm({ installation }: EditInstallationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState(installation);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [materielToDelete, setMaterielToDelete] = useState<number | null>(null);

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

  const removeMateriel = useCallback(async (index: number) => {
    const materiel = formData.materiels[index];
    if (materiel.id.startsWith('new-')) {
      setFormData(prev => ({
        ...prev,
        materiels: prev.materiels.filter((_, i) => i !== index)
      }));
      return;
    }
    try {
      const response = await fetch(`/api/materiels/${materiel.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression du matériel');
      }
      setFormData(prev => ({
        ...prev,
        materiels: prev.materiels.filter((_, i) => i !== index)
      }));
      toast({
        title: "Succès",
        description: "Matériel supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || 'Erreur lors de la suppression du matériel',
        variant: "destructive",
      });
    }
  }, [formData.materiels, toast]);

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
    setIsSubmitting(true);
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
        toast({
          title: "Succès",
          description: "Installation mise à jour avec succès!",
        });
        router.push('/installations/');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || 'Une erreur est survenue',
        variant: "destructive",
      });
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionClass = "bg-white dark:bg-slate-800 shadow-lg rounded-xl p-8 mb-8 space-y-8";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
  const errorClass = "mt-2 text-sm text-red-600 dark:text-red-400";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-12">
      <div className={sectionClass}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Informations de l'installation</h2>
        {['nom', 'client', 'boutique', 'organisation'].map(field => (
          <div key={field} className="mb-6">
            <label htmlFor={field} className={labelClass}>{capitalizeFirstLetter(field)}</label>
            {isSubmitting ? (
              <Skeleton className="w-full h-10 dark:bg-slate-700" />
            ) : (
              <Input
                type="text"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                aria-describedby={`${field}-error`}
                className="w-full dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700"
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
        <div className="mb-6">
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
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Matériels</h2>
        {formData.materiels.map((materiel, index) => (
          <div key={materiel.id} className="border border-gray-200 dark:border-slate-700 p-6 mb-6 rounded-lg bg-white dark:bg-slate-900 shadow-lg">
            {['marque', 'modele', 'numeroSerie', 'typeMateriel'].map(field => (
              <div key={field} className="mb-6">
                <label htmlFor={`${field}-${index}`} className={labelClass}>{capitalizeFirstLetter(field)}</label>
                {isSubmitting ? (
                  <Skeleton className="w-full h-10 dark:bg-slate-700" />
                ) : (
                  <Input
                    type="text"
                    id={`${field}-${index}`}
                    name={field}
                    value={materiel[field]}
                    onChange={(e) => handleMaterielChange(index, e)}
                    className="w-full dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700"
                  />
                )}
                {errors[`materiel_${index}_${field}`] && (
                  <p className={errorClass}>
                    {errors[`materiel_${index}_${field}`]}
                  </p>
                )}
              </div>
            ))}
            <div className="mb-6">
              <label htmlFor={`dateInstallation-${index}`} className={labelClass}>Date Installation</label>
              {isSubmitting ? (
                <Skeleton className="w-full h-10 dark:bg-slate-700" />
              ) : (
                <Input
                  type="date"
                  id={`dateInstallation-${index}`}
                  name="dateInstallation"
                  value={materiel.dateInstallation ? new Date(materiel.dateInstallation).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleMaterielChange(index, e)}
                  className="w-full dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700"
                />
              )}
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                setMaterielToDelete(index);
                setDialogOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
            >
              Supprimer le matériel
            </Button>
          </div>
        ))}
        <Button
          onClick={addMateriel}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
        >
          Ajouter un matériel
        </Button>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={() => router.push('/installations')}
          className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Mise à jour...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark:bg-slate-800 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold dark:text-gray-100">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer ce matériel ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-300 dark:border-slate-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (materielToDelete !== null) {
                  removeMateriel(materielToDelete);
                  setDialogOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

const capitalizeFirstLetter = (str: string) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};
