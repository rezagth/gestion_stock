"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Licence {
  id: number;
  typeLicense: string;
  status: string;
  description: string;
  createdAt: string;
}

interface Installation {
  id: number;
  nomPoste: string;
  nomUtilisateur: string;
  organisation: string;
  numeroFacture: string;
  dateFacture: string;
  createdAt: string;
  licenses: Licence[];
}

export default function EditInstallationPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [changes, setChanges] = useState<Record<string, string>>({});
  
  const router = useRouter();
  
  const [installation, setInstallation] = useState<Installation>({
    id: 0,
    nomPoste: "",
    nomUtilisateur: "",
    organisation: "",
    numeroFacture: "",
    dateFacture: "",
    createdAt: "",
    licenses: [],
  });

  const [originalInstallation, setOriginalInstallation] = useState<Installation | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstallation = async () => {
      try {
        const id = new URLSearchParams(window.location.search).get("installationId");
        if (!id) {
          throw new Error("Installation ID is required");
        }
        const response = await fetch(`/api/licenses/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Installation not found");
          }
          throw new Error("Erreur lors de la récupération des données");
        }
        const data = await response.json();
        setInstallation(data);
        setOriginalInstallation(data); // Stocker l'installation originale
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la récupération des données");
        setLoading(false);
      }
    };
    fetchInstallation();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Mettre à jour l'installation
    setInstallation((prevInstallation) => ({
      ...prevInstallation,
      [name]: value,
    }));

    // Identifier les changements
    if (originalInstallation) {
      const originalValue = originalInstallation[name as keyof Installation];
      if (value !== originalValue) {
        setChanges((prevChanges) => ({
          ...prevChanges,
          [name]: value,
        }));
      } else {
        // Supprimer le champ des changements si la valeur est identique à l'originale
        setChanges((prevChanges) => {
          const updatedChanges = { ...prevChanges };
          delete updatedChanges[name];
          return updatedChanges;
        });
      }
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDialogOpen(true); // Ouvre le dialog
  };

  const confirmUpdate = async () => {
    try {
      const response = await fetch(`/api/licenses/${installation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(installation),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des données");
      }
      toast.success("Installation mise à jour avec succès!");
      router.push("/licenses");
      router.refresh();
      setIsDialogOpen(false); // Ferme le dialog après succès
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour des données");
      setIsDialogOpen(false); // Ferme le dialog en cas d'erreur
    }
  };

  if (loading) {
    return (
      <div className="container w-1/2 py-1 mx-auto">
      <Card className="p-8">
        <Skeleton className="w-full h-48 mb-8" /> {/* Rectangle principal plus haut */}
        <Skeleton className="w-3/4 h-8 mb-6" /> {/* Texte court plus grand */}
        <Skeleton className="w-1/2 h-8 mb-6" /> {/* Texte plus court plus grand */}
        <Skeleton className="w-2/3 h-8 mb-6" /> {/* Texte moyen plus grand */}
        <Skeleton className="w-full h-24 mb-8" /> {/* Nouveau rectangle pour plus de volume */}
        <Skeleton className="w-3/4 h-8" /> {/* Texte final plus grand */}
      </Card>
    </div>

    );
  }

  return (
    <>
      <div className="container py-4 mx-auto">
        <Card className="max-w-2xl mx-auto shadow-md dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold heading-primary">Édition de l'Installation N°{installation.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-lg font-semibold heading-secondary">Nom du poste</h1>
                <Input
                  type="text"
                  id="nomPoste"
                  name="nomPoste"
                  value={installation.nomPoste}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold heading-secondary">Nom de l'utilisateur</h1>
                <Input
                  type="text"
                  id="nomUtilisateur"
                  name="nomUtilisateur"
                  value={installation.nomUtilisateur}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold heading-secondary">Organisation</h1>
                <Input
                  type="text"
                  id="organisation"
                  name="organisation"
                  value={installation.organisation}
                  onChange={handleInputChange}
                  disabled
                  className="bg-gray-100 input dark:bg-slate-700 dark:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold heading-secondary">Numéro de facture</h1>
                <Input
                  type="text"
                  id="numeroFacture"
                  name="numeroFacture"
                  value={installation.numeroFacture}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold heading-secondary">Date de facture</h1>
                <Input
                  type="date"
                  id="dateFacture"
                  name="dateFacture"
                  value={installation.dateFacture}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={Object.keys(changes).length === 0}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="dialog-content">
            <DialogHeader>
              <DialogTitle className="heading-primary">Confirmer les modifications</DialogTitle>
              <DialogDescription className="text-muted">
                Voulez-vous vraiment appliquer ces modifications ?");
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {Object.entries(changes).map(([field, value]) => (
                <div key={field} className="card-section card-section-secondary">
                  <p className="text-sm font-medium heading-secondary">{field}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm status-badge">
                      {originalInstallation?.[field as keyof Installation]}
                    </span>
                    <span className="text-muted">→</span>
                    <span className="text-sm status-badge status-success">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="btn-secondary"
              >
                Annuler
              </Button>
              <Button
                onClick={confirmUpdate}
                className="btn-primary"
              >
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ToastContainer theme="dark" />
    </>
  );
}
