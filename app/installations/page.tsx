'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Installation, Materiel } from '@prisma/client';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast, useToast } from '@/hooks/use-toast';
import { FaPlus, FaTools, FaBoxOpen, FaCalendarAlt, FaBarcode, FaEdit, FaTrashAlt, FaWrench, FaBox, FaTable } from 'react-icons/fa';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


type InstallationWithDetails = Installation & { materiels: Materiel[]; };

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<InstallationWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrgs, setExpandedOrgs] = useState<{ [key: string]: boolean }>({});
  const [showReplacedMaterials, setShowReplacedMaterials] = useState(false);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);
  


  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const response = await fetch('/api/installations');
        if (!response.ok) {
          throw new Error('Échec de la récupération des installations');
        }
        const data = await response.json();
        setInstallations(data);
      } catch (err) {
        setError("Erreur lors du chargement des installations");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les installations",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstallations();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/installations/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Échec de la suppression de l\'installation');
      }
      setInstallations(installations.filter(installation => installation.id !== id));
      toast({
        title: "Succès",
        description: "Installation supprimée avec succès",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la suppression de l'installation",
      });
    }
  };

  const filteredInstallations = useMemo(() => {
    return installations.filter(installation =>
      installation.materiels.some(materiel =>
        materiel.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      installation.numeroFacture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.boutique?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.organisation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [installations, searchTerm]);

  const groupedInstallations = useMemo(() => {
    const groups: { [key: string]: InstallationWithDetails[] } = {};
    filteredInstallations.forEach(installation => {
      const org = installation.organisation || 'Sans organisation';
      if (!groups[org]) {
        groups[org] = [];
      }
      groups[org].push(installation);
    });
    return groups;
  }, [filteredInstallations]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-6 mb-4" />
                <Skeleton className="h-4 mb-2" />
                <Skeleton className="h-4 mb-2" />
                <Skeleton className="h-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-100 text-red-800 p-4 mx-auto mt-10">
        {error}
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Liste des Installations</h1>
        <Button asChild className="bg-blue-100 text-blue-600 hover:bg-blue-200">
          <Link href="/installations/nouvelle" className="py-2 px-4 rounded-md flex items-center">
            <FaPlus className="mr-2" />
            Nouvelle Installation
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Input
          type="text"
          placeholder="Rechercher par nom, numéro de série, numéro de facture ou boutique"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="show-replaced"
            checked={showReplacedMaterials}
            onCheckedChange={setShowReplacedMaterials}
          />
          <Label htmlFor="show-replaced">Afficher les matériels remplacés</Label>
        </div>
      </div>

      {Object.keys(groupedInstallations).length === 0 ? (
        <Card className="text-center p-8">Aucune installation trouvée.</Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {Object.entries(groupedInstallations).map(([org, orgInstallations]) => (
            <AccordionItem key={org} value={org}>
              <AccordionTrigger>{org}</AccordionTrigger>
              <AccordionContent>
                {orgInstallations.map((installation) => (
                  <Card key={installation.id} className="mb-4">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">{installation.nom}</h3>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Organisation</TableCell>
                            <TableCell>{installation.organisation}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Client</TableCell>
                            <TableCell>{installation.client}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Boutique</TableCell>
                            <TableCell>{installation.boutique}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Numéro de Facture</TableCell>
                            <TableCell>{installation.numeroFacture || 'Non spécifié'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Date de Facture</TableCell>
                            <TableCell>{installation.dateFacture ? new Date(installation.dateFacture).toLocaleDateString('fr-FR') : 'Non spécifiée'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Date de création</TableCell>
                            <TableCell>{new Date(installation.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Matériels Installés</h4>
                        {installation.materiels.filter(materiel => materiel.status === 'INSTALLE').map(materiel => (
                          <Badge key={materiel.id} variant="outline" className="mr-2 mb-2 text-green-700 bg-green-100 hover:bg-green-200">
                            {materiel.typeMateriel} 
                          </Badge>
                        ))}
                      </div>

                      {showReplacedMaterials && installation.materiels.some(materiel => materiel.status === 'REMPLACE') && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Matériels Remplacés</h4>
                          {installation.materiels.filter(materiel => materiel.status === 'REMPLACE').map(materiel => (
                            <Badge key={materiel.id} variant="outline" className="mr-2 mb-2 text-red-700 bg-red-100 hover:bg-red-200">
                              {materiel.typeMateriel}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="justify-end space-x-2">
                      <Button asChild variant="outline" className='bg-blue-100 text-blue-600 hover:bg-blue-200'>
                        <Link href={`/installations/${installation.id}/edit`}>
                          <FaEdit className="mr-2 " /> Modifier
                        </Link>
                      </Button>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" >
                            <FaTrashAlt className="mr-2" /> Supprimer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmer la suppression de ({installation.nom})</DialogTitle>
                            <DialogDescription>
                              Êtes-vous sûr de vouloir supprimer cette installation ? Cette action est irréversible.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={closeDialog}>Annuler</Button>
                            <Button variant="destructive" onClick={() => handleDelete(installation.id)}>Supprimer</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button asChild variant="outline" className='bg-blue-100 text-blue-600 hover:bg-blue-200'>
                        <Link href={`/installations/${installation.id}/tableau`}>
                          <FaTable className="mr-2" /> Voir en détail
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
