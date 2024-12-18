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

    // En-tête
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text('Checklist Expédition', 14, 20);

    // Date de livraison en haut a droite avec champs pour la signature
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date de livraison: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, doc.internal.pageSize.width - 15, 20, { align: 'right' });

    // Informations de l'installation
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text([
      `Installation: ${data.nom}`,
      `Client: ${data.client}`,
      `Boutique: ${data.boutique}`,
      `Organisation: ${data.organisation}`,
      `N° Facture: ${data.numeroFacture}`,
      `Date Facture: ${data.dateFacture ?
        format(new Date(data.dateFacture), 'dd/MM/yyyy', { locale: fr }) : '-'}`
    ], 14, 35);

    // Configuration du tableau
    const headers = [
      'Type de Matériel',
      'Marque',
      'Modèle',
      'N° Série',
      'Date Installation',
      'Status'
    ];


    const rows = data.materiels.map(materiel => [
      materiel.typeMateriel || '',
      materiel.marque || '',
      materiel.modele || '',
      materiel.numeroSerie || '',
      materiel.dateInstallation ? format(new Date(materiel.dateInstallation), 'dd/MM/yyyy', { locale: fr }) : '',
      materiel.status || '',

    ]);

    (doc as any).autoTable({
      startY: 80,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1

      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      }
    });

    //ajout du champ de signature en bas a droite
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text('Signature:', doc.internal.pageSize.width - 50, pageHeight - 30);
    doc.rect(doc.internal.pageSize.width - 50, pageHeight - 25, 45, 20);

    doc.save(`export_${data.boutique}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success('PDF généré avec succès');
  };

  if (loading) {
    //centrer le contenu
    return <div className='flex justify-center '>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Card Installation */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Informations Générales</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-600 min-w-[100px]">Nom:</span>
                      <span className="font-medium text-gray-900">{data?.nom}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 min-w-[100px]">Client:</span>
                      <span className="font-medium text-gray-900">{data?.client}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Localisation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-600 min-w-[100px]">Boutique:</span>
                      <span className="font-medium text-gray-900">{data?.boutique}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 min-w-[100px]">Organisation:</span>
                      <span className="font-medium text-gray-900">{data?.organisation}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Facturation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-600 min-w-[100px]">N° Facture:</span>
                      <span className="font-medium text-gray-900">{data?.numeroFacture}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 min-w-[100px]">Date:</span>
                      <span className="font-medium text-gray-900">
                        {data?.dateFacture ?
                          format(new Date(data.dateFacture), 'dd/MM/yyyy', { locale: fr }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Matériels */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Matériels</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.materiels.map((materiel, index) => (
                <div key={materiel.id || index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">{materiel.typeMateriel}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${materiel.status === 'actif' ? 'bg-green-100 text-green-800' :
                        materiel.status === 'inactif' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {materiel.status}
                    </span>
                  </div>

                  <div className="space-y-2">
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
                        {materiel.dateInstallation ?
                          format(new Date(materiel.dateInstallation), 'dd/MM/yyyy', { locale: fr }) : '-'}
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
