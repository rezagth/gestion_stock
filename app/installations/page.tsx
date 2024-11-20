'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Installation, Materiel } from '@prisma/client';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FaChevronDown, FaChevronUp, FaPlus, FaTools, FaBoxOpen, FaCalendarAlt, FaBarcode, FaEdit, FaTrashAlt, FaWrench, FaBox } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type InstallationWithDetails = Installation & { materiels: Materiel[]; };

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<InstallationWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrgs, setExpandedOrgs] = useState<{ [key: string]: boolean }>({});

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
        toast.error("Erreur lors du chargement des installations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstallations();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette installation ?')) {
      try {
        const response = await fetch(`/api/installations/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Échec de la suppression de l\'installation');
        }
        setInstallations(installations.filter(installation => installation.id !== id));
        toast.success('Installation supprimée avec succès');
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors de la suppression de l\'installation');
      }
    }
  };

  const handleDeleteMateriel = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce matériel ?')) {
      try {
        const response = await fetch(`/api/materiels/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Échec de la suppression du matériel');
        }
        toast.success('Matériel supprimé avec succès');
        // Recharger les installations après suppression
        setInstallations(installations.map(installation => ({
          ...installation,
          materiels: installation.materiels.filter(materiel => materiel.id !== id)
        })));
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors de la suppression du matériel');
      }
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

  const toggleOrg = (org: string) => {
    setExpandedOrgs(prev => ({ ...prev, [org]: !prev[org] }));
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <div className="grid grid-cols-1 gap-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6 bg-white border rounded-lg shadow-lg">
            <Skeleton className="h-6 mb-4" />
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-4 mb-2" />
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Liste des Installations</h1>
        <Link href="/installations/nouvelle" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md text-center w-full sm:w-auto">
          <FaPlus className="inline mr-2" /> Nouvelle Installation
        </Link>
      </div>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher par nom, numéro de série, numéro de facture ou boutique"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>
      {Object.keys(groupedInstallations).length === 0 ? (
        <Card className="text-gray-500 text-center text-lg bg-white p-8 rounded-lg shadow">Aucune installation trouvée.</Card>
      ) : (
        Object.entries(groupedInstallations).map(([org, orgInstallations]) => (
          <Card key={org} className="mb-6 bg-white border rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-100 flex justify-between items-center cursor-pointer" onClick={() => toggleOrg(org)}>
              <h2 className="text-xl font-semibold text-gray-800">{org}</h2>
              {expandedOrgs[org] ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedOrgs[org] && (
              <div className="p-4">
                {orgInstallations.map((installation) => (
                  <div key={installation.id} className="mb-4 last:mb-0 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{installation.nom}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                      <div>
                        <p className="text-gray=600"><span className="font-medium text-gray=700">Organisation:</span> {installation.organisation || 'Non spécifiée'}</p>
                        <p className="text-gray=600"><span className="font-medium text-gray=700">Client:</span> {installation.client}</p>
                        <p className="text-gray=600"><span className="font-medium text-gray=700">Boutique:</span> {installation.boutique}</p>
                      </div>
                      <div>
                        <p className="text-gray=600"><span className="font-medium text-gray=700">Numéro de Facture:</span> {installation.numeroFacture || 'Non spécifié'}</p>
                        <p className="text-gray=600"><span className="font-medium text-gray=700">Date de Facture:</span> {installation.dateFacture ? new Date(installation.dateFacture).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                        <p className="text-gray=600"><span className="font-medium text-gray=700">Date de création:</span> {new Date(installation.dateCreation).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      {/* Matériels Installés */}
                      <div className="w-1/2">
                        <h5 className="font-medium text-blue-600 mb-2 flex items-center">
                          <FaTools className="mr-2" />
                          Matériels Installés
                        </h5>
                        <div>
                          {installation.materiels.filter(materiel => materiel.status === 'INSTALLE').map(materiel => (
                            <div key={materiel.id} className="p-4 bg-blue-50 rounded-md shadow-md mb-4">
                              <p className="font-bold text-blue-600">{materiel.marque} {materiel.modele}</p>
                              <p className="text-sm text-gray-600"> <FaBox className="inline mr-1" /><span>Type: </span> {materiel.typeMateriel}</p>
                              <p className="text-sm text-gray-600"><FaBarcode className="inline mr-1" /> S/N: {materiel.numeroSerie}</p>
                              <p className="text-sm text-gray-600"><FaCalendarAlt className="inline mr-1" /> Installé le: {new Date(materiel.dateInstallation).toLocaleDateString('fr-FR')}</p>
                              
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Matériels Remplacés */}
                      {installation.materiels.some(materiel => materiel.status === 'REMPLACE') && (
                        <div className="w-1/2">
                          <h5 className="font-medium text-red-600 mb-2 flex items-center">
                            <FaBoxOpen className="mr-2" />
                            Matériels Remplacés
                          </h5>
                          <div>
                            {installation.materiels.filter(materiel => materiel.status === 'REMPLACE').map(materiel => (
                              <div key={materiel.id} className="p-4 bg-red-50 rounded-md shadow-md mb-4">
                                <p className="font-bold text-red-600">{materiel.marque} {materiel.modele}</p>
                                <p className="text-sm text-gray-600"> <FaBox className="inline mr-1" /><span>Type: </span> {materiel.typeMateriel}</p>
                                <p className="text-sm text-gray-600"><FaBarcode className="inline mr-1" /> S/N: {materiel.numeroSerie}</p>
                                <p className="text-sm text-gray-600"><FaCalendarAlt className="inline mr-1" /> Remplacé le: {new Date(materiel.dateInstallation).toLocaleDateString('fr-FR')}</p>
                                
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Boutons Modifier et Supprimer */}
                    <div className="flex justify-end mt-4">
                      <Link href={`/installations/${installation.id}/edit`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration=300 mr-2">
                        <FaEdit className="mr-2" /> Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(installation.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration=300">
                        <FaTrashAlt className="mr-2" /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
