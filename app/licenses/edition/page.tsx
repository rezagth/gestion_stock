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
      <div>
        <h1>Chargement ...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-4">
        <Card className="shadow-md max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Édition de l'Installation N°{installation.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-lg font-semibold">Nom du poste</h1>
                <Input
                  type="text"
                  id="nomPoste"
                  name="nomPoste"
                  value={installation.nomPoste}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold">Nom de l'utilisateur</h1>
                <Input
                  type="text"
                  id="nomUtilisateur"
                  name="nomUtilisateur"
                  value={installation.nomUtilisateur}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold">Organisation</h1>
                <Input
                  type="text"
                  id="organisation"
                  name="organisation"
                  value={installation.organisation}
                  onChange={handleInputChange}
                  disabled
                  className="bg-gray-100 text-black-500"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold">Numéro de facture</h1>
                <Input
                  type="text"
                  id="numeroFacture"
                  name="numeroFacture"
                  value={installation.numeroFacture}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold">Date de facture</h1>
                <Input
                  type="date"
                  id="dateFacture"
                  name="dateFacture"
                  value={installation.dateFacture}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full mt-4">Enregistrer les modifications</Button>
            </form>
          </CardContent>
        </Card>
        <ToastContainer />
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer les modifications</DialogTitle>
            {Object.keys(changes).length > 0 ? (
              <>
                <DialogDescription>Voici les modifications que vous avez effectuées :</DialogDescription>
                <ul className="mt-4 space-y-2">
                  {Object.entries(changes).map(([key, value]) => (
                    <li key={key} className="text-sm text-gray-700">
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <DialogDescription>Aucune modification détectée.</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            {Object.keys(changes).length > 0 && (
              <Button onClick={confirmUpdate}>Confirmer</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
