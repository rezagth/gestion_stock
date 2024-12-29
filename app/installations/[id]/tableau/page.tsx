'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AiOutlineLoading } from "react-icons/ai";

interface Materiel {
  id: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  typeMateriel: string;
  dateInstallation: string;
  status: 'INSTALLE' | 'REMPLACE' | 'EN_REPARATION';
  materielRemplace?: Materiel;
}

interface Installation {
  id: number;
  nom: string;
  client: string;
  boutique: string;
  organisation: string;
  numeroFacture: string;
  dateFacture: string;
  materiels: Materiel[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED';
}

export default function TableauInstallation() {
  const { id } = useParams();
  const [data, setData] = useState<Installation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMateriel, setSelectedMateriel] = useState<Materiel | null>(null);
  const [replacementMateriel, setReplacementMateriel] = useState<Materiel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/installations/${id}`);
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    console.log('selectedMateriel changed:', selectedMateriel);
    const fetchReplacementMateriel = async () => {
      if (selectedMateriel && selectedMateriel.status === 'REMPLACE') {
        try {
          console.log('Fetching replacement for:', selectedMateriel.id);
          const response = await fetch(`/api/materiel-replacement/${selectedMateriel.id}`);
          const materielData = await response.json();
          
          console.log('Response:', materielData);
          
          if (response.ok) {
            setReplacementMateriel(materielData);
          } else {
            console.error('Erreur:', materielData.error);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du matériel de remplacement:', error);
        }
      }
    };

    fetchReplacementMateriel();
  }, [selectedMateriel]);

  const columnDefs = [
    {
      field: 'typeMateriel',
      headerName: 'Type de Matériel',
      editable: true,
      flex: 1,
      sortable: true,
      filter: true
    },
    {
      field: 'marque',
      headerName: 'Marque',
      editable: true,
      flex: 1,
      sortable: true,
      filter: true
    },
    {
      field: 'modele',
      headerName: 'Modèle',
      editable: true,
      flex: 1,
      sortable: true,
      filter: true
    },
    {
      field: 'numeroSerie',
      headerName: 'Numéro de Série',
      editable: true,
      flex: 1,
      sortable: true,
      filter: true
    },
    {
      field: 'dateInstallation',
      headerName: "Date d'Installation",
      editable: true,
      flex: 1,
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        return params.value ? format(new Date(params.value), 'dd/MM/yyyy', { locale: fr }) : '';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      editable: true,
      flex: 1,
      sortable: true,
      filter: true
    }
  ];

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Charger le logo
    const logoURL = '/logo.png'; // Chemin exact du logo
    const logo = new Image();
    logo.src = logoURL;

    logo.onload = () => {
      // Dimensions et position du logo
      const logoWidth = 50;
      const logoHeight = 20;
      const logoX = 14;
      const logoY = 10;

      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Ajouter un titre principal sous le logo
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text('Checklist Expédition', logoX, logoY + logoHeight + 15);

      // Ligne horizontale sous le titre
      doc.setDrawColor(200, 200, 200);
      doc.line(logoX, logoY + logoHeight + 20, doc.internal.pageSize.width - 14, logoY + logoHeight + 20);

      // Date de livraison à droite
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Date de livraison: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`,
        doc.internal.pageSize.width - 14,
        logoY + 15,
        { align: 'right' }
      );

      // Section: Informations de l'installation
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text('Informations sur l’installation', logoX, logoY + logoHeight + 35);

      // Ligne horizontale sous le sous-titre
      doc.setDrawColor(200, 200, 200);
      doc.line(logoX, logoY + logoHeight + 38, doc.internal.pageSize.width - 14, logoY + logoHeight + 38);

      // Informations détaillées
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      doc.text(
        [
          `Installation: ${data.nom}`,
          `Client: ${data.client}`,
          `Boutique: ${data.boutique}`,
          `Organisation: ${data.organisation}`,
          `N° Facture: ${data.numeroFacture}`,
          `Date Facture: ${data.dateFacture
            ? format(new Date(data.dateFacture), 'dd/MM/yyyy', { locale: fr })
            : 'N/A'
          }`,
        ],
        logoX,
        logoY + logoHeight + 48
      );

      // Ajouter un espace entre les sections
      const tableStartY = logoY + logoHeight + 100;

      // Section: Tableau des matériels
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text('Détails des matériels', logoX, tableStartY - 10);

      // Ligne horizontale sous le titre du tableau
      doc.setDrawColor(200, 200, 200);
      doc.line(logoX, tableStartY - 8, doc.internal.pageSize.width - 14, tableStartY - 8);

      // Configuration du tableau
      const headers = [
        'Type de Matériel',
        'Marque',
        'Modèle',
        'N° Série',
        'Date Installation',
        'Status',  // Assurez-vous que 'Status' est bien dans les en-têtes
      ];

      // Traitement des données pour le tableau
      const rows = data.materiels.map((materiel) => [
        materiel.typeMateriel || '',
        materiel.marque || '',
        materiel.modele || '',
        materiel.numeroSerie || '',
        materiel.dateInstallation
          ? format(new Date(materiel.dateInstallation), 'dd/MM/yyyy', { locale: fr })
          : '',
        materiel.status || '',
      ]);

      // Définition des largeurs de colonnes fixes
      const columnStyles = {
        0: { cellWidth: 35 }, // Type de Matériel
        1: { cellWidth: 30 }, // Marque
        2: { cellWidth: 30 }, // Modèle
        3: { cellWidth: 35 }, // N° Série
        4: { cellWidth: 27 }, // Date Installation
        5: { cellWidth: 25 }, // Status (INSTALLE REMPLACE)
      };

      // Utilisation de `autoTable` avec texte qui se met à la ligne si nécessaire
      (doc as any).autoTable({
        startY: tableStartY,
        head: [headers],
        body: rows,
        theme: 'striped',
        styles: {
          fontSize: 11,
          cellPadding: 2,
          textColor: [0, 0, 0],
          lineColor: [180, 180, 180],
          lineWidth: 0.3,
          overflow: 'linebreak', // Force le texte à se mettre à la ligne
          columnWidth: 'auto', // Garder la largeur des colonnes constante
        },
        headStyles: {
          fillColor: [52, 152, 219], // Bleu clair
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: columnStyles,
        margin: { left: 14, right: 14 },
        tableWidth: 'auto', // Ajuste automatiquement la largeur des colonnes
      });

      // Signature et date en bas de page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      const signatureY = pageHeight - 10;

      doc.text('Signature:', logoX, signatureY);

      // Dessiner une ligne pour la signature
      doc.line(logoX, signatureY + 10, logoX + 100, signatureY + 10);

      // Ajouter une barre de séparation au bas de la page
      doc.setDrawColor(200, 200, 200);
      doc.line(logoX, signatureY - 10, doc.internal.pageSize.width - 14, signatureY - 10);

      // Date à droite
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Date: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`,
        doc.internal.pageSize.width - 50,
        signatureY
      );

      // Sauvegarde du fichier
      doc.save(`export_${data.boutique}_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF généré avec succès');
    };

    logo.onerror = () => {
      console.error('Erreur lors du chargement du logo');
      toast.error('Impossible de charger le logo');
    };
  };

  const openDialog = (materiel: Materiel) => {
    console.log('Opening dialog for materiel:', materiel);
    setSelectedMateriel(materiel);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    console.log('Closing dialog');
    setIsDialogOpen(false);
    setSelectedMateriel(null);
    setReplacementMateriel(null);
  };

  const getBadgeStyles = (status: string) => {
    switch (status) {
      case "REMPLACE":
        return "bg-red-300 text-red-800 hover:bg-red-400 hover:text-red-900 shadow-sm";
      case "INSTALLE":
        return "bg-green-300 text-green-800 hover:bg-green-400 hover:text-green-900 shadow-sm";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900 shadow-sm";
    }
  };

  if (loading) {
    // skeleton loading
    return (
      <div className="space-y-6 p-6">
        {/* Bloc 1 */}
        <Skeleton className="h-48 w-full bg-gray-200 animate-pulse rounded-lg"></Skeleton>
        {/* Bloc 2 */}
        <Skeleton className="h-48 w-full bg-gray-200 animate-pulse rounded-lg"></Skeleton>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-end mb-4 ">
        {/* bouton qui exporte en pdf */}
        <Button onClick={generatePDF} className="bg-blue-600">
          Exporter en PDF
        </Button>
      </div>
      <Card>
        <CardHeader className="flex justify-between items-center text-lg">
          <CardTitle>Installation n°{data?.id}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Nom:</strong> {data?.nom}</p>
                <p><strong>Client:</strong> {data?.client}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Boutique:</strong> {data?.boutique}</p>
                <p><strong>Organisation:</strong> {data?.organisation}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Facturation</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>N° Facture:</strong> {data?.numeroFacture}</p>
                <p><strong>Date:</strong> {data?.dateFacture ? format(new Date(data.dateFacture), 'dd/MM/yyyy', { locale: fr }) : 'Pas de date'}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matériels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>N° Série</TableHead>
                <TableHead>Date Installation</TableHead>
                <TableHead>Status</TableHead>
                {data?.materiels.some(m => m.status === 'REMPLACE') && (
                  <TableHead>Action</TableHead>
                )}

              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.materiels.map((materiel) => (
                <TableRow key={materiel.id}>
                  <TableCell>{materiel.typeMateriel}</TableCell>
                  <TableCell>{materiel.marque}</TableCell>
                  <TableCell>{materiel.modele}</TableCell>
                  <TableCell>{materiel.numeroSerie}</TableCell>
                  <TableCell>{format(new Date(materiel.dateInstallation), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                  <TableCell>
                    <Badge className={`transition-all duration-200 ${getBadgeStyles(materiel.status)}`}>
                      {materiel.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Afficher le bouton "Detail" uniquement si le statut est "REMPLACE" */}
                    {materiel.status === 'REMPLACE' && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          console.log('Detail button clicked for materiel:', materiel);
                          openDialog(materiel);
                        }}
                      >
                        Détail
                      </Button>
                    )}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Dialog - Détails du matériel */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="w-[500px] p-6">
          <DialogHeader>
            <DialogTitle>Matériel remplacé par : {replacementMateriel?.typeMateriel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {replacementMateriel ? (
              <>
                <p><strong>Type:</strong> {replacementMateriel.typeMateriel}</p>
                <p><strong>Marque:</strong> {replacementMateriel.marque}</p>
                <p><strong>Modèle:</strong> {replacementMateriel.modele}</p>
                <p><strong>N° Série:</strong> {replacementMateriel.numeroSerie}</p>
                <p>
                  <strong>Date du remplacement: </strong>
                  {replacementMateriel.dateInstallation
                    ? format(new Date(replacementMateriel.dateInstallation), 'dd/MM/yyyy', { locale: fr })
                    : 'Date non disponible'}
                </p>
              </>
            ) : (
              <div className="flex justify-center items-center h-full">
                <AiOutlineLoading className="animate-spin text-3xl" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={closeDialog}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
