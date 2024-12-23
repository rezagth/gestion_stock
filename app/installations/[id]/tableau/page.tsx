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
import { Skeleton } from '@/components/ui/skeleton';

interface Installation {
  id: number;
  nom: string;
  client: string;
  boutique: string;
  organisation: string;
  numeroFacture: string;
  dateFacture: string;
  materiels: any[];
}

export default function TableauInstallation() {
  const { id } = useParams();
  const [data, setData] = useState<Installation | null>(null);
  const [loading, setLoading] = useState(true);

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
  
      // Dessiner un cadre autour du logo pour une meilleure structure
      // doc.rect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 'S');
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
          `N° Facture: ${data.numeroFacture} N/A`,
          `Date Facture: ${
            data.dateFacture
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
        // Remplacer "installé" par "I" et "remplacement" par "R"
        materiel.status === 'installé' ? 'I' :
        materiel.status === 'remplacement' ? 'R' : materiel.status || '',  // Afficher "I" ou "R" pour status
      ]);
  
      // Définition des largeurs de colonnes fixes
      const columnStyles = {
        0: { cellWidth: 35 }, // Type de Matériel
        1: { cellWidth: 30 }, // Marque
        2: { cellWidth: 30 }, // Modèle
        3: { cellWidth: 35 }, // N° Série
        4: { cellWidth: 27 }, // Date Installation
        5: { cellWidth: 25 }, // Status (I/R)
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

  
  if (loading) {
    // skeleton loading
    return (
      <div className="space-y-6 p-6">
        {/* Bloc 1 */}
      <Skeleton className="h-48 w-full bg-gray-200  animate-pulse rounded-lg"></Skeleton>
      {/* Bloc 2 */}
      <Skeleton className="h-48 w-full bg-gray-200  animate-pulse rounded-lg"></Skeleton>
   
    </div>
    )
  }

  return (
   <div className="min-h-screen bg-gray-50 p-6">
  <div className="max-w-7xl mx-auto space-y-8">
    {/* Card Installation */}
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Installation n°{data?.id}
          </h1>         
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Exporter en PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informations Générales */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Informations Générales</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">Nom: </span>
                  <span className="font-medium text-gray-900">{data?.nom}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">Client: </span>
                  <span className="font-medium text-gray-900">{data?.client}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Localisation</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[100px]">Boutique:</span>
                  <span className="font-medium text-gray-900">{data?.boutique}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[110px]">Organisation:</span>
                  <span className="font-medium text-gray-900">{data?.organisation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Facturation */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Facturation</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[100px]">N° Facture:</span>
                  <span className="font-medium text-gray-900">{data?.numeroFacture}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[100px]">Date:</span>
                  <span className="font-medium text-gray-900">
                    {data?.dateFacture ? format(new Date(data.dateFacture), 'dd/MM/yyyy', { locale: fr }) : 'Pas de date'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Section Matériels */}
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Matériels</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.materiels.map((materiel, index) => (
            <div key={materiel.id || index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-semibold text-lg text-gray-900">{materiel.typeMateriel}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${materiel.status === 'actif' ? 'bg-green-100 text-green-800' :
                    materiel.status === 'inactif' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {materiel.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[100px]">Marque:</span>
                  <span className="font-medium text-gray-900">{materiel.marque}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[100px]">Modèle:</span>
                  <span className="font-medium text-gray-900">{materiel.modele}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[100px]">N° Série:</span>
                  <span className="font-medium text-gray-900">{materiel.numeroSerie}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[100px]">Installation:</span>
                  <span className="font-medium text-gray-900">
                    {materiel.dateInstallation ? format(new Date(materiel.dateInstallation), 'dd/MM/yyyy', { locale: fr }) : '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
